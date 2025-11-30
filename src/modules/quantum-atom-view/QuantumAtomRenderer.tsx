import { useFrame } from '@react-three/fiber';
import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, Mesh, Matrix4, PointsMaterial, Quaternion, Vector3 } from 'three';
import { Atom } from '@core/models/atom';
import { useSettingsStore } from '@state/settings.store';
import { IOrbital, IOrbitalSet, POrbitalOrientation } from './models/orbitals';
import { useOrbitals } from './hooks/useOrbitals';
import type { OrbitalNoiseMaterialType } from './materials/OrbitalNoiseMaterial';
import './materials/OrbitalNoiseMaterial';
import { Nucleus } from '@modules/atom-view/Nucleus';

interface QuantumAtomRendererProps {
  atom: Atom;
}

const randomGaussian = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const axisFromOrientation = (orientation: POrbitalOrientation) => {
  switch (orientation) {
    case 'px':
      return new Vector3(1, 0, 0);
    case 'py':
      return new Vector3(0, 1, 0);
    case 'pz':
    default:
      return new Vector3(0, 0, 1);
  }
};

const createParticleGeometry = (
  count: number,
  radius: number,
  orientation?: POrbitalOrientation,
  densityScale = 1
) => {
  const particleCount = Math.round(count * densityScale);
  const positions = new Float32Array(particleCount * 3);
  const axis = orientation ? axisFromOrientation(orientation) : new Vector3(0, 1, 0);

  for (let i = 0; i < particleCount; i += 1) {
    const sign = Math.random() > 0.5 ? 1 : -1;
    const axial = (0.4 + Math.random() * 0.8) * radius * sign;
    const perpendicular = new Vector3(
      randomGaussian() * radius * 0.18,
      randomGaussian() * radius * 0.18,
      randomGaussian() * radius * 0.18
    );
    const position = axis
      .clone()
      .multiplyScalar(axial)
      .add(perpendicular);

    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
};

const OrbitalVolume = ({
  orbital,
  onMaterialReady
}: {
  orbital: IOrbital;
  onMaterialReady: (material: OrbitalNoiseMaterialType) => void;
}) => {
  const materialRef = useRef<OrbitalNoiseMaterialType>(null);
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      const scale = orbital.type === 's' ? orbital.radius : orbital.radius * 0.6;
      meshRef.current.scale.setScalar(scale);
    }
  }, [orbital.radius, orbital.type]);

  useEffect(() => {
    if (materialRef.current) {
      const baseOpacity = orbital.isValence ? 0.45 : 0.32;
      materialRef.current.uniforms.opacity.value = baseOpacity;
      materialRef.current.userData.baseOpacity = baseOpacity;
      onMaterialReady(materialRef.current);
    }
  }, [onMaterialReady, orbital.isValence]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.9, 48, 48]} />
      <orbitalNoiseMaterial
        ref={materialRef}
        transparent
        opacity={orbital.isValence ? 0.45 : 0.3}
        color={new Color(orbital.color as string)}
      />
    </mesh>
  );
};

const POrbitalParticles = ({
  orbital,
  onMaterialReady
}: {
  orbital: IOrbital;
  onMaterialReady: (material: PointsMaterial) => void;
}) => {
  const particleMaterial = useRef<PointsMaterial>(null);
  const densityScale = orbital.isValence ? 1.35 : 1;
  const geometry = useMemo(
    () => createParticleGeometry(650, orbital.radius * 0.92, orbital.orientation as POrbitalOrientation, densityScale),
    [densityScale, orbital.orientation, orbital.radius]
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    if (particleMaterial.current) {
      particleMaterial.current.userData.phase = orbital.phaseOffset;
      particleMaterial.current.userData.baseOpacity = orbital.isValence ? 0.23 : 0.18;
      particleMaterial.current.userData.opacityRange = orbital.isValence ? 0.12 : 0.08;
      particleMaterial.current.size = orbital.isValence ? 0.058 : 0.05;
      onMaterialReady(particleMaterial.current);
    }
  }, [onMaterialReady, orbital.isValence, orbital.phaseOffset]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        ref={particleMaterial}
        color={orbital.color}
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </points>
  );
};

const POrbitalLobes = ({
  orbital,
  registerNoiseMaterial
}: {
  orbital: IOrbital;
  registerNoiseMaterial: (material: OrbitalNoiseMaterialType) => void;
}) => {
  const axis = axisFromOrientation(orbital.orientation as POrbitalOrientation);
  const forward = axis.clone().multiplyScalar(orbital.radius * 0.7);
  const backward = axis.clone().multiplyScalar(-orbital.radius * 0.7);

  return (
    <group>
      <group position={forward.toArray()}>
        <OrbitalVolume orbital={orbital} onMaterialReady={registerNoiseMaterial} />
      </group>
      <group position={backward.toArray()}>
        <OrbitalVolume orbital={orbital} onMaterialReady={registerNoiseMaterial} />
      </group>
    </group>
  );
};

const DOrbitalPlaceholder = ({ orbital }: { orbital: IOrbital }) => (
  <group>
    <mesh>
      <torusKnotGeometry args={[orbital.radius * 0.5, orbital.radius * 0.1, 90, 12]} />
      <meshStandardMaterial
        color={orbital.color}
        transparent
        opacity={orbital.isValence ? 0.32 : 0.25}
        emissive={orbital.color as string}
        emissiveIntensity={orbital.isValence ? 0.45 : 0.25}
      />
    </mesh>
  </group>
);

const OrbitalRenderer = ({
  orbital,
  registerNoiseMaterial,
  registerParticleMaterial
}: {
  orbital: IOrbital;
  registerNoiseMaterial: (material: OrbitalNoiseMaterialType) => void;
  registerParticleMaterial: (material: PointsMaterial) => void;
}) => {
  if (orbital.type === 's') {
    return <OrbitalVolume orbital={orbital} onMaterialReady={registerNoiseMaterial} />;
  }

  if (orbital.type === 'p') {
    return (
      <group>
        <POrbitalLobes orbital={orbital} registerNoiseMaterial={registerNoiseMaterial} />
        <POrbitalParticles orbital={orbital} onMaterialReady={registerParticleMaterial} />
      </group>
    );
  }

  return <DOrbitalPlaceholder orbital={orbital} />;
};

export const QuantumAtomRenderer = ({ atom }: QuantumAtomRendererProps) => {
  const { settings } = useSettingsStore();
  const orbitalSets = useOrbitals(atom);
  const noiseMaterials = useRef<OrbitalNoiseMaterialType[]>([]);
  const particleMaterials = useRef<PointsMaterial[]>([]);

  const registerNoiseMaterial = useCallback((material: OrbitalNoiseMaterialType) => {
    if (!noiseMaterials.current.includes(material)) {
      material.userData.phase = material.userData.phase ?? Math.random() * Math.PI * 2;
      noiseMaterials.current.push(material);
    }
  }, []);

  const registerParticleMaterial = useCallback((material: PointsMaterial) => {
    if (!particleMaterials.current.includes(material)) {
      particleMaterials.current.push(material);
    }
  }, []);

  useFrame(({ clock }) => {
    const motionScale = settings.reducedMotion ? 0.5 : 1;
    const intensityScale = settings.quantumAnimationIntensity;
    const t = clock.getElapsedTime() * settings.animationSpeed * intensityScale * motionScale;

    noiseMaterials.current.forEach((mat, index) => {
      const baseOpacity = (mat.userData.baseOpacity as number | undefined) ?? mat.uniforms.opacity.value;
      const opacityScale = 0.7 + intensityScale * 0.5;
      mat.uniforms.time.value = t + index * 0.12 + (mat.userData.phase ?? 0);
      mat.uniforms.opacity.value = Math.min(1, baseOpacity * opacityScale * (motionScale * 0.75 + 0.35));
    });

    particleMaterials.current.forEach((mat, index) => {
      const phase = (mat.userData.phase as number | undefined) ?? 0;
      const baseOpacity = (mat.userData.baseOpacity as number | undefined) ?? 0.18;
      const opacityRange = (mat.userData.opacityRange as number | undefined) ?? 0.08;
      const pulseScale = 0.55 + intensityScale * 0.6;
      const damping = motionScale * 0.8 + 0.25;
      mat.opacity = Math.min(
        1,
        baseOpacity * pulseScale + opacityRange * damping * Math.sin(t * 0.9 + phase + index * 0.35)
      );
      mat.needsUpdate = true;
    });
  });

  const orbitalGroups = useMemo(() => {
    return orbitalSets.map((set) => {
      const orientation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), set.isValence ? 0.06 : 0);
      const matrix = new Matrix4().makeRotationFromQuaternion(orientation);
      return { ...set, rotationMatrix: matrix } as IOrbitalSet & { rotationMatrix: Matrix4 };
    });
  }, [orbitalSets]);

  return (
    <group>
      <Nucleus protons={atom.atomicNumber} neutrons={atom.neutrons} visualizationMode={settings.visualizationMode} />
      {orbitalGroups.map((set) => (
        <group key={`shell-${set.shell}`}>
          <group matrix={set.rotationMatrix} matrixAutoUpdate={false}>
            {set.orbitals.map((orbital) => (
              <Fragment key={orbital.id}>
                <group
                  onUpdate={(group) => {
                    group.userData.phase = orbital.phaseOffset;
                  }}
                >
                  <OrbitalRenderer
                    orbital={orbital}
                    registerNoiseMaterial={registerNoiseMaterial}
                    registerParticleMaterial={registerParticleMaterial}
                  />
                </group>
              </Fragment>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
};
