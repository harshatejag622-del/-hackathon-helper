import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { MILESTONES } from '../utils/timelineEngine';

// Individual Floating Milestone Marker
function MilestoneMarker({ 
  milestone, 
  position, 
  onSelect, 
  isSelected, 
  index 
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015 * (hovered ? 2 : 1);
      meshRef.current.rotation.x += 0.008;
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 3 + index) * 0.12;
      meshRef.current.scale.setScalar((hovered || isSelected ? 1.3 : 1) * pulse);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <group position={position}>
        {/* Core Crystal Node */}
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(milestone);
          }}
          className="cursor-pointer"
        >
          <octahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial
            color={milestone.color}
            emissive={milestone.color}
            emissiveIntensity={hovered || isSelected ? 1.2 : 0.6}
            roughness={0.2}
            metalness={0.8}
            wireframe={hovered}
          />
        </mesh>

        {/* Outer Halo */}
        <mesh scale={hovered || isSelected ? 1.7 : 1.35}>
          <icosahedronGeometry args={[0.75, 0]} />
          <meshBasicMaterial
            color={milestone.color}
            wireframe
            transparent
            opacity={hovered || isSelected ? 0.35 : 0.12}
          />
        </mesh>

        {/* Milestone Vertical Anchor Line to Highway */}
        <line>
          <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -1.8, 0)
          ])} />
          <lineBasicMaterial attach="material" color={milestone.color} transparent opacity={0.5} />
        </line>

        {/* Floating 3D HTML Card */}
        <Html distanceFactor={11} center position={[0, 1.4, 0]}>
          <div
            onClick={() => onSelect(milestone)}
            className={`cursor-pointer px-3 py-2 rounded-2xl text-center whitespace-nowrap transition-all shadow-2xl backdrop-blur-md border ${
              isSelected || hovered
                ? 'bg-slate-900/95 border-emerald-400 scale-110 ring-2 ring-emerald-500/40'
                : 'bg-slate-950/80 border-white/10 hover:border-indigo-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-black text-white">{milestone.title.split(':')[0]}</span>
              <span 
                className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md"
                style={{ backgroundColor: `${milestone.color}25`, color: milestone.color }}
              >
                T+{milestone.targetHour}h
              </span>
            </div>
            <p className="text-[10px] text-slate-300 max-w-[170px] truncate mt-0.5">
              {milestone.desc}
            </p>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// 3D Timeline Highway Ribbon
function TimelineHighway() {
  const linePoints = useMemo(() => {
    const points = [];
    for (let x = -8; x <= 8; x += 0.5) {
      const y = -1.8 + Math.sin(x * 0.4) * 0.2;
      const z = Math.cos(x * 0.4) * 0.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(linePoints);
  }, [linePoints]);

  return (
    <group>
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#6366f1" transparent opacity={0.6} linewidth={3} />
      </line>

      {/* Guide rail under glow */}
      <line geometry={lineGeometry} position={[0, -0.05, 0]}>
        <lineBasicMaterial color="#a855f7" transparent opacity={0.3} linewidth={5} />
      </line>
    </group>
  );
}

// Active Sprint Progress Beacon moving along the highway
function ActiveProgressBeacon() {
  const beaconRef = useRef();

  useFrame((state) => {
    if (beaconRef.current) {
      // Moves smoothly along the start of the 48h sprint
      const t = (Math.sin(state.clock.getElapsedTime() * 0.8) + 1) / 2;
      const x = -7.5 + t * 4; // Between hour 0 and 16
      const y = -1.8 + Math.sin(x * 0.4) * 0.2;
      beaconRef.current.position.set(x, y, 0);
    }
  });

  return (
    <mesh ref={beaconRef}>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshBasicMaterial color="#00f5d4" />
      <pointLight color="#00f5d4" intensity={2} distance={3} />
    </mesh>
  );
}

export default function Timeline3DScene({ selectedMilestone, onSelectMilestone }) {
  // Map 5 milestones across the X-axis highway (-6 to +6)
  const milestonePositions = useMemo(() => {
    const startX = -6;
    const endX = 6;
    return MILESTONES.map((m, idx) => {
      const ratio = m.targetHour / 48;
      const x = startX + ratio * (endX - startX);
      const y = -1.8 + Math.sin(x * 0.4) * 0.2 + 1.8; // Raised above the highway
      const z = Math.cos(x * 0.4) * 0.5;
      return new THREE.Vector3(x, y, z);
    });
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden glass-panel border border-indigo-500/30 shadow-2xl">
      {/* 3D Scene Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
          3D 48-Hour Milestone Highway
        </span>
        <p className="text-[10px] text-slate-400 mt-1">Floating markers • Click a milestone to inspect deliverables</p>
      </div>

      <Canvas
        camera={{ position: [0, 0.5, 9.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
        <pointLight position={[-10, -10, -5]} intensity={1.2} color="#00f5d4" />

        {/* Ambient Cosmic Sparkles */}
        <Sparkles count={100} scale={16} size={2.2} speed={0.4} color="#6366f1" opacity={0.6} />

        {/* Highway Rail */}
        <TimelineHighway />
        <ActiveProgressBeacon />

        {/* Floating 3D Milestone Markers */}
        {MILESTONES.map((milestone, idx) => {
          const isSelected = selectedMilestone?.id === milestone.id;
          const pos = milestonePositions[idx];

          return (
            <MilestoneMarker
              key={milestone.id}
              milestone={milestone}
              position={pos}
              index={idx}
              isSelected={isSelected}
              onSelect={onSelectMilestone}
            />
          );
        })}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 1.7} 
          minPolarAngle={Math.PI / 2.3} 
          rotateSpeed={0.5} 
        />
      </Canvas>
    </div>
  );
}
