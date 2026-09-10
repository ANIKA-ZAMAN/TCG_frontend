"use client";

import React from "react";

export default function FinalCTA() {
  return (
    <footer className="relative w-full bg-[#080807] text-white border-t border-white/[0.06] flex flex-col justify-between overflow-hidden">
      {/* Subtle Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.015)_0%,_transparent_70%)] pointer-events-none" />

      {/* Center Call To Action Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-28 md:py-36 max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.18em] text-neutral-100 uppercase font-normal leading-tight">
          CHOOSE YOUR CARD.
        </h2>

        <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-neutral-400 mt-5 leading-relaxed">
          SAME PASSION.
          <br className="sm:hidden" /> A BRIGHTER WORLD.
        </p>

        <a
          href="#"
          className="mt-10 inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-white/20 font-mono text-xs tracking-[0.25em] uppercase text-neutral-300 hover:text-black hover:bg-white transition-all duration-300 group cursor-pointer"
        >
          <span>Explore Collection</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>

      {/* Minimal Bottom Footer Bar */}
      <div className="relative z-10 w-full border-t border-white/[0.06] px-8 md:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left Info */}
        <div className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed text-center sm:text-left">
          <div className="text-neutral-400 font-medium">ARCANA</div>
          <div>TRADING CARD CO.</div>
        </div>

        {/* Center Star Mark */}
        <div className="font-serif text-sm text-neutral-600 select-none">
          ✦
        </div>

        {/* Right Info */}
        <div className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed text-center sm:text-right">
          <div>EST. 2025</div>
          <div>FOR COLLECTORS WORLDWIDE.</div>
        </div>
      </div>
    </footer>
  );
}
