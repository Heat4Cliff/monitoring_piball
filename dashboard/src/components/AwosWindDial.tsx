import React from 'react';

interface AwosWindDialProps {
  speedKt: number;
  directionDeg: number;
  size?: number;
  label?: string;
  unit?: 'knot' | 'm/s';
}

export const AwosWindDial: React.FC<AwosWindDialProps> = ({
  speedKt,
  directionDeg,
  size = 68,
  label = 'WIND',
  unit = 'knot'
}) => {
  const displaySpeed = unit === 'knot' ? speedKt : Number((speedKt * 0.514444).toFixed(1));
  const r = 24;

  // Cardinal labels
  const cardinals = [
    { label: 'N', angle: 0, x: 0, y: -r + 3 },
    { label: 'E', angle: 90, x: r - 3, y: 0 },
    { label: 'S', angle: 180, x: 0, y: r - 3 },
    { label: 'W', angle: 270, x: -r + 3, y: 0 }
  ];

  return (
    <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
      {/* Mini Circular Compass Dial */}
      <svg
        width={size}
        height={size}
        viewBox="-32 -32 64 64"
        className="shrink-0 drop-shadow-sm"
      >
        {/* Outer Circular Ring with Tick Marks */}
        <circle
          cx="0"
          cy="0"
          r={r}
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* 30-degree tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const x1 = Math.sin(rad) * (r - 1);
          const y1 = -Math.cos(rad) * (r - 1);
          const x2 = Math.sin(rad) * (r - (deg % 90 === 0 ? 4 : 2.5));
          const y2 = -Math.cos(rad) * (r - (deg % 90 === 0 ? 4 : 2.5));
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#94a3b8"
              strokeWidth={deg % 90 === 0 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Cardinal Ticks Labels */}
        {cardinals.map(c => (
          <text
            key={c.label}
            x={c.x}
            y={c.y + 2.5}
            textAnchor="middle"
            fontSize="5.5"
            fontWeight="bold"
            fill={c.label === 'N' ? '#dc2626' : '#475569'}
            fontFamily="sans-serif"
          >
            {c.label}
          </text>
        ))}

        {/* Direction Needle / Arrow (Red pointer rotated to direction) */}
        <g transform={`rotate(${directionDeg}, 0, 0)`}>
          <polygon
            points="0,-19 -3,-10 3,-10"
            fill="#dc2626"
          />
          <line
            x1="0"
            y1="-10"
            x2="0"
            y2="10"
            stroke="#dc2626"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="2" fill="#dc2626" />
        </g>
      </svg>

      {/* Numerical Speed & Direction Readout */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            {unit}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold font-mono text-slate-800 leading-none">
            {displaySpeed}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">kt</span>
        </div>
        <div className="text-[11px] font-mono text-amber-600 font-bold leading-tight">
          {directionDeg}°
        </div>
      </div>
    </div>
  );
};
