"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Navbar from "./Navbar";
import VideoLayer from "./VideoLayer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  videoSrc?: string;
  scrollDistance?: string; // 800vh provides slow, luxurious cinematic pacing
}

export default function Hero({
  videoSrc = "/videos/tcg_demo_transparent.webm",
  scrollDistance = "800vh",
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const pin = pinRef.current;

    if (!video || !container || !pin) return;

    // 0. Reset scroll restoration to manual so refresh always starts at 0%
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    ScrollTrigger.clearScrollMemory("manual");
    window.scrollTo(0, 0);

    const onBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    // 1. Lenis smooth scrolling (momentum-weighted physical glide)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      syncTouch: false,
    });

    lenis.scrollTo(0, { immediate: true });
    lenis.on("scroll", ScrollTrigger.update);

    const onTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTicker);
    gsap.ticker.lagSmoothing(0);

    // 2. High-performance non-blocking seek controller
    const scrubState = { time: 0 };
    let isSeeking = false;
    let rafId: number | null = null;
    let tweenInstance: gsap.core.Tween | null = null;

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

    const renderLoop = () => {
      if (video && !video.seeking && isSeeking) {
        isSeeking = false;
      }
      performSeek();
      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    // 3. GSAP ScrollTrigger timeline pinned across scroll track
    const initTimeline = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;

      video.pause();
      video.currentTime = 0;
      scrubState.time = 0;

      const duration = video.duration;

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
            // Direct DOM timeline percentage update (zero React renders on scroll)
            const timelineEl = document.getElementById("timeline-percentage");
            if (timelineEl) {
              const pct = Math.round(self.progress * 100);
              timelineEl.textContent = `${pct < 10 ? "0" + pct : pct}%`;
            }

            // Smoothly fade out the scroll prompt on initial scroll
            if (scrollIndicatorRef.current) {
              const opacity = Math.max(0, 1 - self.progress * 16);
              scrollIndicatorRef.current.style.opacity = opacity.toString();
              scrollIndicatorRef.current.style.transform = `translateY(${self.progress * 24}px)`;
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

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("resize", handleResize);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", initTimeline);

      if (rafId) cancelAnimationFrame(rafId);
      if (tweenInstance) {
        if (tweenInstance.scrollTrigger) tweenInstance.scrollTrigger.kill();
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
      className="relative w-full bg-[#080807] text-white select-none"
    >
      {/* 100vh Pinned Viewport Stage */}
      <section
        ref={pinRef}
        className="relative w-full h-screen overflow-hidden bg-[#080807] text-white flex flex-col justify-between select-none"
      >
        {/* 1. Atmospheric Background Layers */}

        {/* Subtle Radial Ambient Warmth & Dark Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(215,165,85,0.05)_0%,_rgba(8,8,7,0.4)_50%,_#080807_90%)] pointer-events-none z-0" />

        {/* Far Left Shadowy Rock Silhouettes */}
        <div className="absolute left-0 top-0 bottom-0 w-[26vw] max-w-[340px] pointer-events-none opacity-30 mix-blend-screen z-0">
          <Image
            src="/images/env_left_v2.png"
            alt=""
            fill
            priority
            sizes="26vw"
            className="object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#080807]/60 to-[#080807]" />
        </div>

        {/* Far Right Shadowy Rock Silhouettes */}
        <div className="absolute right-0 top-0 bottom-0 w-[26vw] max-w-[340px] pointer-events-none opacity-30 mix-blend-screen z-0">
          <Image
            src="/images/env_right_v2.png"
            alt=""
            fill
            priority
            sizes="26vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#080807]/60 to-[#080807]" />
        </div>

        {/* Very Subtle Circular Celestial Geometry behind Product */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] max-w-[85vw] max-h-[85vw] rounded-full border border-white/[0.035] pointer-events-none flex items-center justify-center z-1">
          <div className="w-[82%] h-[82%] rounded-full border border-white/[0.02]" />
          <div className="w-[55%] h-[55%] rounded-full border border-white/[0.015]" />
          <div className="absolute w-full h-[1px] bg-white/[0.02]" />
          <div className="absolute h-full w-[1px] bg-white/[0.02]" />
        </div>

        {/* Dark Stone Floor with Wet Reflections across bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[22vh] min-h-[140px] max-h-[190px] pointer-events-none z-1">
          <Image
            src="/images/env_floor_reflection.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom opacity-75 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#080807]/30 to-[#080807]" />
        </div>

        {/* 2. Top Navigation */}
        <div className="relative z-30 w-full">
          <Navbar />
        </div>

        {/* 3. Main Composition Grid (Editorial Framing + Central Cinematic Video) */}
        <div className="relative z-20 flex-1 flex items-center justify-between px-8 sm:px-12 md:px-16 lg:px-20 max-w-[1720px] mx-auto w-full">
          {/* Left Editorial Column */}
          <div className="hidden sm:flex flex-col justify-between h-[68vh] max-h-[560px] py-2 pointer-events-none z-20">
            <div className="flex flex-col items-start">
              <div className="w-6 h-[1px] bg-neutral-600 mb-3" />
              <h2 className="font-serif text-xs md:text-sm tracking-[0.24em] text-neutral-300 uppercase leading-[1.6]">
                A WORLD
                <br />
                IN EVERY CARD.
              </h2>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-[1px] h-9 bg-neutral-600" />
              <div className="font-mono text-[9px] md:text-[10px] tracking-[0.26em] text-neutral-400 uppercase leading-[1.6]">
                <span className="text-neutral-500">SERIES 01</span>
                <br />
                <span className="text-neutral-300 font-medium">SHADOWED REALM</span>
                <br />
                <span className="text-neutral-500">/ 2025</span>
              </div>
            </div>
          </div>

          {/* Center Cinematic Video Stage (Single Authoritative Cinematic Film) */}
          <div className="flex-1 flex items-center justify-center my-auto px-2 relative z-10 w-full">
            <div className="relative w-full max-w-[1240px] max-h-[74vh] aspect-video flex items-center justify-center select-none">
              {/* Soft warm spotlight centered directly behind the video animation */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(215,165,85,0.18)_0%,_rgba(160,110,45,0.06)_40%,_transparent_72%)] blur-3xl pointer-events-none -z-10" />

              {/* Real-Time Hardware-Accelerated Chroma-Key Video Compositor */}
              <VideoLayer
                ref={videoRef}
                src={videoSrc}
                onFirstFrameReady={() => setIsVideoReady(true)}
                className="w-full h-full"
              />

              {/* Instant-load visual placeholder until first video frame is decoded */}
              {!isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
                  <div className="relative w-[280px] sm:w-[320px] aspect-[1/1.676] drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
                    <Image
                      src="/images/arcana_booster_pack.png"
                      alt="ARCANA Booster Pack"
                      fill
                      priority
                      sizes="320px"
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Physical ground reflection beneath the booster pack */}
              <div className="absolute -bottom-6 w-[45%] h-8 bg-[radial-gradient(ellipse_at_center,_rgba(215,165,85,0.35)_0%,_rgba(100,70,30,0.15)_35%,_transparent_75%)] blur-md pointer-events-none" />
            </div>
          </div>

          {/* Right Editorial Column */}
          <div className="hidden sm:flex flex-col justify-between h-[68vh] max-h-[560px] py-2 items-end text-right pointer-events-none z-20">
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-400 font-serif mb-2">
                ✦
              </span>
              <div className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] text-neutral-300 uppercase leading-[1.7]">
                COLLECT
                <br />
                TRADE
                <br />
                BELONG
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="w-6 h-[1px] bg-neutral-600 mb-3" />
              <div className="font-mono text-[9px] md:text-[10px] tracking-[0.26em] text-neutral-400 uppercase leading-[1.6] max-w-[220px]">
                COLLECTIBLE OBJECTS
                <br />
                FOR A BRIGHTER
                <br />
                IMAGINATION.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Center Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="relative z-30 pb-4 flex flex-col items-center gap-2 pointer-events-none transition-all duration-150"
        >
          <span className="text-[9px] font-mono tracking-[0.35em] uppercase text-neutral-400">
            SCROLL TO EXPLORE
          </span>
          <div className="w-[1px] h-7 bg-gradient-to-b from-neutral-400 via-neutral-600 to-transparent" />
        </div>
      </section>
    </div>
  );
}
