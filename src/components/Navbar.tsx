"use client";

import React from "react";

export default function Navbar() {
  return (
    <header className="w-full z-40 flex items-center justify-between px-8 md:px-16 py-5 bg-transparent border-b border-white/[0.08] transition-all duration-300">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="font-serif text-base md:text-lg tracking-[0.3em] uppercase text-neutral-200">
          ARCANA
        </span>
        <span className="text-neutral-500 text-xs font-serif">
          ✦
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="hidden sm:flex items-center gap-10 md:gap-14 text-[11px] font-mono tracking-[0.28em] uppercase text-neutral-400">
        <span className="hover:text-white transition-colors cursor-pointer">
          Cinematic
        </span>
        <span className="hover:text-white transition-colors cursor-pointer">
          The Game
        </span>
        <span className="hover:text-white transition-colors cursor-pointer">
          Collection
        </span>
      </nav>

      {/* Timeline Indicator in thin pill outline */}
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-400 border border-white/20 rounded-full px-3.5 py-1">
        <span className="text-neutral-500">TIMELINE:</span>{" "}
        <span id="timeline-percentage" className="text-neutral-300">00%</span>
      </div>
    </header>
  );
}
