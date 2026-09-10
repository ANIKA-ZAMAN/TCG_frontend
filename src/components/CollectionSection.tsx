"use client";

import React from "react";
import CardPlaceholder from "./CardPlaceholder";

const PLACEHOLDER_CARDS = [
  { number: "NO. 001", name: "CELESTIAL", rarity: "SERIES 01" },
  { number: "NO. 002", name: "INFERNAL", rarity: "SERIES 01" },
  { number: "NO. 003", name: "AQUATIC", rarity: "SERIES 01" },
  { number: "NO. 004", name: "PRIMAL", rarity: "SERIES 01" },
  { number: "NO. 005", name: "VOID", rarity: "SERIES 01" },
];

export default function CollectionSection() {
  return (
    <section
      id="collection"
      className="relative w-full bg-[#080807] text-white py-24 md:py-32 px-8 md:px-16 border-t border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 mb-12 border-b border-white/[0.06]">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-500 flex items-center gap-2">
              FEATURED
              <span className="text-xs">✦</span>
            </span>
            <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl uppercase tracking-wider text-neutral-100 mt-2 font-normal">
              THE COLLECTION
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

        {/* 5 Cards Across (Desktop), 2 Cards Across (Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6 lg:gap-7">
          {PLACEHOLDER_CARDS.map((card) => (
            <CardPlaceholder
              key={card.number}
              number={card.number}
              name={card.name}
              rarity={card.rarity}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
