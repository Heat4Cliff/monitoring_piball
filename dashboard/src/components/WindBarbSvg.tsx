import React from 'react';

export interface WindBarbSvgProps {
  speedKt: number;
  directionDeg: number;
  hemisphere?: 'south' | 'north';
  size?: number;
  color?: string;
  strokeWidth?: number;
  showCenterDot?: boolean;
  className?: string;
}

export const WindBarbSvg: React.FC<WindBarbSvgProps> = ({
  speedKt,
  directionDeg,
  hemisphere = 'south',
  size = 60,
  color = 'currentColor',
  strokeWidth = 2,
  showCenterDot = true,
  className = ''
}) => {
  // Calm wind threshold: < 2.5 kt
  const isCalm = speedKt < 2.5;

  // Round speed to nearest 5 kt for WMO barb representation
  const roundedSpeed = Math.round(speedKt / 5) * 5;

  // Decompose into 50 kt (pennants), 10 kt (full barbs), 5 kt (half barbs)
  let numPennants = Math.floor(roundedSpeed / 50);
  let remainder = roundedSpeed % 50;
  let numFullBarbs = Math.floor(remainder / 10);
  let numHalfBarbs = Math.floor((remainder % 10) / 5);

  // Hemisphere multiplier:
  // In Southern Hemisphere (BBS - Cilacap 07°38' LS), barbs point to the left/right according to pressure side.
  // Standard graphic convention: BBS = -1 (left in staff space), BBU = +1 (right in staff space).
  const side = hemisphere === 'south' ? -1 : 1;

  // Render Calm Wind Icon (concentric circles)
  if (isCalm) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="-45 -45 90 90"
        className={className}
      >
        <circle cx="0" cy="0" r="8" fill="none" stroke={color} strokeWidth={strokeWidth} />
        <circle cx="0" cy="0" r="3" fill={color} />
      </svg>
    );
  }

  // Barbs layout geometry along staff:
  // Staff length = 32 units from (0, 0) up to (0, -32)
  const staffLength = 32;
  const tipY = -staffLength;
  const barbSpacing = 4.5;
  const pennantWidth = 6.5;
  const fullBarbLen = 11;
  const halfBarbLen = 5.5;
  const barbAngleYOffset = 4.0; // angled backwards toward center

  let currentY = tipY;
  const elements: React.ReactNode[] = [];

  // 1. Draw 50 kt Pennants (Filled Triangles)
  for (let i = 0; i < numPennants; i++) {
    const p1 = `0,${currentY}`;
    const p2 = `${side * fullBarbLen},${currentY + barbAngleYOffset / 2}`;
    const p3 = `0,${currentY + pennantWidth}`;
    elements.push(
      <polygon
        key={`pennant-${i}`}
        points={`${p1} ${p2} ${p3}`}
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
      />
    );
    currentY += pennantWidth + 1.5;
  }

  // If a single half-barb only (speed ~ 5 kt), place it slightly indented from tip (WMO standard)
  if (numPennants === 0 && numFullBarbs === 0 && numHalfBarbs === 1) {
    currentY = tipY + barbSpacing;
    elements.push(
      <line
        key="single-half-barb"
        x1="0"
        y1={currentY}
        x2={side * halfBarbLen}
        y2={currentY + barbAngleYOffset * 0.7}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  } else {
    // 2. Draw 10 kt Full Barbs
    for (let i = 0; i < numFullBarbs; i++) {
      elements.push(
        <line
          key={`full-barb-${i}`}
          x1="0"
          y1={currentY}
          x2={side * fullBarbLen}
          y2={currentY + barbAngleYOffset}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
      currentY += barbSpacing;
    }

    // 3. Draw 5 kt Half Barbs
    for (let i = 0; i < numHalfBarbs; i++) {
      elements.push(
        <line
          key={`half-barb-${i}`}
          x1="0"
          y1={currentY}
          x2={side * halfBarbLen}
          y2={currentY + barbAngleYOffset * 0.75}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
      currentY += barbSpacing;
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="-45 -45 90 90"
      className={className}
    >
      <g transform={`rotate(${directionDeg}, 0, 0)`}>
        {/* Main Staff / Poros Batang */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={tipY}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Barbs & Pennants */}
        {elements}

        {/* Center Station Dot */}
        {showCenterDot && (
          <circle
            cx="0"
            cy="0"
            r={strokeWidth * 1.5}
            fill={color}
          />
        )}
      </g>
    </svg>
  );
};
