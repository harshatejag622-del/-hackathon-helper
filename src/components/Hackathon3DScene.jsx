import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useChat } from '../context/ChatContext';

// Individual Floating Team Shape
function TeamNode({ 
  position, 
  geometryType, 
  color, 
  teamName, 
  skills, 
  matchScore, 
  rotationSpeed = 0.01,
  pulseTick = 0
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const pulseEnergy = useRef(0);

  useEffect(() => {
    if (pulseTick > 0) {
      pulseEnergy.current = 1.0;
    }
  }, [pulseTick]);

  useFrame((state, delta) => {
    pulseEnergy.current = THREE.MathUtils.lerp(pulseEnergy.current, 0, delta * 3.0);

    if (meshRef.current) {
      const extraSpeed = hovered ? 2.5 : 1 + pulseEnergy.current * 2;
      meshRef.current.rotation.x += rotationSpeed * extraSpeed;
      meshRef.current.rotation.y += rotationSpeed * 1.5 * extraSpeed;
      
      const targetScale = (hovered ? 1.25 : 1) * (1 + pulseEnergy.current * 0.3);
      meshRef.current.scale.setScalar(targetScale);
    }
  });

  const renderGeometry = () => {
    switch (geometryType) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1.2, 0]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1.3, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1.1, 0]} />;
      case 'torus':
        return <torusGeometry args={[0.9, 0.35, 16, 32]} />;
      case 'box':
        return <boxGeometry args={[1.4, 1.4, 1.4]} />;
      case 'tetrahedron':
      default:
        return <tetrahedronGeometry args={[1.4, 0]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={2} floatingRange={[-0.3, 0.3]}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.25 : 1}
        >
          {renderGeometry()}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.25}
            roughness={0.2}
            metalness={0.8}
            wireframe={hovered}
          />
        </mesh>

        {/* Glow halo around node */}
        <mesh scale={hovered ? 1.6 : 1.35}>
          {renderGeometry()}
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered ? 0.2 : 0.06}
            wireframe
          />
        </mesh>

        {/* 3D HTML Tooltip Badge on Hover */}
        {hovered && (
          <Html distanceFactor={14} center position={[0, 1.8, 0]}>
            <div className="glass-panel-glow px-3 py-2 rounded-xl text-left pointer-events-none shadow-2xl border border-white/20 min-w-[160px] animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white whitespace-nowrap">{teamName}</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {matchScore}% Match
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {skills.map((s, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

// Interconnected Network Data Flow Lines
function NetworkConnections() {
  const lineGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(-6, 3, -2),
      new THREE.Vector3(-2, 1, 2),
      new THREE.Vector3(4, 3, -1),
      new THREE.Vector3(6, -2, 1),
      new THREE.Vector3(0, -3, -2),
      new THREE.Vector3(-5, -2, 0),
      new THREE.Vector3(-6, 3, -2),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.25} />
    </line>
  );
}

// Hall Grid Floor
function HallFloor() {
  const gridRef = useRef();

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.getElapsedTime() * 0.2) % 2;
    }
  });

  return (
    <group position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper ref={gridRef} args={[40, 40, '#4f46e5', '#1e1b4b']} position={[0, 0, 0]} />
    </group>
  );
}

// Shockwave point light reacting to chat messages
function ChatReactiveShockwave({ pulseTick }) {
  const lightRef = useRef();
  const pulseRef = useRef(0);

  useEffect(() => {
    if (pulseTick > 0) {
      pulseRef.current = 1.0;
    }
  }, [pulseTick]);

  useFrame((state, delta) => {
    pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 0, delta * 2.5);
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + pulseRef.current * 7.5;
    }
  });

  return (
    <pointLight 
      ref={lightRef} 
      position={[0, 0, 7]} 
      color="#00f5d4" 
      intensity={1.2} 
      distance={30} 
    />
  );
}

export default function Hackathon3DScene() {
  const { pulseTick = 0 } = useChat() || {};

  const teams = [
    {
      id: 1,
      position: [-5.5, 2.5, -1],
      geometryType: 'icosahedron',
      color: '#00d2ff',
      teamName: 'Team Nova (AI/ML)',
      skills: ['Python', 'PyTorch', 'Gemini', 'NLP'],
      matchScore: 98,
      rotationSpeed: 0.012
    },
    {
      id: 2,
      position: [5.2, 2.2, -2],
      geometryType: 'octahedron',
      color: '#f72585',
      teamName: 'CyberVanguard',
      skills: ['Rust', 'Solidity', 'Go', 'Security'],
      matchScore: 94,
      rotationSpeed: 0.015
    },
    {
      id: 3,
      position: [-4.2, -2.2, 1],
      geometryType: 'torus',
      color: '#a855f7',
      teamName: 'FullStack Forge',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'],
      matchScore: 96,
      rotationSpeed: 0.009
    },
    {
      id: 4,
      position: [4.5, -2.5, 0],
      geometryType: 'dodecahedron',
      color: '#00f5d4',
      teamName: 'BioHealth Tech',
      skills: ['FastAPI', 'Three.js', 'BioInformatics'],
      matchScore: 91,
      rotationSpeed: 0.011
    },
    {
      id: 5,
      position: [0, 3.2, -3],
      geometryType: 'box',
      color: '#6366f1',
      teamName: 'Cloud Architects',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
      matchScore: 95,
      rotationSpeed: 0.008
    },
    {
      id: 6,
      position: [0, -3.5, -1],
      geometryType: 'tetrahedron',
      color: '#ffb703',
      teamName: 'Vision XR Hub',
      skills: ['Unity', 'WebXR', 'Compute Shader'],
      matchScore: 89,
      rotationSpeed: 0.014
    }
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto select-none">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
        <pointLight position={[-10, -10, -5]} intensity={1.2} color="#00f5d4" />
        <pointLight position={[0, 0, 5]} intensity={0.9} color="#f472b6" />

        {/* Dynamic Chat Shockwave Lighting */}
        <ChatReactiveShockwave pulseTick={pulseTick} />

        <HallFloor />
        <NetworkConnections />

        {teams.map((team) => (
          <TeamNode key={team.id} {...team} pulseTick={pulseTick} />
        ))}

        {/* Ambient sparkling participants / idea sparks */}
        <Sparkles 
          count={100} 
          scale={16} 
          size={2.5} 
          speed={0.4} 
          opacity={0.6} 
          color="#a5b4fc" 
        />

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 1.7} 
          minPolarAngle={Math.PI / 2.5}
          rotateSpeed={0.5} 
          autoRotate 
          autoRotateSpeed={0.4} 
        />
      </Canvas>
    </div>
  );
}
