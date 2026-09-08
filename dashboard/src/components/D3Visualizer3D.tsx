import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { AnalysisObservation, ProcessedObservation } from '../types/pibal';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Compass, 
  Layers, 
  Sparkles, 
  ExternalLink,
  Sliders,
  Info,
  ArrowDown,
  ArrowUp,
  Move
} from 'lucide-react';

interface D3Visualizer3DProps {
  primaryObs: AnalysisObservation;
  primaryProcObs: ProcessedObservation;
  viewMode: 'spiral' | 'trajectory';
  onViewModeChange: (mode: 'spiral' | 'trajectory') => void;
  selectedLevelIdx: number | null;
  onSelectLevel: (idx: number | null) => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  x2d: number;
  y2d: number;
  depth: number;
}

export const D3Visualizer3D: React.FC<D3Visualizer3DProps> = ({
  primaryObs,
  primaryProcObs,
  viewMode,
  onViewModeChange,
  selectedLevelIdx,
  onSelectLevel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 3D Camera Angles & Transform State
  const [yaw, setYaw] = useState<number>(45);      // Azimuth rotation (degrees)
  const [pitch, setPitch] = useState<number>(25);   // Elevation angle (degrees)
  const [zoom, setZoom] = useState<number>(1.0);     // Zoom factor
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [hoveredLevel, setHoveredLevel] = useState<any | null>(null);

  // Playback state for 3D flight simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);

  // Handle Container Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: Math.floor(entry.contentRect.width),
            height: Math.max(600, Math.floor(entry.contentRect.height))
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-Rotate Animation
  useEffect(() => {
    if (!autoRotate) return;
    let animId: number;
    const tick = () => {
      setYaw((prev) => (prev + 0.4) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // Flight Simulation Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setPlaybackProgress((prev) => {
        const next = prev + delta * (0.05 * playbackSpeed);
        if (next >= 1.0) {
          setIsPlaying(false);
          return 1.0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Interactive Mouse Drag for 3D Camera Rotation (D3 Drag) & Pan
  useEffect(() => {
    if (!svgRef.current) return;
    const svgElement = d3.select(svgRef.current);

    let startX = 0;
    let startY = 0;
    let initialYaw = yaw;
    let initialPitch = pitch;
    let initialPanX = pan.x;
    let initialPanY = pan.y;
    let isDragging = false;
    let isPanMode = false;

    const dragHandler = d3.drag<SVGSVGElement, unknown>()
      .filter((event) => {
        // Allow left click (0) and right click (2)
        return event.button === 0 || event.button === 2;
      })
      .on('start', (event) => {
        startX = event.x;
        startY = event.y;
        initialYaw = yaw;
        initialPitch = pitch;
        initialPanX = pan.x;
        initialPanY = pan.y;
        isDragging = true;
        // Pan if right-click OR Shift key pressed
        isPanMode = event.sourceEvent.button === 2 || event.sourceEvent.shiftKey;
      })
      .on('drag', (event) => {
        if (!isDragging) return;
        const dx = event.x - startX;
        const dy = event.y - startY;
        
        if (isPanMode) {
          setPan({
            x: initialPanX + dx,
            y: initialPanY + dy
          });
        } else {
          // Drag horizontally -> Rotate Yaw
          const newYaw = (initialYaw + dx * 0.6) % 360;
          // Drag vertically -> Rotate Pitch (clamp between -10 and 88)
          const newPitch = Math.max(-10, Math.min(88, initialPitch - dy * 0.4));

          setYaw(newYaw);
          setPitch(newPitch);
        }
      })
      .on('end', () => {
        isDragging = false;
      });

    svgElement.call(dragHandler as any);

    // Zoom handler with wheel
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((z) => Math.max(0.4, Math.min(3.5, z * zoomFactor)));
    };

    const node = svgRef.current;
    node.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      svgElement.on('.drag', null);
      node.removeEventListener('wheel', wheelHandler);
    };
  }, [yaw, pitch, pan]);

  // 3D Mathematical Projection Matrix
  const project3D = useCallback((p: Point3D): ProjectedPoint => {
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Rotation around Z (vertical axis)
    const x1 = p.x * Math.cos(yawRad) - p.y * Math.sin(yawRad);
    const y1 = p.x * Math.sin(yawRad) + p.y * Math.cos(yawRad);
    const z1 = p.z;

    // Rotation around X (pitch tilt)
    const x2 = x1;
    const y2 = y1 * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);
    const z2 = y1 * Math.cos(pitchRad) - z1 * Math.sin(pitchRad); // Depth

    // Screen Center and Scaling
    const scale = 1.20 * zoom;
    const cx = dimensions.width / 2 + pan.x;

    // Center of 3D vertical span is around z = 105.
    // Under pitch tilt, the midpoint is projected down by:
    const verticalCenterOffset = Math.cos(pitchRad) * (108 * scale);
    // Ground base (z=0) is shifted down so the 3D spiral is comfortably visible and well below top header
    const cy = dimensions.height / 2 + 18 + verticalCenterOffset + pan.y;

    return {
      x2d: cx + x2 * scale,
      y2d: cy - y2 * scale,
      depth: z2
    };
  }, [yaw, pitch, zoom, pan, dimensions]);

  // Max altitude and height scaling
  const maxAlt = useMemo(() => {
    return primaryObs.statistics?.max_altitude_ft || 10000;
  }, [primaryObs]);

  const heightScaleZ = useMemo(() => {
    return 215 / Math.max(maxAlt, 5000);
  }, [maxAlt]);

  const uvScale = 3.8; // 1 knot = 3.8 screen coordinate units

  // Raw 3D Hodograph Spiral Points
  const spiral3DPoints = useMemo(() => {
    const pts = primaryObs.hodograph_points || [];
    return pts.map((p, idx) => ({
      orig: p,
      index: idx,
      pos3d: {
        x: p.u * uvScale,
        y: p.v * uvScale,
        z: p.height_ft * heightScaleZ
      }
    }));
  }, [primaryObs, uvScale, heightScaleZ]);

  // Raw 3D Balloon Flight Trajectory Points (Theodolite-derived)
  const flight3DPoints = useMemo(() => {
    const records = (primaryProcObs.theodolite_records || []).filter(
      r => r.elevation && r.elevation > 0 && r.azimuth !== null
    );

    const ascentRateFt = 600; // ~180 m/min standard pibal
    if (!records.length) {
      return spiral3DPoints.map((sp, idx) => ({
        minute: idx * 2,
        height_ft: sp.orig.height_ft,
        speed_kt: sp.orig.speed_kt,
        dir_deg: sp.orig.direction_deg,
        pos3d: {
          x: sp.pos3d.x * 2.2,
          y: sp.pos3d.y * 2.2,
          z: sp.pos3d.z
        }
      }));
    }

    const maxZ = records[records.length - 1].minute * ascentRateFt;
    const hScale = 215 / Math.max(maxZ, 5000);
    const horizScale = 0.014;

    return records.map((r) => {
      const zFt = r.minute * ascentRateFt;
      const elRad = (r.elevation! * Math.PI) / 180;
      const azRad = (r.azimuth! * Math.PI) / 180;
      const horizDistFt = zFt / Math.tan(elRad);

      return {
        minute: r.minute,
        height_ft: zFt,
        speed_kt: r.derived_speed || 0,
        dir_deg: r.derived_dir || 0,
        pos3d: {
          x: horizDistFt * Math.sin(azRad) * horizScale,
          y: horizDistFt * Math.cos(azRad) * horizScale,
          z: zFt * hScale
        }
      };
    });
  }, [primaryProcObs, spiral3DPoints]);

  // Active balloon position during simulation playback
  const activeBalloonState = useMemo(() => {
    const points = viewMode === 'spiral' ? spiral3DPoints : flight3DPoints;
    if (!points.length) return null;

    const total = points.length - 1;
    const targetIdxFloat = playbackProgress * total;
    const floorIdx = Math.floor(targetIdxFloat);
    const ceilIdx = Math.min(total, Math.ceil(targetIdxFloat));
    const alpha = targetIdxFloat - floorIdx;

    const p1 = points[floorIdx].pos3d;
    const p2 = points[ceilIdx].pos3d;

    const currentPos3D: Point3D = {
      x: p1.x + (p2.x - p1.x) * alpha,
      y: p1.y + (p2.y - p1.y) * alpha,
      z: p1.z + (p2.z - p1.z) * alpha
    };

    const curRecord = points[floorIdx];
    return {
      pos3d: currentPos3D,
      proj: project3D(currentPos3D),
      minute: (curRecord as any).minute ?? ((curRecord as any).orig?.height_ft ? Math.round(((curRecord as any).orig?.height_ft || 0) / 600) : floorIdx * 2),
      height_ft: Math.round(
        ((curRecord as any).height_ft ?? (curRecord as any).orig?.height_ft ?? 0)
      ),
      speed_kt: (curRecord as any).speed_kt ?? (curRecord as any).orig?.speed_kt ?? 0,
      dir_deg: (curRecord as any).dir_deg ?? (curRecord as any).orig?.direction_deg ?? 0
    };
  }, [viewMode, spiral3DPoints, flight3DPoints, playbackProgress, project3D]);

  // Altitude color scale using D3
  const getAltitudeColor = useCallback((heightFt: number) => {
    const t = Math.min(1, Math.max(0, heightFt / Math.max(maxAlt, 10000)));
    return d3.interpolateTurbo(0.18 + t * 0.78);
  }, [maxAlt]);

  // Floor Concentric Speed Rings (5, 10, 15, 20, 25, 30 kt)
  const speedRings3D = useMemo(() => {
    const rings = [5, 10, 15, 20, 25, 30];
    return rings.map(spd => {
      const radius = spd * uvScale;
      const numSegments = 64;
      const pts: Point3D[] = [];
      for (let i = 0; i <= numSegments; i++) {
        const theta = (i / numSegments) * Math.PI * 2;
        pts.push({
          x: radius * Math.cos(theta),
          y: radius * Math.sin(theta),
          z: 0
        });
      }
      return {
        speed_kt: spd,
        points: pts
      };
    });
  }, [uvScale]);

  // Cardinal Ground Axes (N, NE, E, SE, S, SW, W, NW)
  const cardinalAxes3D = useMemo(() => {
    const maxR = 30 * uvScale;
    const dirs = [
      { label: 'U (Utara)', angleDeg: 0, x: 0, y: maxR + 18, color: '#38bdf8' },
      { label: 'T (Timur)', angleDeg: 90, x: maxR + 18, y: 0, color: '#f43f5e' },
      { label: 'S (Selatan)', angleDeg: 180, x: 0, y: -maxR - 18, color: '#94a3b8' },
      { label: 'B (Barat)', angleDeg: 270, x: -maxR - 18, y: 0, color: '#94a3b8' }
    ];

    const lines = [
      { from: { x: 0, y: -maxR, z: 0 }, to: { x: 0, y: maxR, z: 0 }, label: 'Meridional (V)' },
      { from: { x: -maxR, y: 0, z: 0 }, to: { x: maxR, y: 0, z: 0 }, label: 'Zonal (U)' }
    ];

    return { dirs, lines };
  }, [uvScale]);

  // Vertical Altitude Spine Ticks
  const altitudeSpineTicks = useMemo(() => {
    const ticks: { alt: number; pos: Point3D }[] = [];
    const step = maxAlt > 15000 ? 5000 : 2000;
    for (let alt = step; alt <= maxAlt; alt += step) {
      ticks.push({
        alt,
        pos: { x: 0, y: 0, z: alt * heightScaleZ }
      });
    }
    return ticks;
  }, [maxAlt, heightScaleZ]);

  // Camera Presets
  const setCameraPreset = (preset: 'iso' | 'top' | 'front' | 'side' | 'ground') => {
    setAutoRotate(false);
    switch (preset) {
      case 'iso':
        setYaw(45);
        setPitch(25);
        setZoom(1.0);
        break;
      case 'top':
        setYaw(0);
        setPitch(89.5);
        setZoom(1.1);
        break;
      case 'front':
        setYaw(0);
        setPitch(0);
        setZoom(1.05);
        break;
      case 'side':
        setYaw(90);
        setPitch(0);
        setZoom(1.05);
        break;
      case 'ground':
        setYaw(30);
        setPitch(8);
        setZoom(1.25);
        break;
    }
  };

  // Generate Projected 3D Curve Path using D3 line generator
  const trajectoryD3Path = useMemo(() => {
    const activePoints = viewMode === 'spiral' 
      ? spiral3DPoints.map(p => project3D(p.pos3d))
      : flight3DPoints.map(p => project3D(p.pos3d));

    if (activePoints.length < 2) return '';

    const lineGen = d3.line<ProjectedPoint>()
      .x(d => d.x2d)
      .y(d => d.y2d)
      .curve(d3.curveCatmullRom.alpha(0.5));

    return lineGen(activePoints) || '';
  }, [viewMode, spiral3DPoints, flight3DPoints, project3D]);

  // Sort Drawable Objects for Depth Ordering (Painter's Algorithm)
  const sortedDrawableObjects = useMemo(() => {
    const objects: Array<{
      type: 'ring' | 'cardinal_line' | 'spine' | 'vector_arrow' | 'level_node';
      depth: number;
      render: () => React.ReactNode;
    }> = [];

    // 1. Floor Speed Rings
    speedRings3D.forEach((ring) => {
      const centerProj = project3D({ x: 0, y: 0, z: 0 });
      const ringLine = d3.line<Point3D>()
        .x(d => project3D(d).x2d)
        .y(d => project3D(d).y2d);

      const pathData = ringLine(ring.points) || '';
      objects.push({
        type: 'ring',
        depth: centerProj.depth - 10,
        render: () => (
          <g key={`ring-${ring.speed_kt}`}>
            <path
              d={pathData}
              fill="none"
              stroke={ring.speed_kt === 20 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.18)'}
              strokeWidth={ring.speed_kt === 20 ? 1.5 : 1.0}
              strokeDasharray={ring.speed_kt % 10 === 0 ? 'none' : '3,3'}
            />
            {(() => {
              const labelPt = project3D({ x: 0, y: ring.speed_kt * uvScale, z: 0 });
              return (
                <text
                  x={labelPt.x2d + 3}
                  y={labelPt.y2d - 2}
                  fontSize="9"
                  fill="rgba(148, 163, 184, 0.7)"
                  fontFamily="monospace"
                >
                  {ring.speed_kt}kt
                </text>
              );
            })()}
          </g>
        )
      });
    });

    // 2. Cardinal Floor Lines
    cardinalAxes3D.lines.forEach((line, idx) => {
      const p1 = project3D(line.from);
      const p2 = project3D(line.to);
      objects.push({
        type: 'cardinal_line',
        depth: (p1.depth + p2.depth) / 2 - 5,
        render: () => (
          <line
            key={`card-line-${idx}`}
            x1={p1.x2d}
            y1={p1.y2d}
            x2={p2.x2d}
            y2={p2.y2d}
            stroke="rgba(100, 116, 139, 0.3)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        )
      });
    });

    // 3. Central Vertical Altitude Spine Axis
    const spineBase = project3D({ x: 0, y: 0, z: 0 });
    const spineTop = project3D({ x: 0, y: 0, z: maxAlt * heightScaleZ + 20 });
    objects.push({
      type: 'spine',
      depth: (spineBase.depth + spineTop.depth) / 2,
      render: () => (
        <g key="altitude-spine">
          <line
            x1={spineBase.x2d}
            y1={spineBase.y2d}
            x2={spineTop.x2d}
            y2={spineTop.y2d}
            stroke="rgba(148, 163, 184, 0.6)"
            strokeWidth={1.8}
          />
          {altitudeSpineTicks.map((tick) => {
            const tickProj = project3D(tick.pos);
            return (
              <g key={`spine-tick-${tick.alt}`}>
                <circle
                  cx={tickProj.x2d}
                  cy={tickProj.y2d}
                  r={2.5}
                  fill="#94a3b8"
                />
                <text
                  x={tickProj.x2d + 8}
                  y={tickProj.y2d + 3}
                  fontSize="9"
                  fill="#94a3b8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {tick.alt.toLocaleString()} ft
                </text>
              </g>
            );
          })}
        </g>
      )
    });

    // 4. Mode-Specific Elements: Wind Vectors or Flight Waypoints
    if (viewMode === 'spiral') {
      spiral3DPoints.forEach((sp, idx) => {
        const spineOrigin = project3D({ x: 0, y: 0, z: sp.pos3d.z });
        const nodeProj = project3D(sp.pos3d);
        const col = getAltitudeColor(sp.orig.height_ft);
        const isSelected = selectedLevelIdx === idx;
        const avgDepth = (spineOrigin.depth + nodeProj.depth) / 2;

        objects.push({
          type: 'vector_arrow',
          depth: avgDepth,
          render: () => (
            <g key={`spiral-node-${idx}`}>
              {/* Radial Vector Line from Spine to (U, V, z) */}
              <line
                x1={spineOrigin.x2d}
                y1={spineOrigin.y2d}
                x2={nodeProj.x2d}
                y2={nodeProj.y2d}
                stroke={col}
                strokeWidth={isSelected ? 2.5 : 1.2}
                strokeOpacity={0.7}
                strokeDasharray={isSelected ? 'none' : '2,2'}
              />
              {/* Ground Drop Indicator Line */}
              <line
                x1={nodeProj.x2d}
                y1={nodeProj.y2d}
                x2={project3D({ x: sp.pos3d.x, y: sp.pos3d.y, z: 0 }).x2d}
                y2={project3D({ x: sp.pos3d.x, y: sp.pos3d.y, z: 0 }).y2d}
                stroke={col}
                strokeWidth={0.8}
                strokeOpacity={0.2}
                strokeDasharray="1,3"
              />
              {/* Level Sphere Marker */}
              <circle
                cx={nodeProj.x2d}
                cy={nodeProj.y2d}
                r={isSelected ? 8 : (idx === 0 ? 6.5 : 4.5)}
                fill={col}
                stroke="#0f172a"
                strokeWidth={1.5}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredLevel(sp.orig)}
                onMouseLeave={() => setHoveredLevel(null)}
                onClick={() => onSelectLevel(isSelected ? null : idx)}
              />
              {/* Altitude Text Label for Significant Levels */}
              {(idx === 0 || idx === spiral3DPoints.length - 1 || sp.orig.height_ft % 5000 === 0) && (
                <text
                  x={nodeProj.x2d + 7}
                  y={nodeProj.y2d - 5}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0f172a"
                  filter="drop-shadow(0 1px 1px rgba(255,255,255,0.9))"
                >
                  {sp.orig.height_ft} ft
                </text>
              )}
            </g>
          )
        });
      });
    } else {
      // Flight Trajectory Waypoints
      flight3DPoints.forEach((fp, idx) => {
        const nodeProj = project3D(fp.pos3d);
        const col = getAltitudeColor(fp.height_ft);
        const isLast = idx === flight3DPoints.length - 1;

        objects.push({
          type: 'level_node',
          depth: nodeProj.depth,
          render: () => (
            <g key={`flight-node-${idx}`}>
              <circle
                cx={nodeProj.x2d}
                cy={nodeProj.y2d}
                r={isLast ? 6 : (idx === 0 ? 5 : 3.5)}
                fill={isLast ? '#ef4444' : (idx === 0 ? '#10b981' : col)}
                stroke="#0f172a"
                strokeWidth={1.2}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLevel(fp)}
                onMouseLeave={() => setHoveredLevel(null)}
              />
              {isLast && (
                <text
                  x={nodeProj.x2d + 8}
                  y={nodeProj.y2d - 4}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ef4444"
                >
                  Terminasi ({fp.height_ft} ft)
                </text>
              )}
            </g>
          )
        });
      });
    }

    return objects.sort((a, b) => a.depth - b.depth);
  }, [
    speedRings3D,
    cardinalAxes3D,
    altitudeSpineTicks,
    viewMode,
    spiral3DPoints,
    flight3DPoints,
    project3D,
    getAltitudeColor,
    selectedLevelIdx,
    uvScale,
    maxAlt,
    heightScaleZ,
    onSelectLevel
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* 3D Viewport Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Left: Mode Selection & D3.js Badge */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('spiral')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'spiral'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Hodograph Spiral 3D
            </button>
            <button
              onClick={() => onViewModeChange('trajectory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'trajectory'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Trajektori Fisik Balon
            </button>
          </div>

          <a
            href="https://d3js.org/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-semibold transition-all"
            title="Kunjungi dokumentasi resmi D3.js"
          >
            <span>D3.js Engine</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Center: Camera Presets */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 text-[10px] px-2 font-mono hidden md:inline">Kamera:</span>
          <button
            onClick={() => setCameraPreset('iso')}
            className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all text-[11px] font-medium shadow-xs"
          >
            3D Isometrik
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-sky-700 border border-slate-200 transition-all text-[11px] font-medium shadow-xs"
            title="Tampak Atas 2D (Sesuai Diagram Hodograph Asli)"
          >
            Top-Down 2D
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 transition-all text-[11px] font-medium shadow-xs"
            title="Profil Komponen U vs Ketinggian"
          >
            Depan (U)
          </button>
          <button
            onClick={() => setCameraPreset('side')}
            className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-purple-700 border border-slate-200 transition-all text-[11px] font-medium shadow-xs"
            title="Profil Komponen V vs Ketinggian"
          >
            Samping (V)
          </button>
          <button
            onClick={() => setCameraPreset('ground')}
            className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-amber-700 border border-slate-200 transition-all text-[11px] font-medium shadow-xs"
            title="Sudut Pandang Pengamat di Permukaan"
          >
            Observer
          </button>
        </div>

        {/* Right: Controls & Vertical Adjustment Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Vertical Position Nudge Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setPan(p => ({ ...p, y: p.y + 25 }))}
              className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition-all shadow-xs flex items-center gap-1 text-[11px] font-medium"
              title="Geser Tampilan Lebih ke Bawah (Shift Down)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ke Bawah</span>
            </button>
            <button
              onClick={() => setPan(p => ({ ...p, y: p.y - 25 }))}
              className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 transition-all shadow-xs flex items-center gap-1 text-[11px] font-medium ml-1"
              title="Geser Tampilan Lebih ke Atas (Shift Up)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ke Atas</span>
            </button>
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
              autoRotate
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
            }`}
            title="Rotasi Otomatis 360°"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Auto Rotate</span>
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPan({ x: 0, y: 0 });
              setYaw(45);
              setPitch(25);
            }}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 transition-all shadow-xs"
            title="Reset Sudut, Posisi & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive D3 SVG Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full h-[600px] bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden shadow-sm cursor-grab active:cursor-grabbing select-none"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full block"
        >
          <defs>
            <radialGradient id="launchPadGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </radialGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Launch Pad at (0, 0, 0) */}
          {(() => {
            const originProj = project3D({ x: 0, y: 0, z: 0 });
            return (
              <g>
                <ellipse
                  cx={originProj.x2d}
                  cy={originProj.y2d}
                  rx={26 * zoom}
                  ry={12 * zoom}
                  fill="url(#launchPadGradient)"
                />
                <circle
                  cx={originProj.x2d}
                  cy={originProj.y2d}
                  r={3.5}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth={1}
                />
                <text
                  x={originProj.x2d + 6}
                  y={originProj.y2d + 12}
                  fontSize="9"
                  fill="#0284c7"
                  fontWeight="bold"
                >
                  Stasiun Peluncuran (0,0)
                </text>
              </g>
            );
          })()}

          {/* Depth-Sorted 3D Elements (Rings, Axis, Vectors, Spheres) */}
          {sortedDrawableObjects.map(obj => obj.render())}

          {/* Continuous Spline Trajectory Curve */}
          <path
            d={trajectoryD3Path}
            fill="none"
            stroke={viewMode === 'spiral' ? '#0284c7' : '#059669'}
            strokeWidth={2.8}
            filter="url(#glowEffect)"
            strokeOpacity={0.85}
          />

          {/* Cardinal Directions Floor Labels */}
          {cardinalAxes3D.dirs.map((dir, idx) => {
            const p = project3D({ x: dir.x, y: dir.y, z: 0 });
            return (
              <text
                key={`card-dir-${idx}`}
                x={p.x2d}
                y={p.y2d}
                fontSize="11"
                fontWeight="bold"
                fill={dir.color}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {dir.label}
              </text>
            );
          })}

          {/* Dynamic 3D Simulated Balloon & Glowing Indicator */}
          {activeBalloonState && (
            <g>
              <circle
                cx={activeBalloonState.proj.x2d}
                cy={activeBalloonState.proj.y2d}
                r={10}
                fill="#f59e0b"
                fillOpacity={0.25}
                className="animate-ping"
              />
              <circle
                cx={activeBalloonState.proj.x2d}
                cy={activeBalloonState.proj.y2d}
                r={6}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>

        {/* Top-Left: Mathematical HUD Info */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 pointer-events-none space-y-1 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span className="text-[11px] font-bold text-slate-800">D3.js 3D Projection Matrix</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Yaw: {Math.round(yaw)}° | Pitch: {Math.round(pitch)}° | Zoom: {(zoom * 100).toFixed(0)}%{pan.y !== 0 ? ` | Vertikal: ${pan.y > 0 ? `+${pan.y}` : pan.y}px` : ''}
          </div>
        </div>

        {/* Hover Level Floating Tooltip */}
        {hoveredLevel && (
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-sky-300 shadow-xl text-xs font-mono text-slate-800 space-y-1 min-w-[200px] pointer-events-none">
            <div className="text-sky-700 font-bold border-b border-slate-200 pb-1 text-[11px]">
              Ketinggian: {hoveredLevel.height_ft?.toLocaleString()} ft ({hoveredLevel.height_m?.toLocaleString()} m)
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-[11px] pt-1">
              <div>Kecepatan: <strong className="text-emerald-700">{hoveredLevel.speed_kt} kt</strong></div>
              <div>Arah: <strong className="text-amber-700">{hoveredLevel.direction_deg}°</strong></div>
              {hoveredLevel.u !== undefined && (
                <>
                  <div>U (Zonal): <strong className="text-sky-700">{hoveredLevel.u} kt</strong></div>
                  <div>V (Meridional): <strong className="text-indigo-700">{hoveredLevel.v} kt</strong></div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Floating Control HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Play / Pause & Scrubber */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs text-xs ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Jeda' : 'Simulasi Terbang'}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setPlaybackProgress(0);
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shadow-xs"
              title="Reset ke Awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    playbackSpeed === s ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Flying Balloon Readout */}
          {activeBalloonState && (
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 font-sans">Ketinggian:</span>{' '}
                <strong className="text-emerald-700">{activeBalloonState.height_ft.toLocaleString()} ft</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Angin:</span>{' '}
                <strong className="text-amber-700">{activeBalloonState.dir_deg}° / {activeBalloonState.speed_kt} kt</strong>
              </div>
            </div>
          )}

          {/* Scrubber Progress Slider */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-[10px] text-slate-500 font-mono">0%</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={playbackProgress}
              onChange={(e) => {
                setIsPlaying(false);
                setPlaybackProgress(parseFloat(e.target.value));
              }}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-500 font-mono">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
