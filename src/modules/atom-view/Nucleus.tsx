import { Instance, Instances } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Color, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface NucleusProps {
  protons: number;
  neutrons: number;
}

export const Nucleus = ({ protons, neutrons }: NucleusProps) => {
  const particles = useMemo(() => {
    const all = Array.from({ length: protons + neutrons }, (_, idx) => ({
      position: new Vector3(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6
      ),
      color: idx < protons ? new Color('#ff5f6d') : new Color('#6ee7b7'),
      wobbleSpeed: 1.2 + Math.random() * 0.6,
      wobbleIntensity: 0.02 + Math.random() * 0.02
    }));
    return all;
  }, [protons, neutrons]);

  const instanceRefs = useRef<Object3D[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
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
