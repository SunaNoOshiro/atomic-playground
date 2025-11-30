import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Euler, Group, Matrix4, Vector3 } from 'three';
import { Shell } from '@core/models/atom';
import { useSettingsStore } from '@state/settings.store';
import { VisualizationMode } from '@core/models/settings';

interface ElectronShellProps {
  shell: Shell;
  visualizationMode: VisualizationMode;
}

export const ElectronShell = ({ shell, visualizationMode }: ElectronShellProps) => {
  const { settings } = useSettingsStore();
  const groupRef = useRef<Group>(null);
  const speed = 0.6 * settings.animationSpeed * (shell.isValence ? 1.4 : 1);
  const isRealistic = settings.atomMode === 'realistic';
  const isLightTheme = settings.theme === 'light';
  const isQuantum = visualizationMode === VisualizationMode.QUANTUM;

  const orbitColor = shell.isValence
    ? isLightTheme
      ? '#cf9a1b'
      : '#f3c94c'
    : isLightTheme
    ? '#4b72b2'
    : '#b8c4d9';
  const trackColor = shell.isValence
    ? isLightTheme
      ? '#e5af22'
      : '#f0b429'
    : isLightTheme
    ? '#2f9ac2'
    : '#7cc7dd';
  const electronColor = shell.isValence
    ? isLightTheme
      ? '#d47a23'
      : '#f4a261'
    : isLightTheme
    ? '#1f82af'
    : '#7ad0e3';

  const electronTracks = useMemo(() => {
    return shell.electrons.map((electron, index) => {
      const tilt = new Euler(
        (Math.random() - 0.5) * (isRealistic ? 0.9 : 0.45),
        (Math.random() - 0.5) * (isRealistic ? 0.9 : 0.45),
        (Math.random() - 0.5) * (isRealistic ? 0.6 : 0.25)
      );

      const eccentricity = isRealistic ? (isQuantum ? 0.45 : 0.35) : isQuantum ? 0.12 : 0.02;
      const wobble = isRealistic ? (isQuantum ? 0.26 : 0.18) : isQuantum ? 0.08 : 0.02;
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

  const quantumCloud = useMemo(() => {
    if (visualizationMode !== VisualizationMode.QUANTUM) return null;

    const pointsPerElectron = 30;
    const totalPoints = shell.electrons.length * pointsPerElectron;
    const data = new Float32Array(totalPoints * 3);

    for (let i = 0; i < totalPoints; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radialNoise = 0.65 + Math.random() * 0.25;
      const wobble = (Math.random() - 0.5) * shell.radius * 0.35;
      data[i * 3] = Math.cos(angle) * shell.radius * radialNoise;
      data[i * 3 + 1] = wobble;
      data[i * 3 + 2] = Math.sin(angle) * shell.radius * radialNoise;
    }

    return data;
  }, [shell.electrons.length, shell.radius, visualizationMode]);

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
      {!isRealistic && visualizationMode === VisualizationMode.BOHR && (
        <Line
          points={baseOrbit}
          color={orbitColor}
          linewidth={1}
          dashed
          dashSize={0.16}
          gapSize={0.08}
          opacity={0.85}
        />
      )}
      {!isRealistic && visualizationMode === VisualizationMode.BOHR &&
        trackLines.map((track) => (
          <Line
            key={`track-${track.id}`}
            points={track.points}
            color={trackColor}
            linewidth={0.8}
            dashed
            dashSize={0.14}
            gapSize={0.07}
            opacity={0.78}
          />
        ))}
      {visualizationMode === VisualizationMode.QUANTUM && quantumCloud && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={quantumCloud}
              count={quantumCloud.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            color={electronColor}
            opacity={0.35}
            transparent
            depthWrite={false}
          />
        </points>
      )}
      <group ref={groupRef}>
        {electronTracks.map((electron) => (
          <mesh key={electron.id}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={electronColor}
              emissive={electronColor}
              emissiveIntensity={isQuantum ? 0.8 : 0.55}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
