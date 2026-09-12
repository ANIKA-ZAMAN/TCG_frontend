const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const ffmpegPath = path.resolve(rootDir, "node_modules", "ffmpeg-static", "ffmpeg.exe");
const inputVideo = path.resolve(rootDir, "public", "videos", "tcg demo animation.mp4");
const outputVideo = path.resolve(rootDir, "public", "videos", "tcg_demo_transparent.webm");

const width = 1920;
const height = 1080;
const frameBytes = width * height * 4;

console.log("=== Starting Chroma Key Extraction & WebM VP9 Alpha Encoding ===");
console.log(`Input: ${inputVideo}`);
console.log(`Output: ${outputVideo}`);

const ffmpegIn = spawn(ffmpegPath, [
  "-i", inputVideo,
  "-f", "rawvideo",
  "-pix_fmt", "rgba",
  "-"
]);

const ffmpegOut = spawn(ffmpegPath, [
  "-f", "rawvideo",
  "-pixel_format", "rgba",
  "-video_size", `${width}x${height}`,
  "-framerate", "24",
  "-i", "-",
  "-c:v", "libvpx-vp9",
  "-pix_fmt", "yuva420p",
  "-auto-alt-ref", "0",
  "-crf", "18",
  "-b:v", "0",
  "-g", "12",
  "-deadline", "good",
  "-cpu-used", "2",
  "-y",
  outputVideo
]);

ffmpegIn.stderr.on("data", (data) => {});

ffmpegOut.stderr.on("data", (data) => {
  const msg = data.toString();
  if (msg.includes("frame=") || msg.includes("fps=")) {
    process.stdout.write(`\r[FFmpeg VP9] ${msg.trim()}`);
  }
});

let leftover = Buffer.alloc(0);
let frameIndex = 0;
const totalExpectedFrames = 240;
const bgRB = 64 / 255.0;

ffmpegIn.stdout.on("data", (chunk) => {
  const total = Buffer.concat([leftover, chunk]);
  const numFrames = Math.floor(total.length / frameBytes);

  for (let f = 0; f < numFrames; f++) {
    const frameBuf = total.subarray(f * frameBytes, (f + 1) * frameBytes);

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      let r = frameBuf[idx];
      let g = frameBuf[idx + 1];
      let b = frameBuf[idx + 2];

      const rf = r / 255.0;
      const gf = g / 255.0;
      const bf = b / 255.0;

      const maxRB = Math.max(rf, bf);
      const avgRB = (rf + bf) * 0.5;

      const excessG = gf - maxRB;
      const vfxLift = Math.max(0, avgRB - bgRB);

      let a = 1.0;

      if (excessG > 0.05) {
        let vfxAlpha = 0.0;
        if (vfxLift > 0.025) {
          const t = Math.min(1.0, Math.max(0.0, (vfxLift - 0.025) / (0.36 - 0.025)));
          vfxAlpha = t * t * (3.0 - 2.0 * t);
        }

        let edgeAlpha = 0.0;
        if (excessG < 0.35) {
          const et = (excessG - 0.08) / (0.35 - 0.08);
          const clampedEt = Math.min(1.0, Math.max(0.0, et));
          edgeAlpha = 1.0 - clampedEt * clampedEt * (3.0 - 2.0 * clampedEt);
        }

        a = Math.max(edgeAlpha, vfxAlpha);
      } else {
        a = 1.0;
      }

      if (gf > maxRB) {
        if (vfxLift > 0.025) {
          g = Math.round(maxRB * 255);
        } else {
          const targetG = maxRB * 0.95 + avgRB * 0.05;
          g = Math.round(Math.min(gf, targetG) * 255);
        }
      }

      if (a < 0.005) {
        a = 0.0;
        r = 0;
        g = 0;
        b = 0;
      }

      frameBuf[idx] = r;
      frameBuf[idx + 1] = g;
      frameBuf[idx + 2] = b;
      frameBuf[idx + 3] = Math.round(a * 255);
    }

    ffmpegOut.stdin.write(frameBuf);
    frameIndex++;
    if (frameIndex % 24 === 0) {
      console.log(`\nProcessed ${frameIndex}/${totalExpectedFrames} frames (${Math.round((frameIndex / totalExpectedFrames) * 100)}%)`);
    }
  }

  leftover = total.subarray(numFrames * frameBytes);
});

ffmpegIn.stdout.on("end", () => {
  console.log(`\nAll frames sent to encoder. Finalizing WebM file...`);
  ffmpegOut.stdin.end();
});

ffmpegOut.on("close", (code) => {
  console.log(`\nWebM VP9 Alpha processing finished with exit code ${code}`);
  if (code === 0) {
    const stats = fs.statSync(outputVideo);
    console.log(`Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }
});
