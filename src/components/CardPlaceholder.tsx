"use client";

import React from "react";

export interface CardPlaceholderProps {
  number?: string;
  name?: string;
  rarity?: string;
  className?: string;
}

/**
 * CardPlaceholder
 * 
 * Physical trading card structural placeholder.
 * Strictly adheres to standard 2.5 : 3.5 TCG physical dimensions.
 * Completely devoid of fake artwork or AI graphics.
 */
export default function CardPlaceholder({
  number = "NO. 001",
  name = "CARD NAME",
  rarity = "MYTHIC",
  className = "",
}: CardPlaceholderProps) {
  return (
    <div
      className={`relative w-full aspect-[2.5/3.5] rounded-sm bg-[#0d0d0c] border border-white/[0.08] p-3 flex flex-col justify-between select-none transition-all duration-300 hover:border-white/25 hover:-translate-y-1 ${className}`}
    >
      {/* Subtle Inner Bezel Guideline */}
      <div className="absolute inset-1.5 border border-white/[0.025] rounded-xs pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-mono tracking-[0.2em] text-neutral-400 uppercase">
        <span>{number}</span>
        <span className="text-[10px] text-neutral-500">✦</span>
      </div>

      {/* Empty Artwork Area Placeholder */}
      <div className="relative z-10 w-full aspect-[1/0.88] rounded-xs border border-white/[0.04] bg-[#070706] flex items-center justify-center my-auto">
        <span className="text-white/[0.08] text-xs font-mono select-none">
          +
        </span>
      </div>

      {/* Card Footer Info */}
      <div className="relative z-10 flex items-end justify-between font-mono">
        <div>
          <div className="text-[10px] tracking-[0.18em] text-neutral-300 uppercase font-medium">
            {name}
          </div>
          <div className="text-[8px] tracking-[0.25em] text-neutral-500 uppercase mt-0.5">
            {rarity}
          </div>
        </div>

        <div className="text-[8px] tracking-[0.2em] text-neutral-600 uppercase">
          GEN 01
        </div>
      </div>
    </div>
  );
}
