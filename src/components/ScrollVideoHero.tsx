"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { VideoLayer } from "./VideoLayer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ---------------------------------------------------------------------------
// Cinematic pacing curve
// ---------------------------------------------------------------------------
// Each point maps [scrollProgress, videoProgress].
// "Hold" zones use a wide scroll range for a tiny video range, forcing the
// user to dwell on that moment. "Slow" zones give more scroll-per-second
// than a linear mapping. The curve is continuous — no snapping.
// ---------------------------------------------------------------------------
const PACING_CURVE: [number, number][] = [
  [0.00, 0.00], // ── Start
  [0.12, 0.08], // ── ARRIVAL          (very slow – mystery)
  [0.22, 0.18], // ── DISCOVERY        (slow – anticipation)
  [0.35, 0.32], // ── OPEN             (moderate – pack opens)
  [0.50, 0.50], // ── EMERGENCE        (cards appearing)
  [0.63, 0.65], // ── FORMATION        (fan building)
  [0.70, 0.68], // ── FORMATION HOLD   (barely moves – payoff dwell)
  [0.80, 0.78], // ── EPIC SEPARATES   (slow separation)
  [0.90, 0.88], // ── EPIC REVEAL      (dramatic)
  [0.94, 0.90], // ── EPIC HOLD        (barely moves – hero moment)
  [0.98, 0.96], // ── EPIC RETURNS     (moderate return)
  [1.00, 1.00], // ── COLLECTION + FINAL HOLD
];

/** Piecewise-linear interpolation through PACING_CURVE. O(n) with n=12. */
function remapProgress(scrollP: number): number {
  if (scrollP <= 0) return 0;
  if (scrollP >= 1) return 1;

  for (let i = 1; i < PACING_CURVE.length; i++) {
    const [s0, v0] = PACING_CURVE[i - 1];
    const [s1, v1] = PACING_CURVE[i];
    if (scrollP <= s1) {
      const t = (scrollP - s0) / (s1 - s0);
      return v0 + t * (v1 - v0);
    }
  }
  return 1;
}

interface ScrollVideoHeroProps {
  videoSrc?: string;
  scrollDistance?: string; // 1200vh–1800vh (default 1600vh)
}

export default function ScrollVideoHero({
  videoSrc = "/videos/tcg_demo_transparent.webm",
  scrollDistance = "1600vh",
}: ScrollVideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const pin = pinRef.current;

    if (!video || !container || !pin) return;

    // 0. Force scroll to top on refresh / load
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    ScrollTrigger.clearScrollMemory("manual");
    window.scrollTo(0, 0);

    const onBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    // 1. Lenis smooth scrolling configuration (cinematic weighted scroll)
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
      syncTouch: false,
    });

    lenis.scrollTo(0, { immediate: true });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const onTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);

    // 2. Direct ref seek controller: prevents Chromium decoder frame skipping & jumps
    const scrubProxy = { progress: 0 };
    let targetTime = 0;
    let isSeeking = false;
    let tweenInstance: gsap.core.Tween | null = null;

    const performSeek = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;

      if (!video.seeking && !isSeeking) {
        if (Math.abs(video.currentTime - targetTime) > 0.002) {
          isSeeking = true;
          // Direct control via ref: video.currentTime = progress * video.duration
          video.currentTime = targetTime;
        }
      }
    };

    const onSeeked = () => {
      isSeeking = false;
      performSeek();
    };

    video.addEventListener("seeked", onSeeked);

    // 3. Initialize authoritative GSAP ScrollTrigger timeline with scrub: 2
    const initTimeline = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;

      setIsLoaded(true);
      video.pause();
      video.currentTime = 0;
      scrubProxy.progress = 0;
      targetTime = 0;

      // Master continuous timeline: maps physical scroll across 1600vh to video duration
      // via the PACING_CURVE remapping. scrub: 2 provides cinematic damping.
      tweenInstance = gsap.to(scrubProxy, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          pin: pin,
          scrub: 2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          if (!video || !video.duration || isNaN(video.duration)) return;

          const p = Math.min(Math.max(0, scrubProxy.progress), 1);
          // Cinematic pacing: remap scroll progress through the pacing curve
          // so important story beats get more breathing room
          const videoP = remapProgress(p);
          targetTime = Math.min(videoP * video.duration, video.duration - 0.001);
          performSeek();

          // Direct DOM updates (zero React state updates on scroll)
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${p})`;
          }

          const timelineEl = document.getElementById("timeline-percentage");
          if (timelineEl) {
            timelineEl.textContent = `${Math.round(p * 100)}%`;
          }

          if (scrollIndicatorRef.current) {
            const opacity = Math.max(0, 1 - p * 15);
            scrollIndicatorRef.current.style.opacity = opacity.toString();
            scrollIndicatorRef.current.style.transform = `translate(-50%, ${p * 30}px)`;
          }
        },
      });

      ScrollTrigger.refresh();
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    };

    if (video.readyState >= 1 && video.duration) {
      initTimeline();
    } else {
      video.addEventListener("loadedmetadata", initTimeline, { once: true });
    }

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    // 4. Clean up all listeners and instances on unmount
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("resize", handleResize);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", initTimeline);

      if (tweenInstance) {
        if (tweenInstance.scrollTrigger) {
          tweenInstance.scrollTrigger.kill();
        }
        tweenInstance.kill();
      }

      gsap.ticker.remove(onTicker);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: scrollDistance }}
      className="relative w-full bg-black text-white select-none"
    >
      {/* 100vh Pinned Viewport Stage */}
      <div
        ref={pinRef}
        className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-black"
      >
        {/* Subtle dark ambient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black pointer-events-none" />

        {/* Minimal Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black transition-opacity duration-500">
            <div className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] uppercase text-neutral-400">
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
              Loading Cinematic Film...
            </div>
          </div>
        )}

        {/* Cinematic Video Layer (Clean & Dominant) */}
        <div className="relative z-10 w-full h-full max-h-[92vh] flex items-center justify-center">
          <VideoLayer
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full"
          />
        </div>

        {/* Minimal Subtle Scroll Prompt */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none transition-transform"
        >
          <span className="text-[9px] font-mono tracking-[0.35em] uppercase text-neutral-400">
            Scroll to control film
          </span>
          <div className="w-4 h-7 border border-neutral-600 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-1.5 bg-neutral-300 rounded-full animate-bounce" />
          </div>
        </div>

        {/* 1px Bottom Timeline Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-900 z-30">
          <div
            ref={progressBarRef}
            className="h-full bg-neutral-300 origin-left scale-x-0 transition-transform duration-75 ease-out"
          />
        </div>
      </div>
    </div>
  );
}
