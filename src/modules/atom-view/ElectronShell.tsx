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
  const isRealistic = settings.atomMode === 'realistic';

  const electronTracks = useMemo(() => {
    return shell.electrons.map((electron, index) => {
      const tilt = new Euler(
        (Math.random() - 0.5) * (isRealistic ? 0.9 : 0.45),
        (Math.random() - 0.5) * (isRealistic ? 0.9 : 0.45),
        (Math.random() - 0.5) * (isRealistic ? 0.6 : 0.25)
      );

      const eccentricity = isRealistic ? 0.35 : 0.02;
      const wobble = isRealistic ? 0.18 : 0.02;
      const xRadius = shell.radius * (1 + eccentricity * 0.4);
      const zRadius = shell.radius * (1 - eccentricity * 0.3);
      const baseOffset = (index / shell.electrons.length) * Math.PI * 2;

      return { id: electron.id, tilt, wobble, xRadius, zRadius, offset: baseOffset };
    });
  }, [isRealistic, shell.electrons, shell.radius]);

  const baseOrbit = useMemo(() => {
    const baseTilt = new Euler((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, 0);
    const matrix = new Matrix4().makeRotationFromEuler(baseTilt);
    return new Array(96).fill(0).map((_, i) => {
      const angle = (i / 96) * Math.PI * 2;
      const position = new Vector3(Math.cos(angle) * shell.radius, 0, Math.sin(angle) * shell.radius);
      return position.applyMatrix4(matrix);
    });
  }, [shell.radius]);

  const trackLines = useMemo(() => {
    return electronTracks.map((track) => {
      const matrix = new Matrix4().makeRotationFromEuler(track.tilt);
      const points = new Array(96).fill(0).map((_, i) => {
        const angle = (i / 96) * Math.PI * 2;
        const position = new Vector3(
          Math.cos(angle) * track.xRadius,
          Math.sin(angle * 0.9) * track.wobble,
          Math.sin(angle) * track.zRadius
        );
        return position.applyMatrix4(matrix);
      });
      return { id: track.id, points };
    });
  }, [electronTracks]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * speed;
    groupRef.current?.children.forEach((child, idx) => {
      const electron = electronTracks[idx];
      if (!electron) return;
      const angle = elapsed + electron.offset;
      const position = new Vector3(
        Math.cos(angle) * electron.xRadius,
        Math.sin(angle * 0.9) * electron.wobble,
        Math.sin(angle) * electron.zRadius
      ).applyEuler(electron.tilt);
      child.position.copy(position);
    });
  });

  return (
    <group>
      <Line points={baseOrbit} color={shell.isValence ? '#f472b6' : '#94a3b8'} linewidth={1} dashed dashSize={0.16} gapSize={0.08} />
      {trackLines.map((track) => (
        <Line key={`track-${track.id}`} points={track.points} color={shell.isValence ? '#fb7185' : '#38bdf8'} linewidth={0.8} opacity={0.85} />
      ))}
      <group ref={groupRef}>
        {electronTracks.map((electron) => (
          <mesh key={electron.id}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={shell.isValence ? '#fb7185' : '#22d3ee'}
              emissive={shell.isValence ? '#fb7185' : '#22d3ee'}
              emissiveIntensity={0.7}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
