import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Energy pulse particle traveling along the connecting line
function EnergyPulse({ start, end, speed = 1.2, color = '#6366f1' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = (state.clock.getElapsedTime() * speed) % 1;
      meshRef.current.position.lerpVectors(start, end, t);
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 8) * 0.3;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Connecting Energy Line between Center User and Match Node
function AnimatedConnectionLine({ start, end, score, isHovered }) {
  const lineGeometry = useMemo(() => {
    const points = [start, end];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  const lineColor = score >= 90 ? '#10b981' : score >= 80 ? '#6366f1' : '#ec4899';

  return (
    <group>
      <line geometry={lineGeometry}>
        <lineBasicMaterial 
          color={isHovered ? '#00f5d4' : lineColor} 
          transparent 
          opacity={isHovered ? 0.9 : 0.45} 
          linewidth={isHovered ? 3 : 1.5}
        />
      </line>
      {/* 2 Staggered traveling energy pulses along the link */}
      <EnergyPulse start={start} end={end} speed={0.8} color={lineColor} />
      <EnergyPulse start={start} end={end} speed={1.4} color="#ffffff" />
    </group>
  );
}

// Candidate Match Node
function MatchNode({ 
  candidate, 
  position, 
  onSelect, 
  isSelected, 
  index 
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  const score = candidate.match?.percentage || 85;
  const nodeColor = score >= 90 ? '#10b981' : score >= 80 ? '#6366f1' : '#f43f5e';

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(candidate);
          }}
          scale={hovered || isSelected ? 1.3 : 1}
        >
          {index % 3 === 0 && <octahedronGeometry args={[0.9, 0]} />}
          {index % 3 === 1 && <dodecahedronGeometry args={[0.85, 0]} />}
          {index % 3 === 2 && <icosahedronGeometry args={[0.9, 0]} />}

          <meshStandardMaterial
            color={nodeColor}
            emissive={nodeColor}
            emissiveIntensity={hovered || isSelected ? 0.9 : 0.3}
            roughness={0.2}
            metalness={0.8}
            wireframe={hovered}
          />
        </mesh>

        {/* Outer Halo */}
        <mesh scale={hovered ? 1.5 : 1.25}>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshBasicMaterial
            color={nodeColor}
            wireframe
            transparent
            opacity={hovered ? 0.3 : 0.1}
          />
        </mesh>

        {/* Floating Name & Match Score Badge */}
        <Html distanceFactor={11} center position={[0, 1.4, 0]}>
          <div 
            onClick={() => onSelect(candidate)}
            className={`cursor-pointer px-2.5 py-1.5 rounded-xl text-center whitespace-nowrap transition-all shadow-xl backdrop-blur-md border ${
              isSelected || hovered
                ? 'bg-slate-900/95 border-emerald-400 scale-110 ring-2 ring-emerald-500/40'
                : 'bg-slate-950/80 border-white/10 hover:border-indigo-400'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs font-bold text-white">{candidate.displayName}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                score >= 90 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                {score}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {candidate.preferredRole} • {candidate.college}
            </span>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Center User Node
function UserCenterNode({ userProfile }) {
  const centerMeshRef = useRef();

  useFrame((state) => {
    if (centerMeshRef.current) {
      centerMeshRef.current.rotation.y += 0.008;
      centerMeshRef.current.rotation.z += 0.005;
    }
  });

  const userName = userProfile?.displayName || 'You (Leader)';

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={centerMeshRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial
          color="#00f5d4"
          emissive="#00d2ff"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Pulsing wireframe core */}
      <mesh scale={1.3}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial color="#00f5d4" wireframe transparent opacity={0.25} />
      </mesh>

      <Html distanceFactor={10} center position={[0, -1.9, 0]}>
        <div className="px-3 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 text-xs font-bold shadow-xl shadow-cyan-500/20 whitespace-nowrap">
          👑 {userName}
        </div>
      </Html>
    </group>
  );
}

export default function TeamMatch3DGraph({ 
  matches = [], 
  userProfile, 
  selectedCandidate, 
  onSelectCandidate 
}) {
  const centerPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // Compute satellite orbit positions around the center
  const nodesWithPositions = useMemo(() => {
    const radius = 5.2;
    return matches.map((match, idx) => {
      const angle = (idx / matches.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.75); // Slight ellipse for nice vertical fit
      const z = (idx % 2 === 0 ? 0.8 : -0.8);
      return {
        candidate: match,
        position: new THREE.Vector3(x, y, z)
      };
    });
  }, [matches]);

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden glass-panel border border-indigo-500/20 shadow-2xl">
      {/* 3D Scene Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
          Cosine Similarity Constellation
        </span>
        <p className="text-[10px] text-slate-400 mt-1">Drag to rotate • Click node to focus candidate</p>
      </div>

      <Canvas
        camera={{ position: [0, 0, 10.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
        <pointLight position={[-10, -10, -5]} intensity={1.2} color="#00f5d4" />

        {/* Background Ambient Stars */}
        <Sparkles count={70} scale={14} size={2} speed={0.4} color="#6366f1" opacity={0.5} />

        {/* Center Node (Current User) */}
        <UserCenterNode userProfile={userProfile} />

        {/* Connecting Lines & Match Satellite Nodes */}
        {nodesWithPositions.map((item, idx) => {
          const isSelected = selectedCandidate?.uid === item.candidate.uid;
          return (
            <group key={item.candidate.uid}>
              <AnimatedConnectionLine
                start={centerPos}
                end={item.position}
                score={item.candidate.match?.percentage || 85}
                isHovered={isSelected}
              />
              <MatchNode
                candidate={item.candidate}
                position={item.position}
                index={idx}
                isSelected={isSelected}
                onSelect={onSelectCandidate}
              />
            </group>
          );
        })}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          rotateSpeed={0.6} 
          maxPolarAngle={Math.PI / 1.7} 
          minPolarAngle={Math.PI / 2.3} 
        />
      </Canvas>
    </div>
  );
}
