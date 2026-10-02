import React from "react";
import type { AnimalType } from "../../types";

export interface AnimalArtworkProps {
  animalType: AnimalType;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  animate?: boolean;
}

interface AnimalMeta {
  title: string;
  lore: string;
  primaryGlow: string;
  secondaryGlow: string;
  accentColor: string;
  emoji: string;
  gradientId: string;
}

export const ANIMAL_DETAILS: Record<AnimalType, AnimalMeta> = {
  WOLF: {
    title: "Celestial Wolf",
    lore: "Loyal guardian of midnight horizons, resonating with steady endurance and focused will.",
    primaryGlow: "rgba(99, 102, 241, 0.45)",
    secondaryGlow: "rgba(168, 85, 247, 0.35)",
    accentColor: "#818cf8",
    emoji: "🐺",
    gradientId: "wolf-grad",
  },
  RABBIT: {
    title: "Moonlit Rabbit",
    lore: "Gentle guide through starlit meadows, bringing swift grace and lighthearted joy.",
    primaryGlow: "rgba(244, 114, 182, 0.45)",
    secondaryGlow: "rgba(192, 132, 252, 0.35)",
    accentColor: "#f472b6",
    emoji: "🐇",
    gradientId: "rabbit-grad",
  },
  FOX: {
    title: "Solar Ember Fox",
    lore: "Quick-witted wanderer of the dunes, sparking curiosity and vibrant creative spark.",
    primaryGlow: "rgba(249, 115, 22, 0.45)",
    secondaryGlow: "rgba(234, 179, 8, 0.35)",
    accentColor: "#fb923c",
    emoji: "🦊",
    gradientId: "fox-grad",
  },
  CAT: {
    title: "Astral Shadow Cat",
    lore: "Mystic seer of quiet moments, balancing tranquil serenity with sharp playful instincts.",
    primaryGlow: "rgba(168, 85, 247, 0.45)",
    secondaryGlow: "rgba(236, 72, 153, 0.35)",
    accentColor: "#c084fc",
    emoji: "🐱",
    gradientId: "cat-grad",
  },
  DOG: {
    title: "Golden Dawn Dog",
    lore: "Devoted partner radiating boundless warmth, cheering every step of your daily milestones.",
    primaryGlow: "rgba(234, 179, 8, 0.45)",
    secondaryGlow: "rgba(249, 115, 22, 0.35)",
    accentColor: "#facc15",
    emoji: "🐶",
    gradientId: "dog-grad",
  },
  BEAR: {
    title: "Emerald Forest Bear",
    lore: "Unyielding anchor of calmness and deep strength, cultivating grounded presence and peaceful rest.",
    primaryGlow: "rgba(16, 185, 129, 0.45)",
    secondaryGlow: "rgba(5, 150, 105, 0.35)",
    accentColor: "#34d399",
    emoji: "🐻",
    gradientId: "bear-grad",
  },
  PANDA: {
    title: "Harmony Zen Panda",
    lore: "Embodiment of gentle balance and serene rhythm, treasuring mindful patience and calm joy.",
    primaryGlow: "rgba(20, 184, 166, 0.45)",
    secondaryGlow: "rgba(148, 163, 184, 0.35)",
    accentColor: "#2dd4bf",
    emoji: "🐼",
    gradientId: "panda-grad",
  },
  TIGER: {
    title: "Crimson Starlight Tiger",
    lore: "Fearless pioneer of bold aspirations, igniting courage to tackle challenging habits.",
    primaryGlow: "rgba(239, 68, 68, 0.45)",
    secondaryGlow: "rgba(249, 115, 22, 0.35)",
    accentColor: "#f87171",
    emoji: "🐯",
    gradientId: "tiger-grad",
  },
  DEER: {
    title: "Aurora Crest Deer",
    lore: "Noble bearer of blossoming growth, guiding life transitions with kindness and quiet wonder.",
    primaryGlow: "rgba(6, 182, 212, 0.45)",
    secondaryGlow: "rgba(59, 130, 246, 0.35)",
    accentColor: "#38bdf8",
    emoji: "🦌",
    gradientId: "deer-grad",
  },
  PENGUIN: {
    title: "Glacial Aurora Penguin",
    lore: "Hearty companion thriving in chilly winds, reminding you that small consistent waddles conquer mountains.",
    primaryGlow: "rgba(56, 189, 248, 0.45)",
    secondaryGlow: "rgba(99, 102, 241, 0.35)",
    accentColor: "#7dd3fc",
    emoji: "🐧",
    gradientId: "penguin-grad",
  },
};

const SIZE_MAP = {
  sm: "w-12 h-12 max-w-full",
  md: "w-20 h-20 max-w-full",
  lg: "w-32 h-32 sm:w-36 sm:h-36 max-w-full",
  hero: "w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 max-w-full",
};

export const AnimalArtwork: React.FC<AnimalArtworkProps> = ({
  animalType,
  size = "md",
  className = "",
  animate = true,
}) => {
  const meta = ANIMAL_DETAILS[animalType] || ANIMAL_DETAILS.WOLF;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${SIZE_MAP[size]} ${className}`}
    >
      {/* Ambient Pulsing Aura Backdrop */}
      <div
        className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
          animate ? "animate-aura-pulse" : "opacity-50"
        }`}
        style={{
          background: `radial-gradient(circle, ${meta.primaryGlow} 0%, ${meta.secondaryGlow} 50%, transparent 75%)`,
        }}
      />

      {/* Outer Cosmic Ring */}
      <div
        className={`absolute inset-1 rounded-full border border-dashed border-white/15 ${
          animate ? "animate-[spin_40s_linear_infinite]" : ""
        }`}
      />

      {/* Inner Glowing Pedestal */}
      <div
        className={`relative z-10 flex items-center justify-center w-full h-full rounded-3xl backdrop-blur-xl border border-white/10 bg-slate-900/60 shadow-2xl transition-transform duration-500 ${
          animate ? "animate-companion-float hover:scale-105" : ""
        }`}
        style={{
          boxShadow: `0 12px 35px -8px ${meta.primaryGlow}`,
        }}
      >
        {/* Stylized Artwork: High-Res 3D Image for FOX & RABBIT, or SVG */}
        <div
          className={`flex items-center justify-center w-full h-full p-2 transition-transform duration-700 ${
            animate ? "animate-companion-breathe" : ""
          }`}
        >
          {animalType === "FOX" ? (
            <img
              src="/companions/fox.png"
              alt="Solar Ember Fox"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(249,115,22,0.5)] transform hover:scale-105 transition-transform"
            />
          ) : animalType === "RABBIT" ? (
            <img
              src="/companions/bunny.png"
              alt="Moonlit Bunny"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(244,114,182,0.5)] transform hover:scale-105 transition-transform"
            />
          ) : (
            renderAnimalSvg(animalType, meta)
          )}
        </div>

        {/* Ambient Orbiting Star Dots */}
        {animate && (
          <>
            <span
              className="absolute -top-1 right-3 text-xs animate-sparkle"
              style={{ animationDelay: "0.2s" }}
            >
              ✦
            </span>
            <span
              className="absolute bottom-2 -left-1 text-xs animate-sparkle text-indigo-300"
              style={{ animationDelay: "1.1s" }}
            >
              ✧
            </span>
            <span
              className="absolute top-1/2 -right-2 text-[10px] animate-sparkle text-purple-300"
              style={{ animationDelay: "0.7s" }}
            >
              ⋆
            </span>
          </>
        )}
      </div>
    </div>
  );
};

function renderAnimalSvg(type: AnimalType, meta: AnimalMeta) {
  // Vector emblems rendered with SVGs, custom linear gradients, and animal silhouettes
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={meta.accentColor} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.8} />
        </linearGradient>
        <radialGradient id={`halo-${type}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={meta.accentColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={meta.accentColor} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Center Aura Circle */}
      <circle cx="60" cy="60" r="46" fill={`url(#halo-${type})`} />

      {/* Animal Emblem Shapes */}
      {type === "WOLF" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Outer Crest */}
          <path d="M60 14 L82 36 L76 68 L60 102 L44 68 L38 36 Z" opacity="0.3" fill="rgba(129, 140, 248, 0.08)" />
          {/* Wolf Ears */}
          <path d="M42 42 L34 20 L52 32 Z" fill="rgba(129, 140, 248, 0.3)" />
          <path d="M78 42 L86 20 L68 32 Z" fill="rgba(129, 140, 248, 0.3)" />
          {/* Head & Snout */}
          <path d="M48 40 L60 52 L72 40" />
          <path d="M52 56 L60 84 L68 56" fill="rgba(129, 140, 248, 0.2)" />
          <path d="M38 52 L48 64 L60 76 L72 64 L82 52" />
          {/* Eyes */}
          <circle cx="51" cy="50" r="2.5" fill="#f8fafc" />
          <circle cx="69" cy="50" r="2.5" fill="#f8fafc" />
          {/* Nose */}
          <polygon points="58,74 62,74 60,77" fill="#f8fafc" />
        </g>
      )}

      {type === "RABBIT" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Long Ears */}
          <path d="M48 50 C38 30 40 12 50 14 C58 16 54 36 50 50 Z" fill="rgba(244, 114, 182, 0.25)" />
          <path d="M72 50 C82 30 80 12 70 14 C62 16 66 36 70 50 Z" fill="rgba(244, 114, 182, 0.25)" />
          {/* Head */}
          <ellipse cx="60" cy="68" rx="24" ry="22" fill="rgba(244, 114, 182, 0.15)" />
          {/* Eyes */}
          <ellipse cx="51" cy="64" rx="3" ry="4" fill="#f8fafc" />
          <ellipse cx="69" cy="64" rx="3" ry="4" fill="#f8fafc" />
          {/* Nose & Whiskers */}
          <polygon points="58,74 62,74 60,77" fill="#f472b6" />
          <path d="M42 75 L30 73 M42 78 L28 80 M78 75 L90 73 M78 78 L92 80" opacity="0.6" strokeWidth="2" />
        </g>
      )}

      {type === "FOX" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Fluffy Angular Ears */}
          <polygon points="40,46 30,18 54,34" fill="rgba(251, 146, 60, 0.3)" />
          <polygon points="80,46 90,18 66,34" fill="rgba(251, 146, 60, 0.3)" />
          {/* Sleek Fox Mask */}
          <path d="M36 46 L60 88 L84 46 C76 40 60 42 36 46 Z" fill="rgba(251, 146, 60, 0.18)" />
          {/* Slanted Eyes */}
          <path d="M46 54 Q52 50 54 56" strokeWidth="3" />
          <path d="M74 54 Q68 50 66 56" strokeWidth="3" />
          {/* Nose Tip */}
          <circle cx="60" cy="84" r="3" fill="#ffffff" />
        </g>
      )}

      {type === "CAT" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Pointed Cat Ears */}
          <polygon points="42,46 34,22 56,38" fill="rgba(192, 132, 252, 0.3)" />
          <polygon points="78,46 86,22 64,38" fill="rgba(192, 132, 252, 0.3)" />
          {/* Round Head */}
          <ellipse cx="60" cy="62" rx="26" ry="22" fill="rgba(192, 132, 252, 0.15)" />
          {/* Slit Mystic Eyes */}
          <ellipse cx="49" cy="58" rx="4" ry="6" fill="#f8fafc" />
          <ellipse cx="71" cy="58" rx="4" ry="6" fill="#f8fafc" />
          <line x1="49" y1="54" x2="49" y2="62" stroke="#6b21a8" strokeWidth="2" />
          <line x1="71" y1="54" x2="71" y2="62" stroke="#6b21a8" strokeWidth="2" />
          {/* Muzzle */}
          <polygon points="58,68 62,68 60,71" fill="#c084fc" />
          <path d="M40 66 L26 64 M40 70 L28 73 M80 66 L94 64 M80 70 L92 73" opacity="0.6" strokeWidth="2" />
        </g>
      )}

      {type === "DOG" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Floppy Friendly Ears */}
          <path d="M38 42 C28 45 24 64 32 72 C36 76 42 66 40 50 Z" fill="rgba(250, 204, 21, 0.28)" />
          <path d="M82 42 C92 45 96 64 88 72 C84 76 78 66 80 50 Z" fill="rgba(250, 204, 21, 0.28)" />
          {/* Cheerful Head */}
          <ellipse cx="60" cy="60" rx="25" ry="24" fill="rgba(250, 204, 21, 0.15)" />
          {/* Warm Eyes */}
          <circle cx="50" cy="55" r="3.5" fill="#f8fafc" />
          <circle cx="70" cy="55" r="3.5" fill="#f8fafc" />
          {/* Button Nose & Smile */}
          <ellipse cx="60" cy="66" rx="5" ry="4" fill="#ffffff" />
          <path d="M54 72 Q60 78 66 72" strokeWidth="3" />
        </g>
      )}

      {type === "BEAR" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Round Sturdy Ears */}
          <circle cx="36" cy="36" r="12" fill="rgba(52, 211, 153, 0.25)" />
          <circle cx="84" cy="36" r="12" fill="rgba(52, 211, 153, 0.25)" />
          {/* Broad Head */}
          <ellipse cx="60" cy="64" rx="30" ry="26" fill="rgba(52, 211, 153, 0.15)" />
          {/* Snout */}
          <ellipse cx="60" cy="72" rx="14" ry="11" fill="rgba(52, 211, 153, 0.3)" />
          <ellipse cx="60" cy="69" rx="5" ry="3.5" fill="#f8fafc" />
          {/* Calm Eyes */}
          <circle cx="48" cy="56" r="3" fill="#f8fafc" />
          <circle cx="72" cy="56" r="3" fill="#f8fafc" />
        </g>
      )}

      {type === "PANDA" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Black Ears */}
          <circle cx="36" cy="36" r="12" fill="#1e293b" />
          <circle cx="84" cy="36" r="12" fill="#1e293b" />
          {/* White Round Head */}
          <ellipse cx="60" cy="62" rx="28" ry="25" fill="rgba(248, 250, 252, 0.2)" />
          {/* Dark Eye Patches */}
          <ellipse cx="48" cy="56" rx="7" ry="9" fill="#1e293b" transform="rotate(-15 48 56)" />
          <ellipse cx="72" cy="56" rx="7" ry="9" fill="#1e293b" transform="rotate(15 72 56)" />
          <circle cx="49" cy="56" r="2.5" fill="#2dd4bf" />
          <circle cx="71" cy="56" r="2.5" fill="#2dd4bf" />
          {/* Soft Nose */}
          <ellipse cx="60" cy="70" rx="4.5" ry="3" fill="#ffffff" />
        </g>
      )}

      {type === "TIGER" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Round Ears */}
          <polygon points="40,42 32,24 54,34" fill="rgba(248, 113, 113, 0.3)" />
          <polygon points="80,42 88,24 66,34" fill="rgba(248, 113, 113, 0.3)" />
          {/* Powerful Head */}
          <ellipse cx="60" cy="62" rx="28" ry="24" fill="rgba(248, 113, 113, 0.15)" />
          {/* Forehead Stripes */}
          <line x1="60" y1="42" x2="60" y2="52" stroke="#f87171" strokeWidth="3" />
          <line x1="52" y1="45" x2="56" y2="50" stroke="#f87171" strokeWidth="2.5" />
          <line x1="68" y1="45" x2="64" y2="50" stroke="#f87171" strokeWidth="2.5" />
          {/* Intense Eyes */}
          <polygon points="44,56 52,54 48,58" fill="#facc15" />
          <polygon points="76,56 68,54 72,58" fill="#facc15" />
          {/* Snout */}
          <polygon points="56,70 64,70 60,74" fill="#ffffff" />
        </g>
      )}

      {type === "DEER" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Radiant Starlight Antlers */}
          <path d="M46 36 L38 20 M38 20 L30 14 M38 20 L44 12 M42 28 L32 28" />
          <path d="M74 36 L82 20 M82 20 L90 14 M82 20 L76 12 M78 28 L88 28" />
          {/* Slender Head */}
          <ellipse cx="60" cy="62" rx="20" ry="25" fill="rgba(56, 189, 248, 0.18)" />
          {/* Large Gentle Eyes */}
          <ellipse cx="51" cy="58" rx="3.5" ry="4.5" fill="#f8fafc" />
          <ellipse cx="69" cy="58" rx="3.5" ry="4.5" fill="#f8fafc" />
          {/* Delicate Nose */}
          <circle cx="60" cy="76" r="3" fill="#38bdf8" />
        </g>
      )}

      {type === "PENGUIN" && (
        <g stroke={`url(#grad-${type})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Body Hood */}
          <ellipse cx="60" cy="62" rx="26" ry="32" fill="rgba(15, 23, 42, 0.45)" />
          {/* White Belly */}
          <ellipse cx="60" cy="68" rx="16" ry="22" fill="rgba(224, 242, 254, 0.3)" />
          {/* Eyes */}
          <circle cx="52" cy="52" r="3" fill="#f8fafc" />
          <circle cx="68" cy="52" r="3" fill="#f8fafc" />
          {/* Orange Beak */}
          <polygon points="56,60 64,60 60,67" fill="#fb923c" stroke="#f97316" strokeWidth="1" />
          {/* Cozy Cheeks */}
          <circle cx="46" cy="58" r="3" fill="rgba(244, 114, 182, 0.35)" stroke="none" />
          <circle cx="74" cy="58" r="3" fill="rgba(244, 114, 182, 0.35)" stroke="none" />
        </g>
      )}
    </svg>
  );
}
