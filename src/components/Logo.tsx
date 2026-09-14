import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showBorderGlow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
  showBorderGlow = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        showBorderGlow ? 'drop-shadow-[0_0_8px_rgba(210,159,84,0.35)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain filter drop-shadow-sm select-none"
      >
        {/* Outer Maroon Card with Gold Outline */}
        <rect
          x="100"
          y="44"
          width="312"
          height="424"
          rx="40"
          ry="40"
          fill="#560007"
          stroke="#D29F54"
          strokeWidth="8"
        />
        {/* Three Vertical Gold Stripes (3MR Submark) */}
        <rect x="165" y="102" width="45" height="308" fill="#D29F54" />
        <rect x="233.5" y="102" width="45" height="308" fill="#D29F54" />
        <rect x="302" y="102" width="45" height="308" fill="#D29F54" />
      </svg>
    </div>
  );
};
