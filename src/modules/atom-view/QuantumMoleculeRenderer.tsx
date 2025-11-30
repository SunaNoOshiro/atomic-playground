import { useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import { QuadraticBezierLine } from '@react-three/drei';
import { AdditiveBlending, Color, Float32BufferAttribute, Quaternion, Vector3 } from 'three';
import { Molecule, MoleculeBond } from '@core/models/atom';
import { VisualizationMode } from '@core/models/settings';
import { useSettingsStore } from '@state/settings.store';

interface QuantumMoleculeRendererProps {
  molecule: Molecule;
  visualizationMode: VisualizationMode;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createElectronDensityGeometry = (bias: number) => {
  const samples = 36;
  const positions = new Float32Array(samples * 3);
  const colors = new Float32Array(samples * 3);
  const coolColor = new Color('#8ec5ff');
  const warmColor = new Color('#ffb997');

  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1);
    const offset = (t - 0.5) * 0.5;
    const drift = bias * 0.25 * (t - 0.5);
    positions[i * 3] = offset + drift;
    positions[i * 3 + 1] = (Math.sin(t * Math.PI * 2) * 0.1 + bias * 0.08) * 0.7;
    positions[i * 3 + 2] = Math.cos(t * Math.PI * 2) * 0.08;

    const mixAmount = clamp(t + bias * 0.35, 0, 1);
    const color = coolColor.clone().lerp(warmColor, mixAmount);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new Float32BufferAttribute(positions, 3);
  geometry.name = 'electron-density-positions';
  const colorAttribute = new Float32BufferAttribute(colors, 3);
  colorAttribute.name = 'electron-density-colors';
  return { positions: geometry, colors: colorAttribute };
};

const BondVisualization = ({
  bond,
  direction,
  visualizationMode
}: {
  bond: MoleculeBond;
  direction: Vector3;
  visualizationMode: VisualizationMode;
}) => {
  const { settings } = useSettingsStore();
  const { approach, overlapPulse } = useSpring({
    from: { approach: 0, overlapPulse: 0.65 },
    to: { approach: 1, overlapPulse: 1 },
    loop: { reverse: true },
    config: { duration: 2600 / settings.animationSpeed }
  });

  const normalizedDirection = useMemo(() => direction.clone().normalize(), [direction]);
  const orientation = useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), normalizedDirection),
    [normalizedDirection]
  );

  const anchor = useMemo(() => normalizedDirection.clone().multiplyScalar(0.55), [normalizedDirection]);
  const startDistance = useMemo(() => clamp(3.1 - bond.strength * 1.2, 1.4, 3.1), [bond.strength]);
  const endDistance = useMemo(() => clamp(1.15 - bond.strength * 0.35, 0.75, 1.4), [bond.strength]);

  const electronBias = useMemo(() => {
    const total = bond.from.atomicNumber + bond.to.atomicNumber;
    if (total === 0) return 0;
    return (bond.to.atomicNumber - bond.from.atomicNumber) / total;
  }, [bond.from.atomicNumber, bond.to.atomicNumber]);

  const densityAttributes = useMemo(() => createElectronDensityGeometry(electronBias), [electronBias]);

  const bondColor = visualizationMode === VisualizationMode.QUANTUM ? '#9bd5ff' : '#b6a8ff';
  const overlapColor = visualizationMode === VisualizationMode.QUANTUM ? '#66e2e8' : '#f2c94c';

  return (
    <group quaternion={orientation} position={anchor.toArray()}>
      <a.group
        position={approach.to((t) => {
          const start = -startDistance / 2;
          const end = -endDistance / 2;
          return [start + (end - start) * t, 0, 0];
        })}
      >
        <mesh>
          <sphereGeometry args={[0.42, 48, 48]} />
          <meshStandardMaterial
            color={bondColor}
            transparent
            opacity={0.32}
            emissive={bondColor}
            emissiveIntensity={0.45}
          />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial color={bondColor} transparent opacity={0.18} />
        </mesh>
      </a.group>

      <a.group
        position={approach.to((t) => {
          const start = startDistance / 2;
          const end = endDistance / 2;
          return [start + (end - start) * t, 0, 0];
        })}
      >
        <mesh>
          <sphereGeometry args={[0.42, 48, 48]} />
          <meshStandardMaterial
            color={overlapColor}
            transparent
            opacity={0.32}
            emissive={overlapColor}
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial color={overlapColor} transparent opacity={0.18} />
        </mesh>
      </a.group>

      <a.mesh
        position={approach.to((t) => [0, 0, 0.08 + 0.05 * Math.sin(t * Math.PI)])}
        scale={overlapPulse.to((pulse) => 0.72 + pulse * 0.35)}
      >
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial
          color={overlapColor}
          transparent
          opacity={0.35}
          emissive={overlapColor}
          emissiveIntensity={0.8}
        />
      </a.mesh>

      <a.points
        scale={approach.to((t) => {
          const distance = startDistance + (endDistance - startDistance) * t;
          return [distance, 1.05, 1.05];
        })}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" {...densityAttributes.positions} />
          <bufferAttribute attach="attributes-color" {...densityAttributes.colors} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.06}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={AdditiveBlending}
          sizeAttenuation
        />
      </a.points>

      <a.group scale={approach.to((t) => 0.9 + t * 0.25)}>
        <QuadraticBezierLine
          start={[-endDistance / 2, 0.05, 0]}
          end={[endDistance / 2, 0.05, 0]}
          mid={[0, 0.2, 0]}
          color={bondColor}
          lineWidth={1.1}
          transparent
          opacity={0.85}
        />
      </a.group>
    </group>
  );
};

export const QuantumMoleculeRenderer = ({ molecule, visualizationMode }: QuantumMoleculeRendererProps) => {
  const bonds = molecule.bonds;

  const directions = useMemo(() => {
    if (!bonds.length) return [] as Vector3[];

    return bonds.map((_, index) => {
      const angle = (index / bonds.length) * Math.PI * 2;
      return new Vector3(Math.cos(angle), Math.sin(angle) * 0.6, Math.sin(angle * 1.4) * 0.4);
    });
  }, [bonds]);

  if (!bonds.length) return null;

  return (
    <group>
      {bonds.map((bond, index) => (
        <BondVisualization
          key={bond.id}
          bond={bond}
          direction={directions[index] ?? new Vector3(1, 0, 0)}
          visualizationMode={visualizationMode}
        />
      ))}
    </group>
  );
};
