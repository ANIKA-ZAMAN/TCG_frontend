"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

  // Background landing page refs
  const editorialLeftRef = useRef<HTMLDivElement>(null);
  const editorialRightRef = useRef<HTMLDivElement>(null);
  const arcaneCircleRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const phaseBadgeRef = useRef<HTMLSpanElement>(null);

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

            // Smoothly fade editorial text so cards remain the hero as scroll progresses
            const fade = Math.max(0.18, 1 - self.progress * 1.6);
            if (editorialLeftRef.current) {
              editorialLeftRef.current.style.opacity = fade.toString();
              editorialLeftRef.current.style.transform = `translateY(${self.progress * -22}px)`;
            }
            if (editorialRightRef.current) {
              editorialRightRef.current.style.opacity = fade.toString();
              editorialRightRef.current.style.transform = `translateY(${self.progress * -22}px)`;
            }

            // Parallax on background watermark and sacred circle
            if (watermarkRef.current) {
              watermarkRef.current.style.transform = `translate(-50%, calc(-50% + ${self.progress * 35}px)) scale(${1 + self.progress * 0.04})`;
            }
            if (arcaneCircleRef.current) {
              arcaneCircleRef.current.style.transform = `translate(-50%, -50%) rotate(${self.progress * 40}deg) scale(${1 + self.progress * 0.06})`;
            }

            // Dynamic phase badge
            if (phaseBadgeRef.current) {
              let phase = "01 // THE SEALED PACK";
              if (self.progress > 0.78) phase = "04 // CRITICAL ASCENSION";
              else if (self.progress > 0.45) phase = "03 // THE 3D FAN";
              else if (self.progress > 0.15) phase = "02 // UNSEALING RITUAL";
              phaseBadgeRef.current.textContent = phase;
            }

            if (scrollIndicatorRef.current) {
              const opacity = Math.max(0, 1 - self.progress * 16);
              scrollIndicatorRef.current.style.opacity = opacity.toString();
              scrollIndicatorRef.current.style.transform = `translateY(${self.progress * 20}px)`;
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
      className="relative w-full bg-[#07080a] text-white select-none"
    >
      {/* 100vh Pinned Viewport Stage */}
      <div
        ref={pinRef}
        className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between bg-[#07080a] text-white"
      >
        {/* ========================================================= */}
        {/* 1. ATMOSPHERIC BACKDROP & SUBTLE ENVIRONMENT (BEHIND VIDEO) */}
        {/* ========================================================= */}

        {/* Deep ambient vignette & subtle golden radial warmth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(215,165,85,0.06)_0%,_rgba(10,12,16,0.3)_45%,_#07080a_85%)] pointer-events-none z-0" />

        {/* Far-left shadowy rock silhouette */}
        <div className="absolute left-0 top-0 bottom-0 w-[24vw] max-w-[320px] pointer-events-none opacity-20 mix-blend-screen z-0">
          <Image
            src="/images/env_left_v2.png"
            alt=""
            fill
            priority
            sizes="24vw"
            className="object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#07080a]/50 to-[#07080a]" />
        </div>

        {/* Far-right shadowy rock silhouette */}
        <div className="absolute right-0 top-0 bottom-0 w-[24vw] max-w-[320px] pointer-events-none opacity-20 mix-blend-screen z-0">
          <Image
            src="/images/env_right_v2.png"
            alt=""
            fill
            priority
            sizes="24vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#07080a]/50 to-[#07080a]" />
        </div>

        {/* Massive Architectural Brand Watermark */}
        <div
          ref={watermarkRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[15vw] font-extralight tracking-[0.28em] text-white/[0.025] select-none pointer-events-none whitespace-nowrap z-0"
        >
          ARCANA
        </div>

        {/* Arcane Sacred Geometry Rings */}
        <div
          ref={arcaneCircleRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] max-w-[85vw] max-h-[85vw] rounded-full border border-white/[0.035] pointer-events-none flex items-center justify-center z-0 transition-transform duration-75"
        >
          <div className="w-[82%] h-[82%] rounded-full border border-white/[0.02]" />
          <div className="w-[58%] h-[58%] rounded-full border border-dashed border-white/[0.025]" />
          <div className="absolute w-[120%] h-[1px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
          <div className="absolute h-[120%] w-[1px] bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />

          {/* Subtle cardinal runes */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-amber-500/30 font-serif">✦</span>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-amber-500/30 font-serif">✦</span>
          <span className="absolute top-1/2 -left-3 -translate-y-1/2 text-[9px] text-amber-500/30 font-serif">✦</span>
          <span className="absolute top-1/2 -right-3 -translate-y-1/2 text-[9px] text-amber-500/30 font-serif">✦</span>
        </div>

        {/* Dark Stone Floor Reflection at Base */}
        <div className="absolute bottom-0 left-0 right-0 h-[18vh] min-h-[120px] max-h-[170px] pointer-events-none z-0">
          <Image
            src="/images/env_floor_reflection.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom opacity-35 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-[#07080a]/40 to-transparent" />
        </div>

        {/* Minimal Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#07080a] transition-opacity duration-500">
            <div className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] uppercase text-neutral-400">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Loading Cinematic Film...
            </div>
          </div>
        )}

        {/* Spacer for Top Navbar */}
        <div className="w-full h-20 pointer-events-none" />

        {/* ========================================================= */}
        {/* 2. MAIN COMPOSITION: EDITORIAL FLANKS + CENTRAL VIDEO      */}
        {/* ========================================================= */}
        <div className="relative z-10 flex-1 flex items-center justify-between px-6 sm:px-10 md:px-14 lg:px-16 max-w-[1780px] mx-auto w-full">
          {/* Left Editorial Flank */}
          <div
            ref={editorialLeftRef}
            className="hidden lg:flex flex-col justify-between h-[64vh] max-h-[520px] pointer-events-none z-10 w-[280px] shrink-0"
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-[1px] bg-amber-500/60" />
                <span className="font-mono text-[9px] tracking-[0.32em] uppercase text-amber-500/80">
                  Series 01 // Genesis
                </span>
              </div>
              <h1 className="font-serif text-base xl:text-lg tracking-[0.24em] text-neutral-200 uppercase leading-[1.5]">
                A World In
                <br />
                Every Card.
              </h1>
              <p className="mt-3 font-serif text-[11px] text-neutral-400 leading-relaxed font-light tracking-wide">
                Forged in ancient shadow. Crafted with physical cold-foil stamping and 360gsm museum linen.
              </p>
            </div>

            <div className="flex items-center gap-3.5 border-l border-white/[0.08] pl-3.5">
              <div className="font-mono text-[9px] tracking-[0.26em] uppercase text-neutral-400 leading-[1.7]">
                <span className="text-neutral-500">FORMAT:</span> <span className="text-neutral-300">COLLECTIBLE TCG</span>
                <br />
                <span className="text-neutral-500">EDITION:</span> <span className="text-neutral-300">FIRST PRINTING</span>
                <br />
                <span className="text-neutral-500">CHRONICLE:</span> <span className="text-amber-500/70">EST. 2025</span>
              </div>
            </div>
          </div>

          {/* Central Cinematic Video Layer */}
          <div className="flex-1 flex items-center justify-center my-auto px-2 relative z-20 w-full">
            <div className="relative w-full max-w-[1220px] max-h-[76vh] aspect-video flex items-center justify-center select-none">
              {/* Soft warm spotlight behind the reveal */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(215,165,85,0.10)_0%,_rgba(160,110,45,0.02)_40%,_transparent_70%)] blur-2xl pointer-events-none -z-10" />

              {/* Real-time Hardware Chroma-Key Compositor */}
              <VideoLayer
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full"
              />

              {/* Physical ground shadow beneath booster pack */}
              <div className="absolute -bottom-4 w-[40%] h-6 bg-[radial-gradient(ellipse_at_center,_rgba(215,165,85,0.18)_0%,_transparent_70%)] blur-sm pointer-events-none" />
            </div>
          </div>

          {/* Right Editorial Flank */}
          <div
            ref={editorialRightRef}
            className="hidden lg:flex flex-col justify-between h-[64vh] max-h-[520px] items-end text-right pointer-events-none z-10 w-[280px] shrink-0"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs text-amber-500/80 font-serif mb-2">✦</span>
              <div className="font-mono text-[10px] xl:text-[11px] tracking-[0.34em] text-neutral-300 uppercase leading-[1.8]">
                Collect
                <br />
                Trade
                <br />
                Ascend
              </div>
              <div className="mt-4 flex items-center gap-1.5 font-mono text-[8px] tracking-[0.22em] text-neutral-400 uppercase">
                <span className="px-2 py-0.5 border border-white/[0.08] rounded-full">Primal</span>
                <span className="px-2 py-0.5 border border-white/[0.08] rounded-full">Infernal</span>
                <span className="px-2 py-0.5 border border-white/[0.08] rounded-full">Void</span>
              </div>
            </div>

            <div className="flex flex-col items-end border-r border-white/[0.08] pr-3.5">
              <div className="w-5 h-[1px] bg-amber-500/60 mb-2" />
              <span className="font-serif text-[10px] tracking-[0.26em] uppercase text-neutral-300">
                Tactile Artifacts
              </span>
              <span className="font-mono text-[8px] tracking-[0.22em] text-neutral-500 mt-1 uppercase">
                Museum Quality / 350+ Variants
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. BOTTOM TIMELINE & STATUS HUD                           */}
        {/* ========================================================= */}
        <div className="relative z-30 w-full pb-4 px-8 flex flex-col items-center gap-2">
          {/* Subtle Phase Status */}
          <div className="flex items-center gap-4 text-[9px] font-mono tracking-[0.3em] uppercase text-neutral-500">
            <span ref={phaseBadgeRef} className="text-amber-500/80">01 // THE SEALED PACK</span>
            <span className="text-neutral-700">•</span>
            <span className="text-neutral-400">ARCANA PROTOCOL</span>
          </div>

          {/* Minimal Subtle Scroll Prompt */}
          <div
            ref={scrollIndicatorRef}
            className="flex items-center gap-2 pointer-events-none transition-transform"
          >
            <div className="w-3.5 h-6 border border-neutral-700 rounded-full flex items-start justify-center p-0.5">
              <div className="w-1 h-1 bg-amber-400/80 rounded-full animate-bounce" />
            </div>
            <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-neutral-500">
              Scroll to unseal
            </span>
          </div>
        </div>

        {/* 1px Bottom Timeline Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-900 z-30">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 origin-left scale-x-0 transition-transform duration-75 ease-out"
          />
        </div>
      </div>
    </div>
  );
}
