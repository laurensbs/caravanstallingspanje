'use client';

interface IllustrationProps {
  className?: string;
  size?: number;
}

export function CaravanScene({ className = '', size = 200 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <circle cx="160" cy="30" r="18" fill="#D4935A" opacity="0.3" />
      {/* Mountains */}
      <path d="M0 90 L40 40 L80 90Z" fill="#3D5A3E" opacity="0.2" />
      <path d="M50 90 L100 30 L150 90Z" fill="#3D5A3E" opacity="0.15" />
      <path d="M120 90 L170 50 L200 90Z" fill="#3D5A3E" opacity="0.1" />
      {/* Ground */}
      <rect x="0" y="90" width="200" height="50" fill="#E4D8C8" rx="4" />
      <ellipse cx="100" cy="92" rx="100" ry="6" fill="#F0E8DC" />
      {/* Caravan body */}
      <rect x="50" y="55" width="80" height="40" rx="6" fill="white" stroke="#C4653A" strokeWidth="2" />
      <rect x="55" y="60" width="18" height="14" rx="3" fill="#4A7B9D" opacity="0.3" />
      <rect x="78" y="60" width="18" height="14" rx="3" fill="#4A7B9D" opacity="0.3" />
      <rect x="105" y="62" width="18" height="28" rx="3" fill="#C4653A" opacity="0.2" />
      <circle cx="110" cy="76" r="2" fill="#C4653A" />
      {/* Hitch */}
      <path d="M50 78 L35 78 L32 82" stroke="#8B8680" strokeWidth="2" strokeLinecap="round" />
      {/* Wheels */}
      <circle cx="70" cy="97" r="7" fill="#3D3530" />
      <circle cx="70" cy="97" r="3" fill="#8B8680" />
      <circle cx="112" cy="97" r="7" fill="#3D3530" />
      <circle cx="112" cy="97" r="3" fill="#8B8680" />
      {/* Tree */}
      <rect x="170" y="65" width="4" height="25" fill="#8B7355" />
      <ellipse cx="172" cy="55" rx="14" ry="18" fill="#3D5A3E" opacity="0.6" />
      <ellipse cx="172" cy="48" rx="10" ry="14" fill="#5A7D5C" opacity="0.5" />
      {/* Birds */}
      <path d="M30 25 Q33 22 36 25" stroke="#8B8680" strokeWidth="1" fill="none" />
      <path d="M40 20 Q43 17 46 20" stroke="#8B8680" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function SunMountains({ className = '', size = 200 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun */}
      <circle cx="150" cy="35" r="22" fill="#D4935A" opacity="0.25" />
      <circle cx="150" cy="35" r="14" fill="#C4653A" opacity="0.2" />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line key={deg} x1="150" y1="35" x2={150 + Math.cos(deg * Math.PI / 180) * 30} y2={35 + Math.sin(deg * Math.PI / 180) * 30} stroke="#D4935A" strokeWidth="1" opacity="0.15" />
      ))}
      {/* Mountains */}
      <path d="M0 100 L50 35 L100 100Z" fill="#3D5A3E" opacity="0.25" />
      <path d="M40 100 L100 45 L160 100Z" fill="#5A7D5C" opacity="0.2" />
      <path d="M100 100 L160 55 L200 100Z" fill="#3D5A3E" opacity="0.15" />
      {/* Snow caps */}
      <path d="M45 42 L50 35 L55 42" fill="white" opacity="0.5" />
      <path d="M95 52 L100 45 L105 52" fill="white" opacity="0.4" />
      {/* Ground */}
      <ellipse cx="100" cy="105" rx="100" ry="12" fill="#F0E8DC" />
      {/* Trees */}
      <rect x="20" y="80" width="3" height="18" fill="#8B7355" />
      <path d="M10 80 L21.5 55 L33 80Z" fill="#3D5A3E" opacity="0.5" />
      <rect x="175" y="75" width="3" height="22" fill="#8B7355" />
      <path d="M165 75 L176.5 50 L188 75Z" fill="#5A7D5C" opacity="0.4" />
    </svg>
  );
}

export function SpainMap({ className = '', size = 120 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 100" width={size} height={size * 0.83} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simplified Spain shape */}
      <path d="M25 15 Q30 10 50 12 Q70 8 85 15 Q95 20 95 35 Q100 50 90 60 Q85 70 75 75 Q65 85 50 80 Q35 85 25 75 Q15 65 15 50 Q10 35 20 25Z" fill="#C4653A" opacity="0.12" stroke="#C4653A" strokeWidth="1.5" strokeOpacity="0.3" />
      {/* Costa Brava pin */}
      <circle cx="80" cy="30" r="5" fill="#C4653A" />
      <circle cx="80" cy="30" r="2" fill="white" />
      <path d="M80 35 L80 42" stroke="#C4653A" strokeWidth="1.5" />
      {/* Label */}
      <text x="80" y="52" textAnchor="middle" fill="#C4653A" fontSize="6" fontWeight="600" fontFamily="DM Sans, sans-serif">Costa Brava</text>
    </svg>
  );
}

export function ShieldCheck({ className = '', size = 80 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 90" width={size} height={size * 1.125} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 8 L68 22 Q70 50 56 68 Q48 78 40 82 Q32 78 24 68 Q10 50 12 22Z" fill="#3D5A3E" opacity="0.1" stroke="#3D5A3E" strokeWidth="1.5" />
      <path d="M30 45 L37 52 L52 36" stroke="#3D5A3E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StorageIcon({ className = '', size = 80 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Roof */}
      <path d="M10 35 L40 12 L70 35" stroke="#C4653A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Building */}
      <rect x="16" y="35" width="48" height="32" rx="3" fill="#C4653A" opacity="0.1" stroke="#C4653A" strokeWidth="1.5" />
      {/* Door */}
      <rect x="32" y="48" width="16" height="19" rx="2" fill="#C4653A" opacity="0.15" />
      <circle cx="44" cy="58" r="1.5" fill="#C4653A" />
      {/* Windows */}
      <rect x="22" y="40" width="8" height="6" rx="1" fill="#4A7B9D" opacity="0.2" />
      <rect x="50" y="40" width="8" height="6" rx="1" fill="#4A7B9D" opacity="0.2" />
    </svg>
  );
}

export function ToolsIcon({ className = '', size = 80 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wrench */}
      <path d="M20 60 L45 35 Q50 25 60 20 Q55 28 55 35 L60 40 L50 30 L25 55Z" fill="#D4935A" opacity="0.2" stroke="#D4935A" strokeWidth="1.5" />
      {/* Screwdriver */}
      <path d="M55 55 L35 35 L32 28 L38 32Z" fill="#4A7B9D" opacity="0.2" stroke="#4A7B9D" strokeWidth="1.5" />
      {/* Circle accent */}
      <circle cx="40" cy="40" r="28" stroke="#C4653A" strokeWidth="1" opacity="0.15" strokeDasharray="4 3" />
    </svg>
  );
}

export function TransportIcon({ className = '', size = 80 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size * 0.6} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Road */}
      <rect x="0" y="42" width="100" height="12" rx="2" fill="#E4D8C8" />
      <line x1="10" y1="48" x2="25" y2="48" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="40" y1="48" x2="55" y2="48" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="70" y1="48" x2="85" y2="48" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Truck cab */}
      <rect x="10" y="22" width="22" height="22" rx="3" fill="#C4653A" opacity="0.2" stroke="#C4653A" strokeWidth="1.5" />
      <rect x="14" y="26" width="10" height="8" rx="2" fill="#4A7B9D" opacity="0.25" />
      {/* Trailer */}
      <rect x="34" y="18" width="50" height="26" rx="3" fill="white" stroke="#C4653A" strokeWidth="1.5" />
      {/* Wheels */}
      <circle cx="24" cy="46" r="5" fill="#3D3530" />
      <circle cx="24" cy="46" r="2" fill="#8B8680" />
      <circle cx="52" cy="46" r="5" fill="#3D3530" />
      <circle cx="52" cy="46" r="2" fill="#8B8680" />
      <circle cx="72" cy="46" r="5" fill="#3D3530" />
      <circle cx="72" cy="46" r="2" fill="#8B8680" />
    </svg>
  );
}

export function WaveDivider({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className={`w-full ${flip ? 'rotate-180' : ''} ${className}`} height="60" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 60h1440V24c-240 20-480 30-720 16S240 8 0 28v32z" fill="currentColor" />
    </svg>
  );
}

export function OliveLeaf({ className = '', size = 40 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32 Q20 20 32 8" stroke="#3D5A3E" strokeWidth="1.5" />
      <ellipse cx="15" cy="25" rx="6" ry="3" transform="rotate(-45 15 25)" fill="#3D5A3E" opacity="0.2" />
      <ellipse cx="22" cy="18" rx="6" ry="3" transform="rotate(-45 22 18)" fill="#5A7D5C" opacity="0.2" />
      <ellipse cx="28" cy="12" rx="5" ry="2.5" transform="rotate(-45 28 12)" fill="#3D5A3E" opacity="0.15" />
    </svg>
  );
}

export function StarsRating({ className = '', count = 5, active = 5, size = 16 }: IllustrationProps & { count?: number; active?: number }) {
  return (
    <svg viewBox={`0 0 ${count * 20} 20`} width={count * size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: count }).map((_, i) => (
        <path
          key={i}
          d={`M${i * 20 + 10} 2 L${i * 20 + 12.5} 7.5 L${i * 20 + 18} 8 L${i * 20 + 13.5} 12 L${i * 20 + 15} 17.5 L${i * 20 + 10} 14.5 L${i * 20 + 5} 17.5 L${i * 20 + 6.5} 12 L${i * 20 + 2} 8 L${i * 20 + 7.5} 7.5Z`}
          fill={i < active ? '#D4935A' : '#E4D8C8'}
        />
      ))}
    </svg>
  );
}

export function DecorBlob({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M45.2,-59.8C56.9,-52.4,63.2,-36.6,67.3,-20.3C71.3,-4.1,73.1,12.6,67.1,26.2C61,39.9,47.2,50.5,32.5,57.8C17.8,65.1,2.2,69,-12.6,66.5C-27.3,63.9,-41.3,54.9,-53.1,43.3C-64.9,31.7,-74.5,17.5,-74.4,3C-74.3,-11.6,-64.5,-26.5,-52.5,-34.1C-40.5,-41.8,-26.2,-42.2,-13.2,-48.5C-0.1,-54.7,11.7,-66.9,26.4,-67.9C41,-68.9,58.4,-58.7,45.2,-59.8Z" transform="translate(100 100)" fill="currentColor" />
    </svg>
  );
}
