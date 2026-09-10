"use client";

import React, { forwardRef } from "react";
import Image from "next/image";

export interface CinematicPlaceholderProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * CinematicPlaceholder
 * 
 * Houses the single authoritative ARCANA booster pack object.
 * Positioned in the vertical center of the hero with ground contact reflection
 * and subtle back-lighting. Sized at 330–370px width (portrait).
 * 
 * Designed so that the future cinematic MP4 can be dropped directly into
 * this exact space without modifying any surrounding composition.
 */
export const CinematicPlaceholder = forwardRef<HTMLDivElement, CinematicPlaceholderProps>(
  ({ className = "", children }, ref) => {
    return (
      <div
        ref={ref}
        className={`cinematic-placeholder relative flex flex-col items-center justify-center select-none ${className}`}
      >
        {/* Subtle Warm Spotlight directly behind the product */}
        <div className="absolute -inset-16 bg-[radial-gradient(circle_at_center,_rgba(215,165,85,0.14)_0%,_rgba(160,110,45,0.05)_40%,_transparent_75%)] blur-2xl pointer-events-none -z-10" />

        {/* The One Booster Pack Object */}
        {children ? (
          children
        ) : (
          <div className="relative w-[290px] sm:w-[330px] md:w-[350px] aspect-[1/1.676] drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
            <Image
              src="/images/arcana_booster_pack.png"
              alt="ARCANA Booster Pack — Series 01 Shadowed Realm"
              fill
              priority
              sizes="(max-width: 768px) 300px, 350px"
              className="object-contain pointer-events-none"
            />
          </div>
        )}

        {/* Subtle Physical Ground Reflection / Contact Shadow Beneath Product */}
        <div className="w-[85%] h-8 bg-[radial-gradient(ellipse_at_center,_rgba(215,165,85,0.35)_0%,_rgba(100,70,30,0.15)_35%,_transparent_75%)] blur-md -mt-4 pointer-events-none" />
      </div>
    );
  }
);

CinematicPlaceholder.displayName = "CinematicPlaceholder";

export default CinematicPlaceholder;
