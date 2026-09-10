"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CardData {
  number: string;
  name: string;
  element: string;
  image: string;
  color: string; // Tailwind hex or class
  glowColor: string;
  symbol: string;
}

const CARDS: CardData[] = [
  {
    number: "NO. 001",
    name: "CELESTIAL",
    element: "Light",
    image: "/images/card_celestial_art.png",
    color: "text-amber-400",
    glowColor: "rgba(251, 191, 36, 0.25)",
    symbol: "✦",
  },
  {
    number: "NO. 002",
    name: "INFERNAL",
    element: "Fire",
    image: "/images/card_infernal_art.png",
    color: "text-red-500",
    glowColor: "rgba(239, 68, 68, 0.25)",
    symbol: "✦",
  },
  {
    number: "NO. 003",
    name: "AQUATIC",
    element: "Frost",
    image: "/images/card_aquatic_art.png",
    color: "text-sky-400",
    glowColor: "rgba(56, 189, 248, 0.25)",
    symbol: "✦",
  },
  {
    number: "NO. 004",
    name: "PRIMAL",
    element: "Earth",
    image: "/images/card_primal_art.png",
    color: "text-emerald-400",
    glowColor: "rgba(52, 211, 153, 0.25)",
    symbol: "✦",
  },
  {
    number: "NO. 005",
    name: "VOID",
    element: "Shadow",
    image: "/images/card_void_art.png",
    color: "text-purple-400",
    glowColor: "rgba(192, 132, 252, 0.25)",
    symbol: "✦",
  },
];

export default function TheCollectionSection() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <section
      id="collection"
      className="relative w-full bg-[#070707] text-white py-24 md:py-32 px-6 md:px-16 border-t border-white/[0.08] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 mb-12 border-b border-white/10">
          <div className="flex flex-col items-start gap-2">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-500 flex items-center gap-2">
              FEATURED
              <span className="text-xs">✦</span>
            </span>
            <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl uppercase tracking-wider text-neutral-100 flex items-center gap-3 font-normal">
              THE COLLECTION
              <span className="text-sm font-serif text-neutral-400">✦</span>
            </h2>
          </div>

          <a
            href="#"
            className="font-mono text-xs tracking-[0.25em] uppercase text-neutral-400 hover:text-white flex items-center gap-2 transition-colors group cursor-pointer"
          >
            <span>View All</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        {/* 5 Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {CARDS.map((card, idx) => {
            const isHovered = activeCard === idx;

            return (
              <div
                key={card.number}
                onMouseEnter={() => setActiveCard(idx)}
                onMouseLeave={() => setActiveCard(null)}
                className="group relative flex flex-col rounded-sm p-2 md:p-2.5 bg-[#0e0e11] border border-white/10 transition-all duration-500 ease-out cursor-pointer hover:-translate-y-2"
                style={{
                  boxShadow: isHovered
                    ? `0 12px 35px ${card.glowColor}, 0 0 15px rgba(255,255,255,0.05)`
                    : "0 4px 15px rgba(0,0,0,0.6)",
                  borderColor: isHovered
                    ? "rgba(255, 255, 255, 0.4)"
                    : "rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Thin Inner Frame Outline */}
                <div className="absolute inset-1 border border-white/[0.04] rounded-xs pointer-events-none" />

                {/* Card Artwork Box */}
                <div className="relative w-full aspect-[4/5] rounded-xs overflow-hidden bg-neutral-950 border border-white/[0.08]">
                  <Image
                    src={card.image}
                    alt={`${card.name} trading card`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />

                  {/* Subtle Holographic Shimmer Line on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </div>

                {/* Card Info Footer */}
                <div className="mt-2.5 px-1 flex items-center justify-between font-mono">
                  <div className="flex flex-col">
                    <span className="text-[9px] tracking-[0.2em] text-neutral-500 uppercase">
                      {card.number}
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-neutral-200 uppercase mt-0.5 group-hover:text-white transition-colors">
                      {card.name}
                    </span>
                  </div>

                  {/* Elemental Sparkle Star */}
                  <span
                    className={`text-xs font-serif ${card.color} transition-transform duration-300 group-hover:scale-125`}
                  >
                    {card.symbol}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
