"use client";

import React from "react";

export default function GameSection() {
  return (
    <section
      id="game"
      className="relative w-full bg-[#080807] text-white py-28 md:py-36 px-8 md:px-16 border-t border-white/[0.06] overflow-hidden"
    >
      {/* Subtle Background Geometry */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] rounded-full border border-white/[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left Column: Asymmetric Editorial Structure */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-start gap-8">
          {/* Micro Annotation */}
          <div className="font-mono text-[10px] tracking-[0.28em] text-neutral-500 uppercase leading-relaxed shrink-0">
            <div>MORE</div>
            <div>THAN</div>
            <div>A GAME.</div>
            <div className="mt-8">A LIVING</div>
            <div>UNIVERSE.</div>
          </div>

          {/* Minimalist Architectural Frame */}
          <div className="relative w-full max-w-[360px] aspect-[4/3] rounded-xs border border-white/[0.08] bg-[#0c0c0b] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 tracking-[0.25em] uppercase">
              <span>ARCHIVE // 01</span>
              <span>✦</span>
            </div>

            <div className="my-auto text-center py-6">
              <span className="font-serif text-2xl tracking-[0.2em] text-neutral-300 uppercase">
                ARCANA
              </span>
              <p className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase mt-2">
                ORIGIN PROTOCOL
              </p>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-600 tracking-[0.2em]">
              <span>EDITION 01</span>
              <span>SERIES 2025</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Headline & Copy */}
        <div className="lg:col-span-7 flex flex-col items-start lg:pl-8">
          {/* Section Tag */}
          <div className="w-full flex items-center gap-4 mb-6">
            <span className="font-mono text-xs tracking-[0.28em] text-neutral-400 uppercase flex items-center gap-2">
              THE GAME
              <span className="text-[10px] text-neutral-500">✦</span>
            </span>
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
          </div>

          {/* Main Headline */}
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-neutral-100 font-normal leading-[1.08] mb-6">
            A NEW ERA OF
            <br />
            COLLECTING.
          </h2>

          {/* Supporting Paragraph */}
          <p className="font-sans text-neutral-400 text-sm md:text-base leading-relaxed font-light max-w-lg mb-8">
            Arcana is a next-generation trading card game built around worlds,
            characters and collectible stories.
          </p>

          {/* Restrained Action Link */}
          <a
            href="#collection"
            className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.22em] uppercase px-7 py-3 rounded-full border border-white/20 text-neutral-300 hover:text-black hover:bg-white transition-all duration-300 group cursor-pointer"
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
