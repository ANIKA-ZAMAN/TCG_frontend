"use client";

import React, { useEffect, useState } from "react";

export default function ExtractPage() {
  const [status, setStatus] = useState("Loading video...");

  useEffect(() => {
    async function run() {
      const video = document.createElement("video");
      video.src = "/videos/tcg demo animation.mp4";
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      await new Promise((res) => {
        video.onloadedmetadata = () => res(null);
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;

      const steps = [0.15, 0.17, 0.19, 0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27];
      for (let i = 0; i < steps.length; i++) {
        const p = steps[i];
        video.currentTime = Math.min(p * video.duration, video.duration - 0.01);
        await new Promise((res) => {
          video.onseeked = () => res(null);
        });
        ctx.drawImage(video, 0, 0);
        const data = canvas.toDataURL("image/png");
        const name = `rip_${Math.round(p * 100).toString().padStart(3, "0")}`;
        await fetch("/api/save-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, data }),
        });
        setStatus(`Saved ${name}`);
      }
      setStatus("Done!");
    }
    run().catch((e) => setStatus("Error: " + e.message));
  }, []);

  return (
    <div style={{ padding: 40, color: "white", background: "black", fontFamily: "monospace" }}>
      <h1>Extract Rip Frames</h1>
      <p>{status}</p>
    </div>
  );
}
