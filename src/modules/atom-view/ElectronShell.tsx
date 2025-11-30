import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Euler, Group, Matrix4, Vector3 } from 'three';
import { Shell } from '@core/models/atom';
import { useSettingsStore } from '@state/settings.store';

interface ElectronShellProps {
  shell: Shell;
}

export const ElectronShell = ({ shell }: ElectronShellProps) => {
  const { settings } = useSettingsStore();
  const groupRef = useRef<Group>(null);
  const speed = 0.6 * settings.animationSpeed * (shell.isValence ? 1.4 : 1);

  const orbit = useMemo(() => {
    const tilt = new Euler((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4);
    const eccentricity = settings.atomMode === 'realistic' ? 0.35 : 0.05;
    const wobble = settings.atomMode === 'realistic' ? 0.18 : 0.06;
    const xRadius = shell.radius * (1 + eccentricity * 0.4);
    const zRadius = shell.radius * (1 - eccentricity * 0.3);

    return { tilt, wobble, xRadius, zRadius };
  }, [settings.atomMode, shell.radius]);

  const points = useMemo(() => {
    const matrix = new Matrix4().makeRotationFromEuler(orbit.tilt);
    return new Array(96).fill(0).map((_, i) => {
      const angle = (i / 96) * Math.PI * 2;
      const position = new Vector3(
        Math.cos(angle) * orbit.xRadius,
        Math.sin(angle * 0.9) * orbit.wobble,
        Math.sin(angle) * orbit.zRadius
      );
      return position.applyMatrix4(matrix);
    });
  }, [orbit.tilt, orbit.wobble, orbit.xRadius, orbit.zRadius]);

  const electronPositions = useMemo(() => {
    return shell.electrons.map((electron, index) => ({
      id: electron.id,
      offset: (index / shell.electrons.length) * Math.PI * 2
    }));
  }, [shell.electrons]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * speed;
    groupRef.current?.children.forEach((child, idx) => {
      const electron = electronPositions[idx];
      const angle = elapsed + electron.offset;
      const position = new Vector3(
        Math.cos(angle) * orbit.xRadius,
        Math.sin(angle * 0.9) * orbit.wobble,
        Math.sin(angle) * orbit.zRadius
      ).applyEuler(orbit.tilt);
      child.position.copy(position);
    });
  });

  return (
    <group>
      <Line points={points} color={shell.isValence ? '#FF6584' : '#64748b'} linewidth={1} dashed dashSize={0.2} gapSize={0.1} />
      <group ref={groupRef}>
        {electronPositions.map((electron) => (
          <mesh key={electron.id}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={shell.isValence ? '#FF6584' : '#22d3ee'}
              emissive={shell.isValence ? '#ff2d55' : '#22d3ee'}
              emissiveIntensity={0.7}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
