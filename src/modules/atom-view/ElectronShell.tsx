import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { Shell } from '@core/models/atom';
import { useSettingsStore } from '@state/settings.store';

interface ElectronShellProps {
  shell: Shell;
}

export const ElectronShell = ({ shell }: ElectronShellProps) => {
  const { settings } = useSettingsStore();
  const groupRef = useRef<Group>(null);
  const speed = 0.6 * settings.animationSpeed * (shell.isValence ? 1.4 : 1);

  const points = useMemo(() => new Array(64).fill(0).map((_, i) => {
    const angle = (i / 64) * Math.PI * 2;
    return new Vector3(Math.cos(angle) * shell.radius, Math.sin(angle) * shell.radius, 0);
  }), [shell.radius]);

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
      child.position.set(
        Math.cos(angle) * shell.radius,
        Math.sin(angle) * shell.radius,
        Math.sin(angle * 0.7) * 0.15
      );
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
