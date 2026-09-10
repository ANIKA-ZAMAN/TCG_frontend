"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { VideoLayer } from "./VideoLayer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollVideoHeroProps {
  videoSrc?: string;
  scrollDistance?: string; // 800vh - 1200vh (default 1000vh)
}

export default function ScrollVideoHero({
  videoSrc = "/videos/tcg demo animation.mp4",
  scrollDistance = "1000vh",
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

    // 1. Lenis smooth scrolling configuration (single synchronized scroll system)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
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

    // 2. Continuous timeline state & non-blocking seek controller
    const scrubState = { time: 0 };
    let isSeeking = false;
    let rafId: number | null = null;
    let tweenInstance: gsap.core.Tween | null = null;

    // Non-blocking seek: only queues seek when browser is ready to decode next frame
    const performSeek = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;

      const smoothTime = Math.min(
        Math.max(0, scrubState.time),
        video.duration - 0.001
      );

      if (!video.seeking && !isSeeking) {
        if (Math.abs(video.currentTime - smoothTime) > 0.008) {
          isSeeking = true;
          video.currentTime = smoothTime;
        }
      }
    };

    const onSeeked = () => {
      isSeeking = false;
      performSeek();
    };

    video.addEventListener("seeked", onSeeked);

    // Render loop smoothly feeds GSAP's interpolated scrub time to the video decoder
    const renderLoop = () => {
      if (video && !video.seeking && isSeeking) {
        isSeeking = false;
      }
      performSeek();
      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    // 3. Initialize authoritative GSAP ScrollTrigger timeline once video metadata is ready
    const initTimeline = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;

      setIsLoaded(true);
      video.pause();
      video.currentTime = 0;
      scrubState.time = 0;

      const duration = video.duration;

      // Master continuous timeline: maps physical scroll across 1000vh directly to video duration
      // scrub: 1.5 provides heavy, weighted, cinematic momentum
      tweenInstance = gsap.to(scrubState, {
        time: duration,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          pin: pin,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Direct DOM updates (zero React state updates on scroll)
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }

            const timelineEl = document.getElementById("timeline-percentage");
            if (timelineEl) {
              timelineEl.textContent = `${Math.round(self.progress * 100)}%`;
            }

            if (scrollIndicatorRef.current) {
              const opacity = Math.max(0, 1 - self.progress * 18);
              scrollIndicatorRef.current.style.opacity = opacity.toString();
              scrollIndicatorRef.current.style.transform = `translate(-50%, ${self.progress * 30}px)`;
            }
          },
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

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

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
