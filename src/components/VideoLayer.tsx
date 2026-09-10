"use client";

import React, { forwardRef, useEffect, useRef } from "react";

export interface VideoLayerProps {
  src: string;
  onLoadedMetadata?: () => void;
  onFirstFrameReady?: () => void;
  className?: string;
  similarity?: number;
  smoothness?: number;
  spill?: number;
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
  v_texCoord = vec2((a_position.x + 1.0) * 0.5, (1.0 - a_position.y) * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform sampler2D u_texture;
uniform vec3 u_keyColor;
uniform float u_similarity;
uniform float u_smoothness;
uniform float u_spill;

varying vec2 v_texCoord;

// RGB to YCbCr (ITU-R BT.601) chrominance conversion
vec2 RGBtoUV(vec3 rgb) {
  return vec2(
    -0.168736 * rgb.r - 0.331264 * rgb.g + 0.5 * rgb.b,
     0.5 * rgb.r - 0.418688 * rgb.g - 0.081312 * rgb.b
  );
}

void main() {
  vec4 src = texture2D(u_texture, v_texCoord);
  vec3 color = src.rgb;

  float maxRB = max(color.r, color.b);
  float avgRB = (color.r + color.b) * 0.5;

  // Excess green over foreground threshold
  // Using a balanced mix between max(R, B) and avg(R, B)
  float rbLimit = mix(maxRB, avgRB, 0.25);
  float excessG = color.g - rbLimit;

  // Chrominance distance in UV space from the calibrated green screen color
  vec2 keyUV = RGBtoUV(u_keyColor);
  vec2 pixelUV = RGBtoUV(color);
  float chromaDist = distance(pixelUV, keyUV);

  // Alpha keying:
  // 1. Alpha based on green screen chroma distance
  float alphaChroma = smoothstep(u_similarity, u_similarity + u_smoothness, chromaDist);

  // 2. Alpha based on excess green:
  // Pure green screen has excessG ~ 0.45-0.55 -> alpha = 0
  // Edges & semi-transparent blends have excessG ~ 0.08-0.25 -> smooth anti-aliasing
  // Foreground cards/foil have excessG <= 0.03 -> alpha = 1
  float alphaG = 1.0 - smoothstep(0.04, 0.22, excessG);

  // Combine both: ensures background is completely transparent while foreground is solid
  float alpha = min(alphaChroma, alphaG);

  // Smooth border clamp to prevent any 1px edge bleeding from video compression
  vec2 edgeDist = min(v_texCoord, 1.0 - v_texCoord);
  float edgeAlpha = smoothstep(0.0, 0.005, min(edgeDist.x, edgeDist.y));
  alpha *= edgeAlpha;

  // Despill:
  // Cleanly neutralize any green bounce or edge bleeding
  if (color.g > maxRB) {
    // Pull green down to the foreground limit
    float targetG = mix(maxRB, avgRB, 0.5);
    color.g = mix(color.g, targetG, u_spill);
    // Ensure warm/golden balance on specular highlights & foil edges
    color.r = max(color.r, color.g * 1.02);
  }

  gl_FragColor = vec4(color * alpha, alpha);
}
`;

/**
 * VideoLayer
 * 
 * Real-Time GPU Chroma-Key Compositor.
 * Strips out the green screen background in real time using a dual-matte
 * excess-green + chrominance distance shader with anti-aliasing and despill,
 * while keeping the native video decoder un-throttled at full hardware speed.
 */
export const VideoLayer = forwardRef<HTMLVideoElement, VideoLayerProps>(
  (
    {
      src,
      onLoadedMetadata,
      className = "",
      similarity = 0.10,
      smoothness = 0.08,
      spill = 0.95,
    },
    forwardedRef
  ) => {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const textureRef = useRef<WebGLTexture | null>(null);

    const setVideoRef = (node: HTMLVideoElement | null) => {
      localVideoRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (
          forwardedRef as React.MutableRefObject<HTMLVideoElement | null>
        ).current = node;
      }
    };

    const drawKeyedFrame = () => {
      const video = localVideoRef.current;
      const canvas = canvasRef.current;
      const gl = glRef.current;
      const texture = textureRef.current;
      if (!video || !canvas || !gl || !texture || video.videoWidth === 0) return;

      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      try {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video
        );
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } catch {
        // Ignore frame upload during rapid seek transitions
      }
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      const video = localVideoRef.current;
      if (!canvas || !video) return;

      const gl = (canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      }) ||
        canvas.getContext("experimental-webgl", {
          alpha: true,
          premultipliedAlpha: false,
        })) as WebGLRenderingContext | null;

      if (!gl) return;
      glRef.current = gl;

      const compileShader = (type: number, source: string) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, source);
        gl.compileShader(s);
        return s;
      };

      const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
      const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
      if (!vs || !fs) return;

      const prog = gl.createProgram();
      if (!prog) return;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
        gl.STATIC_DRAW
      );

      const posLoc = gl.getAttribLocation(prog, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      // Calibrated green screen color: (49, 188, 58)
      gl.uniform3f(
        gl.getUniformLocation(prog, "u_keyColor"),
        49 / 255,
        188 / 255,
        58 / 255
      );
      gl.uniform1f(gl.getUniformLocation(prog, "u_similarity"), similarity);
      gl.uniform1f(gl.getUniformLocation(prog, "u_smoothness"), smoothness);
      gl.uniform1f(gl.getUniformLocation(prog, "u_spill"), spill);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(prog, "u_texture"), 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      textureRef.current = texture;

      // Trigger frame render whenever video decodes/seeks
      const onSeekedOrLoaded = () => {
        drawKeyedFrame();
      };

      video.addEventListener("seeked", onSeekedOrLoaded);
      video.addEventListener("loadeddata", onSeekedOrLoaded);
      video.addEventListener("timeupdate", onSeekedOrLoaded);

      // Native requestVideoFrameCallback for 60fps frame-accurate updates
      let isSubscribed = true;
      let rvfcId: number | null = null;

      type VideoWithRVFC = HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
        cancelVideoFrameCallback?: (id: number) => void;
      };

      const videoWithRVFC = video as VideoWithRVFC;

      let fallbackRafId: number | null = null;
      if (typeof videoWithRVFC.requestVideoFrameCallback === "function") {
        const onFrame = () => {
          if (!isSubscribed) return;
          drawKeyedFrame();
          rvfcId = videoWithRVFC.requestVideoFrameCallback!(onFrame);
        };
        rvfcId = videoWithRVFC.requestVideoFrameCallback(onFrame);
      } else {
        const loop = () => {
          if (!isSubscribed) return;
          drawKeyedFrame();
          fallbackRafId = requestAnimationFrame(loop);
        };
        fallbackRafId = requestAnimationFrame(loop);
      }

      if (video.readyState >= 2) {
        drawKeyedFrame();
      }

      return () => {
        isSubscribed = false;
        video.removeEventListener("seeked", onSeekedOrLoaded);
        video.removeEventListener("loadeddata", onSeekedOrLoaded);
        video.removeEventListener("timeupdate", onSeekedOrLoaded);
        if (rvfcId && typeof videoWithRVFC.cancelVideoFrameCallback === "function") {
          videoWithRVFC.cancelVideoFrameCallback(rvfcId);
        }
        if (fallbackRafId) {
          cancelAnimationFrame(fallbackRafId);
        }
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteTexture(texture);
        gl.deleteBuffer(posBuf);
      };
    }, [similarity, smoothness, spill]);

    return (
      <div
        className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent select-none pointer-events-none ${className}`}
      >
        {/* Real-time WebGL Chroma-Key Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none select-none max-h-screen relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
          style={{ willChange: "transform" }}
        />

        {/* Video element kept full-size so Chromium hardware decoder remains at 100% capacity */}
        <video
          ref={setVideoRef}
          src={src}
          playsInline
          muted
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedMetadata={onLoadedMetadata}
          className="w-full h-full object-contain pointer-events-none select-none max-h-screen absolute inset-0 -z-10 opacity-0"
        />
      </div>
    );
  }
);

VideoLayer.displayName = "VideoLayer";

export default VideoLayer;
