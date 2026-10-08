import React from 'react';

interface BrandLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showSubtitle = true,
  size = 'md',
  variant = 'full',
}) => {
  const iconSizeClasses = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-14 h-14 rounded-2xl',
  };

  const svgDimensions = {
    xs: 'w-4 h-4',
    sm: 'w-4.5 h-4.5',
    md: 'w-5.5 h-5.5',
    lg: 'w-6.5 h-6.5',
    xl: 'w-8 h-8',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* Sophisticated Deep Emerald & Teal Emblem */}
      <div
        className={`relative ${iconSizeClasses[size]} bg-gradient-to-br from-[#0F766E] via-[#115E59] to-[#042F2E] shadow-sm shadow-teal-900/15 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ring-1 ring-teal-500/30 overflow-hidden`}
        title="HabitPulse Life OS"
      >
        {/* Subtle Specular Top Highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        {/* Precision SVG Vector Mark */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${svgDimensions[size]} relative z-10`}
        >
          {/* Subtle glow filter definition */}
          <defs>
            <linearGradient id="logoWaveGrad" x1="4" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5EEAD4" />
              <stop offset="0.5" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#2DD4BF" />
            </linearGradient>
          </defs>

          {/* Smooth Kinetic Pulse Wave */}
          <path
            d="M5 18H9.5C10.5 18 11.2 16.5 11.8 14L13.5 8.5C13.8 7.5 14.8 7.5 15.2 8.5L18.8 27.5C19.2 28.5 20.2 28.5 20.6 27L22.8 12.5C23.1 11.5 24 11.5 24.4 12.5L25.8 18H31"
            stroke="url(#logoWaveGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Primary Apex Zenith Beacon */}
          <circle cx="14" cy="8" r="2.2" fill="#5EEAD4" />

          {/* Core Spark Anchor */}
          <circle cx="23.5" cy="12" r="1.6" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant === 'full' && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-slate-900 ${textSizes[size]}`}>
              Habit<span className="text-[#0F766E]">Pulse</span>
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F766E]" />
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold hidden sm:block">
              Life OS <span className="text-slate-300">·</span> Productivity <span className="text-slate-300">·</span> Mastery
            </p>
          )}
        </div>
      )}
    </div>
  );
};
