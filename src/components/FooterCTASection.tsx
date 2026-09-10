"use client";

import React from "react";
import Image from "next/image";

export default function FooterCTASection() {
  return (
    <footer className="relative w-full min-h-[70vh] md:min-h-[80vh] flex flex-col justify-between overflow-hidden bg-black text-white border-t border-white/[0.08]">
      {/* Background Landscape Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/footer_landscape_clean.png"
          alt="Arcana Seascape Night"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-65 mix-blend-screen"
        />
        {/* Soft Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070707] via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* Top Spacer */}
      <div className="h-12" />

      {/* Center Call to Action */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-[0.15em] text-neutral-100 uppercase font-normal leading-tight">
          CHOOSE YOUR CARD.
        </h2>

        <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-neutral-400 mt-4">
          SAME PASSION. A BRIGHTER WORLD.
        </p>

        <a
          href="#"
          className="mt-8 md:mt-10 inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-white/30 bg-black/40 backdrop-blur-md font-mono text-xs tracking-[0.25em] uppercase text-neutral-200 hover:text-black hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_35px_rgba(255,255,255,0.25)] group cursor-pointer"
        >
          <span>Explore Collection</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>

      {/* Bottom Footer Bar */}
      <div className="relative z-10 w-full border-t border-white/10 px-8 md:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-black/70 backdrop-blur-sm">
        {/* Left Brand info */}
        <div className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase leading-relaxed text-center sm:text-left">
          <div className="font-semibold text-neutral-300">ARCANA</div>
          <div>TRADING CARD CO.</div>
        </div>

        {/* Center Minimal Copyright / Watermark */}
        <div className="font-serif text-sm text-neutral-600 select-none">
          ✦
        </div>

        {/* Right Info */}
        <div className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase leading-relaxed text-center sm:text-right">
          <div>EST. 2025</div>
          <div>FOR COLLECTORS WORLDWIDE.</div>
        </div>
      </div>
    </footer>
  );
}
