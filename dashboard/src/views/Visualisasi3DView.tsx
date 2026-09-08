import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PibalBundle, AnalysisObservation, ProcessedObservation } from '../types/pibal';
import { SourceBadge } from '../components/SourceBadge';
import { D3Visualizer3D } from '../components/D3Visualizer3D';
import { 
  Box, 
  RotateCw, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Wind, 
  Compass, 
  Info,
  Navigation,
  Sliders,
  Sparkles,
  Download,
  Terminal,
  Cpu,
  Copy,
  Check
} from 'lucide-react';

interface Visualisasi3DViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
}

export const Visualisasi3DView: React.FC<Visualisasi3DViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation
}) => {
  const { analysis_observations, processed_observations } = data;
  const mountRef = useRef<HTMLDivElement>(null);

  // States
  const [renderEngine, setRenderEngine] = useState<'d3' | 'three'>('d3');
  const [viewMode, setViewMode] = useState<'spiral' | 'trajectory'>('spiral');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  // Selected observations
  const primaryObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  const primaryProcObs = useMemo(() => {
    return processed_observations.find(o => o.observation_id === primaryObs.observation_id) || processed_observations[0];
  }, [processed_observations, primaryObs]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const balloonMeshRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Trajectory points in 3D
  const spiralPoints3D = useMemo(() => {
    const pts = primaryObs.hodograph_points;
    if (!pts.length) return [];
    
    // Scale factor:
    // U: East-West -> X (1 kt = 2 units)
    // V: North-South -> Z (-V because North is -Z in default Three.js) (1 kt = 2 units)
    // Altitude: Height ft -> Y (1000 ft = 4 units)
    const maxAlt = primaryObs.statistics.max_altitude_ft || 10000;
    const heightScale = 40 / Math.max(maxAlt, 5000);

    return pts.map(p => {
      const x = p.u * 2.2;
      const y = p.height_ft * heightScale;
      const z = -p.v * 2.2;
      return {
        pos: new THREE.Vector3(x, y, z),
        orig: p
      };
    });
  }, [primaryObs]);

  // Physical flight trajectory in 3D based on theodolite minute records
  const flightTrajectory3D = useMemo(() => {
    const records = primaryProcObs.theodolite_records.filter(r => r.elevation && r.elevation > 0 && r.azimuth !== null);
    if (!records.length) {
      // Fallback from spiral points if theodolite raw is sparse
      return spiralPoints3D.map((sp, idx) => ({
        pos: new THREE.Vector3(sp.pos.x * 2, sp.pos.y, sp.pos.z * 2),
        minute: idx * 2,
        height_ft: sp.orig.height_ft,
        speed_kt: sp.orig.speed_kt,
        dir_deg: sp.orig.direction_deg
      }));
    }

    // Ascent rate: ~600 ft/min (~180 m/min)
    const ascentRateFt = 600;
    const maxZ = records[records.length - 1].minute * ascentRateFt;
    const heightScale = 40 / Math.max(maxZ, 5000);

    return records.map(r => {
      const zFt = r.minute * ascentRateFt;
      const elRad = (r.elevation! * Math.PI) / 180;
      const azRad = (r.azimuth! * Math.PI) / 180;
      
      const horizDistFt = zFt / Math.tan(elRad);
      // Scale horizontal distance: 5000 ft = 15 units
      const horizScale = 0.003;
      const x = horizDistFt * Math.sin(azRad) * horizScale;
      const z = -horizDistFt * Math.cos(azRad) * horizScale;
      const y = zFt * heightScale;

      return {
        pos: new THREE.Vector3(x, y, z),
        minute: r.minute,
        height_ft: zFt,
        speed_kt: r.derived_speed || 10,
        dir_deg: r.derived_dir || 120
      };
    });
  }, [primaryProcObs, spiralPoints3D]);

  // Set Camera Presets
  const setCameraPreset = (preset: 'isometric' | 'top' | 'front' | 'side' | 'ground') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (preset) {
      case 'isometric':
        cam.position.set(45, 34, 52);
        ctrl.target.set(0, 20, 0);
        break;
      case 'top':
        cam.position.set(0, 75, 0.001);
        ctrl.target.set(0, 0, 0);
        break;
      case 'front':
        cam.position.set(0, 22, 65);
        ctrl.target.set(0, 22, 0);
        break;
      case 'side':
        cam.position.set(65, 22, 0);
        ctrl.target.set(0, 22, 0);
        break;
      case 'ground':
        cam.position.set(0, 2, 8);
        ctrl.target.set(0, 15, -15);
        break;
    }
    ctrl.update();
  };

  // Main Three.js Scene Setup & Re-render
  useEffect(() => {
    if (renderEngine !== 'three' || !mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Clean Salt White/Mist
    sceneRef.current = scene;

    // Atmospheric Fog
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.003);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(45, 34, 52);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Clear previous children
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 20, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go below ground
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight.position.set(30, 60, 40);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const groundLight = new THREE.DirectionalLight(0x34d399, 0.5);
    groundLight.position.set(-20, -10, -20);
    scene.add(groundLight);

    // 6. Ground Plane & Polar Compass Grid
    const groundSize = 100;
    const gridHelper = new THREE.GridHelper(groundSize, 40, 0x0284c7, 0xcbd5e1);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Concentric Speed Rings on Floor (5, 10, 15, 20, 25, 30 kt)
    [5, 10, 15, 20, 25, 30].forEach(spd => {
      const ringGeo = new THREE.RingGeometry(spd * 2.2 - 0.15, spd * 2.2 + 0.15, 64);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: spd === 20 ? 0xf59e0b : 0x0ea5e9, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.25 
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.02;
      scene.add(ringMesh);
    });

    // Central Vertical Spine Axis (Height Axis)
    const spineHeight = 45;
    const spineGeo = new THREE.CylinderGeometry(0.12, 0.12, spineHeight, 16);
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.y = spineHeight / 2;
    scene.add(spineMesh);

    // Ground Station Model (Cilacap Launch Site)
    const stationGroup = new THREE.Group();
    // Base dome
    const domeGeo = new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.6 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    stationGroup.add(dome);
    // Mast
    const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 1.5;
    stationGroup.add(mast);
    scene.add(stationGroup);

    // 7. BUILD 3D OBJECTS BASED ON VIEW MODE
    if (viewMode === 'spiral') {
      // MODE A: 3D HODOGRAPH SPIRAL
      if (spiralPoints3D.length > 1) {
        const curvePoints = spiralPoints3D.map(p => p.pos);
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        
        // Tube Geometry
        const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.45, 12, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.25,
          metalness: 0.5,
          emissive: 0x0284c7,
          emissiveIntensity: 0.3
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeMesh);

        // Add Level Markers & Vector Arrows from Spine to Point
        spiralPoints3D.forEach((sp, idx) => {
          // Color based on height
          const col = sp.orig.height_ft === 0 ? 0x38bdf8 :
                      sp.orig.height_ft <= 2000 ? 0x34d399 :
                      sp.orig.height_ft <= 5000 ? 0xfbbf24 :
                      sp.orig.height_ft <= 10000 ? 0xf97316 : 0xa855f7;

          // Sphere Marker
          const sphereGeo = new THREE.SphereGeometry(idx === 0 ? 0.9 : 0.7, 24, 24);
          const sphereMat = new THREE.MeshStandardMaterial({ 
            color: col,
            roughness: 0.2,
            metalness: 0.3,
            emissive: col,
            emissiveIntensity: 0.4
          });
          const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
          sphereMesh.position.copy(sp.pos);
          scene.add(sphereMesh);

          // Vector line connecting spine to point at this altitude
          const spinePoint = new THREE.Vector3(0, sp.pos.y, 0);
          const lineGeo = new THREE.BufferGeometry().setFromPoints([spinePoint, sp.pos]);
          const lineMat = new THREE.LineDashedMaterial({
            color: 0x475569,
            dashSize: 0.8,
            gapSize: 0.4,
            transparent: true,
            opacity: 0.6
          });
          const line = new THREE.Line(lineGeo, lineMat);
          line.computeLineDistances();
          scene.add(line);
        });
      }
    } else {
      // MODE B: 3D BALLOON FLIGHT TRAJECTORY
      if (flightTrajectory3D.length > 1) {
        const trajPoints = flightTrajectory3D.map(p => p.pos);
        const trajCurve = new THREE.CatmullRomCurve3(trajPoints);

        // Glowing flight path tube
        const trajGeo = new THREE.TubeGeometry(trajCurve, 150, 0.4, 10, false);
        const trajMat = new THREE.MeshStandardMaterial({
          color: 0x34d399,
          emissive: 0x059669,
          emissiveIntensity: 0.6,
          roughness: 0.2
        });
        const trajMesh = new THREE.Mesh(trajGeo, trajMat);
        scene.add(trajMesh);

        // Waypoints
        flightTrajectory3D.forEach((tp, idx) => {
          const wpGeo = new THREE.SphereGeometry(idx === 0 ? 0.8 : 0.45, 16, 16);
          const wpMat = new THREE.MeshBasicMaterial({ color: idx === flightTrajectory3D.length - 1 ? 0xf43f5e : 0x34d399 });
          const wpMesh = new THREE.Mesh(wpGeo, wpMat);
          wpMesh.position.copy(tp.pos);
          scene.add(wpMesh);
        });

        // Interactive Balloon Model
        const balloonGroup = new THREE.Group();
        // Rubber Balloon
        const ballGeo = new THREE.SphereGeometry(1.6, 24, 24);
        ballGeo.scale(1, 1.25, 1);
        const ballMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1,
          emissive: 0xe2e8f0,
          emissiveIntensity: 0.2
        });
        const ballMesh = new THREE.Mesh(ballGeo, ballMat);
        balloonGroup.add(ballMesh);
        // Suspension string
        const stringGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
        const stringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
        const stringMesh = new THREE.Mesh(stringGeo, stringMat);
        stringMesh.position.y = -2;
        balloonGroup.add(stringMesh);

        balloonMeshRef.current = balloonGroup;
        scene.add(balloonGroup);
      }
    }

    // Animation Loop
    const clock = new THREE.Clock();
    let currentT = 0;

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.2;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      controls.update();

      // Balloon flight playback in Trajectory mode
      if (viewMode === 'trajectory' && balloonMeshRef.current && flightTrajectory3D.length > 1) {
        if (isPlaying) {
          currentT += delta * 0.1 * playbackSpeed;
          if (currentT > 1) currentT = 0;
          setPlaybackProgress(currentT);
        } else {
          currentT = playbackProgress;
        }

        const curve = new THREE.CatmullRomCurve3(flightTrajectory3D.map(p => p.pos));
        const pos = curve.getPoint(currentT);
        balloonMeshRef.current.position.copy(pos);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
    };
  }, [renderEngine, viewMode, spiralPoints3D, flightTrajectory3D, autoRotate]);

  // Scrub bar change
  const handleScrub = (val: number) => {
    setPlaybackProgress(val);
    if (balloonMeshRef.current && flightTrajectory3D.length > 1) {
      const curve = new THREE.CatmullRomCurve3(flightTrajectory3D.map(p => p.pos));
      balloonMeshRef.current.position.copy(curve.getPoint(val));
    }
  };

  // Current interpolated balloon stats
  const activeBalloonStats = useMemo(() => {
    if (flightTrajectory3D.length === 0) return null;
    const idx = Math.min(
      Math.floor(playbackProgress * (flightTrajectory3D.length - 1)),
      flightTrajectory3D.length - 1
    );
    return flightTrajectory3D[idx];
  }, [playbackProgress, flightTrajectory3D]);

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Visualisasi 3D WebGL Atmosfer
            </span>
            <SourceBadge sourceFile={primaryObs.source_file} sourcePage={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Eksplorasi Ruang 3D Profil Angin & Balon PiBal ({primaryObs.date_iso})
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Rotasi 360° interaktif: amati kurvatur spiral hodograph dan rekonstruksi fisik pergerakan balon di atas Cilacap.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 3D Engine Selector: D3.js vs Three.js */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
            <span className="text-[10px] text-slate-600 px-2 font-mono font-bold">Engine 3D:</span>
            <button
              onClick={() => setRenderEngine('d3')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                renderEngine === 'd3'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> D3.js (d3js.org)
            </button>
            <button
              onClick={() => setRenderEngine('three')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                renderEngine === 'three'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> Three.js (WebGL)
            </button>
          </div>

          {/* Observation Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedObsId}
              onChange={(e) => onSelectObservation(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer font-semibold"
            >
              {analysis_observations.map(obs => (
                <option key={obs.observation_id} value={obs.observation_id} className="bg-white text-slate-900">
                  {obs.date_iso} ({obs.statistics.max_altitude_ft} ft)
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('spiral')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'spiral' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> 3D Hodograph Spiral
            </button>
            <button
              onClick={() => setViewMode('trajectory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'trajectory' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wind className="w-3.5 h-3.5" /> 3D Trajektori Terbang
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs border transition-all ${
              autoRotate 
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Auto-Rotate 360°"
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3D Canvas Rendering Area: D3.js vs Three.js */}
      {renderEngine === 'd3' ? (
        <D3Visualizer3D
          primaryObs={primaryObs}
          primaryProcObs={primaryProcObs}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedLevelIdx={selectedLevelIdx}
          onSelectLevel={setSelectedLevelIdx}
        />
      ) : (
        /* 3D WebGL Canvas Container */
        <div className={`relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[620px]'
        }`}>
          {/* Three.js Canvas Mount */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top-Left: Camera Presets HUD */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <span className="text-[11px] font-bold text-slate-500 px-2 uppercase tracking-wider">Sudut Pandang:</span>
          <button
            onClick={() => setCameraPreset('isometric')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all font-semibold"
          >
            3D Isometrik
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 transition-all font-semibold"
          >
            Atas (2D Hodograph)
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-700 transition-all font-semibold"
          >
            Depan (Profil U)
          </button>
          <button
            onClick={() => setCameraPreset('side')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-700 transition-all font-semibold"
          >
            Samping (Profil V)
          </button>
          <button
            onClick={() => setCameraPreset('ground')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-purple-700 transition-all font-semibold"
          >
            Posisi Observer
          </button>
        </div>

        {/* Top-Right: Instructions & Fullscreen */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Floating Card: Mode-Specific HUD */}
        {viewMode === 'spiral' ? (
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <strong className="text-slate-900 font-bold text-sm">3D Hodograph Spiral (U - V - Ketinggian)</strong>
              </div>
              <p className="text-slate-600">
                • <strong>Sumbu Vertikal:</strong> Ketinggian (0 s/d {primaryObs.statistics.max_altitude_ft} ft) | 
                • <strong>Bidang Datar:</strong> Komponen U (Barat-Timur) & Komponen V (Selatan-Utara).
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Lapisan Teramati</span>
                <span className="font-bold text-blue-700 text-sm">{primaryObs.statistics.total_levels} Level</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Kecepatan Maks</span>
                <span className="font-bold text-emerald-700 text-sm">{primaryObs.statistics.max_speed_kt} knot</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Ketinggian Puncak</span>
                <span className="font-bold text-amber-700 text-sm">{primaryObs.statistics.max_altitude_ft.toLocaleString()} ft</span>
              </div>
            </div>
          </div>
        ) : (
          /* Mode B: Flight Animation Controls */
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex flex-col gap-3 text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isPlaying 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Jeda Simulasi' : 'Putar Simulasi Terbang'}
                </button>

                <button
                  onClick={() => handleScrub(0)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                  title="Ulang dari Peluncuran"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed Multiplier */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {[1, 2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        playbackSpeed === s ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Time Flight Stats */}
              {activeBalloonStats && (
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 font-sans">Waktu Terbang:</span>{' '}
                    <strong className="text-blue-700">Menit ke-{activeBalloonStats.minute}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Ketinggian:</span>{' '}
                    <strong className="text-emerald-700">{activeBalloonStats.height_ft.toLocaleString()} ft</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Angin:</span>{' '}
                    <strong className="text-amber-700">{activeBalloonStats.dir_deg}° / {activeBalloonStats.speed_kt} kt</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Scrubber Range Input */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-mono">00:00</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={playbackProgress}
                onChange={(e) => handleScrub(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                {flightTrajectory3D[flightTrajectory3D.length - 1]?.minute}:00
              </span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Guide & Controls Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <h4 className="font-bold text-blue-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" /> Navigasi Kontrol 3D:
          </h4>
          <ul className="space-y-1 text-slate-600">
            <li>• <strong>Klik Kiri + Geser:</strong> Memutar sudut pandang 3D secara bebas (Orbit).</li>
            <li>• <strong>Scroll Roda Mouse:</strong> Zoom In / Zoom Out.</li>
            <li>• <strong>Klik Kanan + Geser:</strong> Menggeser posisi kanvas (Pan).</li>
            <li>• <strong>Tombol Sudut Pandang:</strong> Akses instan ke tampak atas 2D, depan, samping, atau ground.</li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <h4 className="font-bold text-emerald-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" /> Relevansi Fisika Meteorologi:
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Dalam mode <strong>Spiral 3D</strong>, Anda dapat melihat langsung bagaimana hodograph 2D klasik sesungguhnya adalah proyeksi ortogonal dari spiral vektor atmosfer vertikal yang berputar sesuai hukum angin termal dan gaya gesek permukaan (<em>Ekman Spiral</em>).
          </p>
        </div>
      </div>

      {/* Open3D Python Engine Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Mesin Grafik 3D Open3D (Python Native)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  Open3D v0.19.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Visualisasi 3D native desktop dengan akselerasi perangkat keras OpenGL, vektor Rodrigues, dan ekspor model geometri PLY.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/exports_3d/${primaryObs.observation_id}_spiral.ply`}
              download={`${primaryObs.observation_id}_spiral.ply`}
              className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
              title="Unduh 3D Spiral PLY"
            >
              <Download className="w-4 h-4 text-sky-600" />
              Unduh Spiral .PLY
            </a>
            <a
              href={`/exports_3d/${primaryObs.observation_id}_trajectory.ply`}
              download={`${primaryObs.observation_id}_trajectory.ply`}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
              title="Unduh 3D Trajektori Balon PLY"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Unduh Trajektori .PLY
            </a>
          </div>
        </div>

        {/* Commands Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Terminal className="w-4 h-4 text-sky-600" />
            <span>Perintah Menjalankan Open3D Native Desktop Window:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Command 1: Spiral */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-sky-700">1. Hodograph Spiral 3D</span>
                  <span className="text-[10px] text-slate-500">Tanggal Aktif</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menampilkan spiral vektor U-V vertikal dengan panah 3D dan cincin isotach.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                <span className="truncate">.venv\Scripts\python.exe visualizer_open3d.py --mode spiral --date {primaryObs.date_iso}</span>
                <button
                  onClick={() => handleCopyCommand(`.venv\\Scripts\\python.exe visualizer_open3d.py --mode spiral --date ${primaryObs.date_iso}`)}
                  className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                  title="Salin Perintah"
                >
                  {copiedCmd === `.venv\\Scripts\\python.exe visualizer_open3d.py --mode spiral --date ${primaryObs.date_iso}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Command 2: Trajectory */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-700">2. Trajektori Fisik Balon</span>
                  <span className="text-[10px] text-slate-500">Theodolit Drift</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menampilkan jalur fisik drift balon dari azimuth & elevasi teodolit menit ke menit.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                <span className="truncate">.venv\Scripts\python.exe visualizer_open3d.py --mode trajectory --date {primaryObs.date_iso}</span>
                <button
                  onClick={() => handleCopyCommand(`.venv\\Scripts\\python.exe visualizer_open3d.py --mode trajectory --date ${primaryObs.date_iso}`)}
                  className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                  title="Salin Perintah"
                >
                  {copiedCmd === `.venv\\Scripts\\python.exe visualizer_open3d.py --mode trajectory --date ${primaryObs.date_iso}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Command 3: Overlay */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-700">3. Multi-Day Overlay (21 Hari)</span>
                  <span className="text-[10px] text-slate-500">Agustus 2026</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menumpuk 21 lintasan spiral di ruang 3D terpadu untuk analisis variasi vertikal bulanan.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                <span className="truncate">.venv\Scripts\python.exe visualizer_open3d.py --mode overlay</span>
                <button
                  onClick={() => handleCopyCommand(`.venv\\Scripts\\python.exe visualizer_open3d.py --mode overlay`)}
                  className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                  title="Salin Perintah"
                >
                  {copiedCmd === `.venv\\Scripts\\python.exe visualizer_open3d.py --mode overlay` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>File <strong>.PLY</strong> tersimpan di <code>data/exports_3d/</code> dan kompatibel dengan Blender, MeshLab, CloudCompare, dan viewer 3D lainnya.</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Vertex Normals: Dihitung Otomatis</span>
            <span>•</span>
            <span>Rotasi: Formula Rodrigues</span>
            <span>•</span>
            <span>Skala Vertikal: 0.003</span>
          </div>
        </div>
      </div>
    </div>
  );
};
