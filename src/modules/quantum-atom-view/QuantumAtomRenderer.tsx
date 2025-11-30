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

const createParticleGeometry = (count: number, radius: number, orientation?: POrbitalOrientation) => {
  const positions = new Float32Array(count * 3);
  const axis = orientation ? axisFromOrientation(orientation) : new Vector3(0, 1, 0);

  for (let i = 0; i < count; i += 1) {
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
      onMaterialReady(materialRef.current);
    }
  }, [onMaterialReady]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.9, 48, 48]} />
      <orbitalNoiseMaterial
        ref={materialRef}
        transparent
        opacity={0.3}
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
  const geometry = useMemo(() => createParticleGeometry(650, orbital.radius * 0.92, orbital.orientation as POrbitalOrientation), [orbital.orientation, orbital.radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    if (particleMaterial.current) {
      particleMaterial.current.userData.phase = orbital.phaseOffset;
      onMaterialReady(particleMaterial.current);
    }
  }, [onMaterialReady, orbital.phaseOffset]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        ref={particleMaterial}
        color={orbital.color}
        size={0.05}
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
        opacity={0.25}
        emissive={orbital.color as string}
        emissiveIntensity={0.25}
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
    const t = clock.getElapsedTime() * settings.animationSpeed;
    noiseMaterials.current.forEach((mat, index) => {
      mat.uniforms.time.value = t + index * 0.12 + (mat.userData.phase ?? 0);
    });
    particleMaterials.current.forEach((mat, index) => {
      const phase = (mat.userData.phase as number | undefined) ?? 0;
      mat.opacity = 0.18 + 0.08 * Math.sin(t * 0.9 + phase + index * 0.35);
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
