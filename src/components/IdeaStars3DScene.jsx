import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Individual Floating 3D Glowing Star
function GlowingIdeaStar({ 
  idea, 
  position, 
  onSelect, 
  isSelected, 
  index 
}) {
  const groupRef = useRef();
  const starCoreRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Custom Star Colors based on Innovation Score
  const starColors = [
    { core: '#fbbf24', emissive: '#f59e0b', halo: '#d97706' }, // Gold
    { core: '#00f5d4', emissive: '#00d2ff', halo: '#0284c7' }, // Cyan
    { core: '#a855f7', emissive: '#9333ea', halo: '#7e22ce' }, // Purple
    { core: '#10b981', emissive: '#059669', halo: '#047857' }, // Emerald
    { core: '#f43f5e', emissive: '#e11d48', halo: '#be123c' }  // Rose
  ];

  const theme = starColors[index % starColors.length];

  useFrame((state) => {
    if (starCoreRef.current) {
      starCoreRef.current.rotation.y += 0.015 * (hovered ? 2.5 : 1);
      starCoreRef.current.rotation.z += 0.01 * (hovered ? 2.5 : 1);
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 3 + index) * 0.15;
      starCoreRef.current.scale.setScalar((hovered || isSelected ? 1.3 : 1) * pulse);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.5} floatingRange={[-0.4, 0.4]}>
      <group position={position} ref={groupRef}>
        {/* Core Star Geometric Mesh */}
        <mesh
          ref={starCoreRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(idea);
          }}
          className="cursor-pointer"
        >
          {/* Faceted star-like crystal geometry */}
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color={theme.core}
            emissive={theme.emissive}
            emissiveIntensity={hovered || isSelected ? 1.4 : 0.8}
            roughness={0.1}
            metalness={0.9}
            wireframe={hovered}
          />
        </mesh>

        {/* Outer Radiant Glow Flare */}
        <mesh scale={hovered || isSelected ? 1.8 : 1.45}>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshBasicMaterial
            color={theme.halo}
            transparent
            opacity={hovered || isSelected ? 0.35 : 0.12}
            wireframe
          />
        </mesh>

        {/* Local Point Light emitting from the star */}
        <pointLight
          color={theme.core}
          intensity={hovered || isSelected ? 2.5 : 1.2}
          distance={5}
        />

        {/* Floating 3D Badge on Hover or Selected */}
        <Html distanceFactor={12} center position={[0, 1.4, 0]}>
          <div
            onClick={() => onSelect(idea)}
            className={`cursor-pointer px-3 py-1.5 rounded-xl text-center whitespace-nowrap transition-all shadow-2xl backdrop-blur-md border ${
              isSelected || hovered
                ? 'bg-slate-900/95 border-amber-400 scale-110 ring-2 ring-amber-500/40'
                : 'bg-slate-950/80 border-white/10 hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs font-bold text-white">{idea.name}</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ★ {idea.innovationScore}
              </span>
            </div>
            <p className="text-[9px] text-slate-300 max-w-[150px] truncate mt-0.5">
              {idea.tagline}
            </p>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Celestial Constellation Connecting Lines
function ConstellationGrid({ positions }) {
  const lineGeometry = useMemo(() => {
    if (positions.length < 2) return null;
    const points = [];
    for (let i = 0; i < positions.length; i++) {
      points.push(positions[i]);
      points.push(positions[(i + 1) % positions.length]);
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positions]);

  if (!lineGeometry) return null;

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#a855f7" transparent opacity={0.2} />
    </line>
  );
}

export default function IdeaStars3DScene({ 
  ideas = [], 
  selectedIdea, 
  onSelectIdea 
}) {
  // Compute floating celestial arc positions for the 5 ideas
  const starPositions = useMemo(() => {
    return [
      new THREE.Vector3(-5.5, 1.2, -1),
      new THREE.Vector3(-2.8, 2.8, 0.5),
      new THREE.Vector3(0, 1.5, 1.2),
      new THREE.Vector3(2.8, 2.8, 0.5),
      new THREE.Vector3(5.5, 1.2, -1),
    ];
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden glass-panel border border-purple-500/30 shadow-2xl">
      {/* 3D Scene Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
          Gemini Ideation Constellation
        </span>
        <p className="text-[10px] text-slate-400 mt-1">Floating glowing stars • Click any star to inspect concept</p>
      </div>

      <Canvas
        camera={{ position: [0, 1, 9.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 10, 5]} intensity={1.5} color="#c084fc" />
        <pointLight position={[0, -10, -5]} intensity={1.0} color="#38bdf8" />

        {/* Ambient Cosmic Sparkles */}
        <Sparkles 
          count={120} 
          scale={16} 
          size={2.5} 
          speed={0.5} 
          color="#fde047" 
          opacity={0.7} 
        />

        {/* Constellation web line */}
        <ConstellationGrid positions={starPositions.slice(0, ideas.length)} />

        {/* Floating Glowing Stars */}
        {ideas.map((idea, idx) => {
          const isSelected = selectedIdea?.name === idea.name;
          const pos = starPositions[idx] || new THREE.Vector3(0, 0, 0);

          return (
            <GlowingIdeaStar
              key={idea.id || idx}
              idea={idea}
              position={pos}
              index={idx}
              isSelected={isSelected}
              onSelect={onSelectIdea}
            />
          );
        })}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 1.7} 
          minPolarAngle={Math.PI / 2.4} 
          rotateSpeed={0.5} 
        />
      </Canvas>
    </div>
  );
}
