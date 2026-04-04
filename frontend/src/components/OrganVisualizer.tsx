import React, { useState, useRef, useEffect, Suspense, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Loader2, Eye, Bone, Heart, Waves, Brain, MonitorX, RotateCcw, Sparkles
} from "lucide-react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";

const anatomySystems = [
  { id: "skeleton", name: "Skeletal", file: "/skeleton.glb", icon: Bone, color: "#ffeccd", description: "Bones & Joints" },
  { id: "vascular_system", name: "Vascular", file: "/vascular_system.glb", icon: Heart, color: "#8c9eb5", description: "Heart & Blood Vessels" },
  { id: "visceral_system", name: "Visceral", file: "/visceral_system.glb", icon: Waves, color: "#d4a89c", description: "Internal Organs" },
  { id: "nervous_system", name: "Nervous", file: "/nervous_system.glb", icon: Brain, color: "#ffd966", description: "Brain & Nerves" },
];

const organMeshKeywords: Record<string, string[]> = {
  "Lungs": ["lung", "bronch", "pulmon", "thorax", "alveol"],
  "Liver": ["liver", "hepat", "hepatic"],
  "Kidneys": ["kidney", "renal", "nephro"],
  "Heart": ["heart", "cardiac", "ventricle", "atrium", "myocard"],
  "Brain": ["brain", "cerebr", "cortex"],
  "Nerves": ["nerve", "spinal", "neural"],
  "Stomach": ["intestin", "colon", "stomach", "gastri", "bowel", "digest"],
  "Bone": ["bone", "femur", "tibia", "spine", "vertebra", "skeletal"],
  "Eye": ["eye", "ocular", "orbit", "optic"],
  "Blood": ["blood", "vascular", "vein", "artery", "spleen"],
};

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

interface ModelComponentProps {
  modelPath: string;
  controlsRef: React.RefObject<any>;
  systemColor: string;
  showTargeting: boolean;
  targetOrganNames: string[];
  riskOrganNames: string[];
}

function Model({ modelPath, controlsRef, systemColor, showTargeting, targetOrganNames, riskOrganNames }: ModelComponentProps) {
  const gltf = useGLTF(modelPath);
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene, modelPath]);

  const targetKeywords = useMemo(() =>
    targetOrganNames.flatMap(name => (organMeshKeywords[name] || [name.toLowerCase()])),
    [targetOrganNames]
  );
  const riskKeywords = useMemo(() =>
    riskOrganNames.flatMap(name => (organMeshKeywords[name] || [name.toLowerCase()])),
    [riskOrganNames]
  );

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    clonedScene.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
    cameraZ *= 1.5;

    camera.position.set(0, 0, cameraZ);
    (camera as THREE.PerspectiveCamera).near = cameraZ / 100;
    (camera as THREE.PerspectiveCamera).far = cameraZ * 100;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.userData = { ...controlsRef.current.userData, initialCameraZ: cameraZ };
      controlsRef.current.update();
    }

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        const meshName = (child.name || "").toLowerCase();
        const isTarget = showTargeting && targetKeywords.some(k => meshName.includes(k));
        const isRisk = showTargeting && riskKeywords.some(k => meshName.includes(k));

        if (isTarget) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#22c55e"), emissive: new THREE.Color("#22c55e"),
            emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.1,
          });
        } else if (isRisk) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#ef4444"), emissive: new THREE.Color("#ef4444"),
            emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.1,
          });
        } else {
          child.material = new THREE.MeshStandardMaterial({ color: systemColor, roughness: 1, metalness: 0 });
        }
      }
    });

    if (groupRef.current) {
      while (groupRef.current.children.length) groupRef.current.remove(groupRef.current.children[0]);
      groupRef.current.add(clonedScene);
    }
  }, [clonedScene, camera, controlsRef, systemColor, showTargeting, targetKeywords, riskKeywords]);

  return <group ref={groupRef} />;
}

function LoadingFallback() {
  return (<Html center><div className="flex flex-col items-center gap-3 text-white/70"><Loader2 className="h-8 w-8 animate-spin" /><p className="text-sm font-semibold">Loading Model…</p></div></Html>);
}

function ModelErrorFallback({ systemName }: { systemName: string }) {
  return (<Html center><div className="flex flex-col items-center gap-3 text-center px-6 max-w-xs"><div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Eye className="h-8 w-8 text-white/30" /></div><p className="text-sm font-bold text-white/60">Model Not Found</p></div></Html>);
}

class ErrorBoundaryWrapper extends React.Component<{ children: React.ReactNode; onError: () => void }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { if (this.state.hasError) return null; return this.props.children; }
}

function ModelWithFallback({ modelPath, controlsRef, systemColor, systemId, showTargeting, targetOrganNames, riskOrganNames }: { modelPath: string; controlsRef: React.RefObject<any>; systemColor: string; systemId: string; showTargeting: boolean; targetOrganNames: string[]; riskOrganNames: string[] }) {
  const [hasError, setHasError] = useState(false);
  useEffect(() => { setHasError(false); useGLTF.preload(modelPath); }, [modelPath]);
  
  if (hasError) return <ModelErrorFallback systemName={systemId} />;
  return (<ErrorBoundaryWrapper onError={() => setHasError(true)}><Model modelPath={modelPath} controlsRef={controlsRef} systemColor={systemColor} showTargeting={showTargeting} targetOrganNames={targetOrganNames} riskOrganNames={riskOrganNames} /></ErrorBoundaryWrapper>);
}


interface OrganVisualizerProps {
  targetOrganNames: string[];
  riskOrganNames: string[];
  activeSystemOverride?: string; // AI-recommended system id
}

export function OrganVisualizer({ targetOrganNames = [], riskOrganNames = [], activeSystemOverride }: OrganVisualizerProps) {
  const [activeSystem, setActiveSystem] = useState("visceral_system");
  const [showTargeting, setShowTargeting] = useState(true);
  const [webGLSupported] = useState(() => detectWebGL());
  const controlsRef = useRef<any>(null);

  // When AI returns a recommended system, auto-switch to it
  useEffect(() => {
    if (activeSystemOverride && anatomySystems.some(s => s.id === activeSystemOverride)) {
      setActiveSystem(activeSystemOverride);
    }
  }, [activeSystemOverride]);

  const currentSystem = anatomySystems.find(s => s.id === activeSystem) || anatomySystems[0];

  const handleRecenter = useCallback(() => {
    if (controlsRef.current) { 
      controlsRef.current.target.set(0, 0, 0); 
      if (controlsRef.current.userData?.initialCameraZ) {
        controlsRef.current.object.position.set(0, 0, controlsRef.current.userData.initialCameraZ);
      }
      controlsRef.current.update(); 
    }
  }, []);

  return (
    <div className="relative w-full h-[500px] flex flex-col bg-[#0a0a0f] rounded-2xl border border-border shadow-xl overflow-hidden mt-6">
      {/* System Selector */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 backdrop-blur-xl">
          {anatomySystems.map((sys) => {
            const Icon = sys.icon;
            const isActive = activeSystem === sys.id;
            return (
              <button key={sys.id} onClick={() => setActiveSystem(sys.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300", isActive ? "bg-white text-black shadow-lg shadow-white/10" : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]")}>
                <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{sys.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowTargeting(!showTargeting)}
          title={showTargeting ? "Disable Targeting Colors" : "Enable Targeting Colors"}
          className={cn("flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 border shrink-0", showTargeting ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/80")}
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      {showTargeting && (
        <div className="absolute top-20 left-4 z-30 flex flex-col gap-2 bg-white/[0.04] border border-white/[0.08] p-3 rounded-xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Target Effect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Side Effect</span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        {webGLSupported ? (
          <>
            <Canvas camera={{ fov: 40 }} gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}>
              <color attach="background" args={["#000000"]} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              <directionalLight position={[-5, -5, -5]} intensity={0.4} />
              <Suspense fallback={<LoadingFallback />}>
                <ModelWithFallback modelPath={currentSystem.file} controlsRef={controlsRef} systemColor={currentSystem.color} systemId={currentSystem.id} showTargeting={showTargeting} targetOrganNames={targetOrganNames} riskOrganNames={riskOrganNames} />
              </Suspense>
              <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.05} minDistance={1} maxDistance={50} />
              <GizmoHelper alignment="bottom-right" margin={[40, 40]}>
                <GizmoViewport axisColors={['#ff3653', '#0adb71', '#2c8fec']} labelColor="white" hideNegativeAxes />
              </GizmoHelper>
            </Canvas>

            <button onClick={handleRecenter} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/[0.06] border border-white/[0.1] rounded-full py-2.5 px-5 backdrop-blur-xl z-20 flex items-center gap-2 hover:bg-white/10 transition-colors group">
              <RotateCcw className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">Reset View</span>
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-5 text-center px-8 max-w-md">
              <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><MonitorX className="h-10 w-10 text-red-400" /></div>
              <h3 className="text-xl font-black text-white">WebGL Not Available</h3>
              <p className="text-sm text-white/50 leading-relaxed">Enable hardware acceleration in browser settings, update GPU drivers, or try Chrome/Edge.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
