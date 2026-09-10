"use client";

import React from "react";
import Image from "next/image";

export default function TheGameSection() {
  return (
    <section
      id="game"
      className="relative w-full bg-[#070707] text-white py-28 md:py-36 px-6 md:px-16 border-t border-white/[0.08] overflow-hidden"
    >
      {/* Subtle Right Watermark Celestial Graphic */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] rounded-full border border-white/[0.03] pointer-events-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] rounded-full border border-white/[0.02]" />
        <span className="text-white/[0.02] font-serif text-[280px] select-none absolute">
          ✦
        </span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Column: Vertical Text + Framed Portal Artwork */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row items-start gap-8 md:gap-10">
          {/* Side Monospace Annotation */}
          <div className="font-mono text-[11px] tracking-[0.25em] text-neutral-400 uppercase leading-relaxed shrink-0">
            <div>MORE</div>
            <div>THAN</div>
            <div>A GAME.</div>
            <div className="mt-8">A LIVING</div>
            <div>UNIVERSE.</div>
          </div>

          {/* Framed Cinematic Portal Image */}
          <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-sm overflow-hidden border border-white/15 bg-neutral-900/60 shadow-[0_0_35px_rgba(0,0,0,0.8)] group">
            <Image
              src="/images/game_portal_clean.png"
              alt="Arcana Citadel Portal"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Right Column: Section Tag + Headline + Copy + CTA */}
        <div className="lg:col-span-6 flex flex-col items-start">
          {/* Tag + Horizontal Line */}
          <div className="w-full flex items-center gap-4 mb-6">
            <span className="font-mono text-xs tracking-[0.25em] text-neutral-400 uppercase flex items-center gap-2">
              THE GAME
              <span className="text-[10px] text-neutral-300">✦</span>
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          {/* Main Headline */}
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight text-neutral-100 font-normal leading-[1.1] mb-6">
            A NEW ERA OF
            <br />
            COLLECTING.
          </h2>

          {/* Description */}
          <p className="font-sans text-neutral-400 text-sm md:text-base leading-relaxed font-light max-w-xl mb-10">
            Arcana is a next-generation trading card game where art, strategy,
            and imagination meet. Discover a world of legendary cards, rare
            stories, and a global community of collectors and players.
          </p>

          {/* Button */}
          <a
            href="#collection"
            className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.2em] uppercase px-7 py-3.5 rounded-full border border-white/20 text-neutral-200 hover:text-black hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] group cursor-pointer"
          >
            <span>Explore The World</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
