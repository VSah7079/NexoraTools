import React from 'react';

interface NexoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  showBadge?: boolean;
  className?: string;
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  size = 'md',
  iconOnly = false,
  showBadge = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {/* Nexora Prism Nexus Icon */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(6,182,212,0.35)]"
        >
          <defs>
            {/* Outer Border Glowing Gradient */}
            <linearGradient id="nexoraBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="40%" stopColor="#3B82F6" />
              <stop offset="80%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            {/* Dark Glass Radial Base */}
            <radialGradient id="nexoraPlate" cx="50%" cy="25%" r="85%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Left Pillar Gradient */}
            <linearGradient id="nexoraPillarL" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Right Pillar Gradient */}
            <linearGradient id="nexoraPillarR" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            {/* Diagonal Ribbon 3D Gradient */}
            <linearGradient id="nexoraDiagRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="45%" stopColor="#3B82F6" />
              <stop offset="75%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            {/* Core Sparkle Glow Filter */}
            <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Squircle Dark Obsidian Base Plate */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#nexoraPlate)"
            stroke="url(#nexoraBorder)"
            strokeWidth="3.2"
          />

          {/* Subtle Inner Glass Highlight */}
          <rect
            x="7.5"
            y="7.5"
            width="85"
            height="85"
            rx="20.5"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* Left Vertical Pillar */}
          <rect
            x="24"
            y="24"
            width="12"
            height="52"
            rx="6"
            fill="url(#nexoraPillarL)"
          />

          {/* Right Vertical Pillar */}
          <rect
            x="64"
            y="24"
            width="12"
            height="52"
            rx="6"
            fill="url(#nexoraPillarR)"
          />

          {/* Dynamic 3D Diagonal Ribbon Beam */}
          <path
            d="M 28 26 C 25.5 28.5 25.5 32.5 28.5 35.5 L 65.5 73.5 C 68 76 72 76 74.5 73.5 C 77 71 77 67 74.5 64.5 L 37.5 26.5 C 34.5 23.5 30.5 23.5 28 26 Z"
            fill="url(#nexoraDiagRibbon)"
          />

          {/* Optical Diamond Sparkle Nexus Core */}
          <path
            d="M 50 38 Q 50 50 62 50 Q 50 50 50 62 Q 50 50 38 50 Q 50 50 50 38 Z"
            fill="#FFFFFF"
            filter="url(#sparkleGlow)"
          />
          <circle cx="50" cy="50" r="2.5" fill="#00F0FF" />
        </svg>
      </div>

      {/* Brand Typography */}
      {!iconOnly && (
        <div className="flex items-center gap-2 leading-none">
          <span
            className={`font-black tracking-tight text-white group-hover:text-slate-100 transition-colors ${textSizes[size]}`}
          >
            Nexora
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent ml-0.5">
              Tools
            </span>
          </span>

          {showBadge && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs whitespace-nowrap">
              100% Free
            </span>
          )}
        </div>
      )}
    </div>
  );
};
