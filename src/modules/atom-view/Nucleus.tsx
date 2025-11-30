import { Instance, Instances } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Color, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { VisualizationMode } from '@core/models/settings';
import { useSettingsStore } from '@state/settings.store';

interface NucleusProps {
  protons: number;
  neutrons: number;
  visualizationMode: VisualizationMode;
}

export const Nucleus = ({ protons, neutrons, visualizationMode }: NucleusProps) => {
  const { settings } = useSettingsStore();
  const isQuantum = visualizationMode === VisualizationMode.QUANTUM;
  const motionScale = settings.reducedMotion ? 0.5 : 1;
  const quantumScale = isQuantum ? settings.quantumAnimationIntensity : 1;

  const particles = useMemo(() => {
    const all = Array.from({ length: protons + neutrons }, (_, idx) => ({
      position: new Vector3(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6
      ),
      color: idx < protons ? new Color('#f59f8b') : new Color('#9ad6b0'),
      wobbleSpeed: (1.2 + Math.random() * 0.6) * (isQuantum ? 1.25 : 1) * (motionScale * 0.85 + 0.2),
      wobbleIntensity:
        (0.02 + Math.random() * 0.02) * (isQuantum ? 1.3 : 1) * motionScale * (0.8 + quantumScale * 0.4)
    }));
    return all;
  }, [isQuantum, motionScale, neutrons, protons, quantumScale]);

  const instanceRefs = useRef<Object3D[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * (motionScale * 0.8 + 0.35) * (0.8 + quantumScale * 0.3);
    instanceRefs.current.forEach((instance, idx) => {
      const particle = particles[idx];
      if (!instance || !particle) return;

      const wobble = Math.sin(t * particle.wobbleSpeed + idx) * particle.wobbleIntensity;
      instance.position.set(
        particle.position.x + wobble,
        particle.position.y + Math.cos(t * (particle.wobbleSpeed + 0.3) + idx) * particle.wobbleIntensity,
        particle.position.z + Math.sin(t * (particle.wobbleSpeed + 0.6) + idx) * particle.wobbleIntensity
      );
    });
  });

  return (
    <Instances limit={protons + neutrons} castShadow receiveShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.35} />
      {particles.map((particle, index) => (
        <Instance
          key={index}
          position={particle.position}
          color={particle.color}
          ref={(ref) => {
            if (ref) instanceRefs.current[index] = ref as unknown as Object3D;
          }}
        />
      ))}
    </Instances>
  );
};
