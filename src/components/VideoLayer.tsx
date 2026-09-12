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

/**
 * VideoLayer
 * 
 * Hardware-accelerated transparent video layer.
 * Displays the alpha-keyed WebM cinematic film with native browser GPU compositing.
 */
export const VideoLayer = forwardRef<HTMLVideoElement, VideoLayerProps>(
  (
    {
      src,
      onLoadedMetadata,
      className = "",
    },
    ref
  ) => {
    return (
      <div
        className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent select-none pointer-events-none ${className}`}
      >
        <video
          ref={ref}
          src={src}
          playsInline
          muted
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedMetadata={onLoadedMetadata}
          className="w-full h-full object-contain pointer-events-none select-none max-h-screen relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
          style={{ willChange: "transform" }}
        />
      </div>
    );
  }
);

VideoLayer.displayName = "VideoLayer";

export default VideoLayer;
