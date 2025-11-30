import { Instance, Instances } from '@react-three/drei';
import { useMemo } from 'react';
import { Color, Vector3 } from 'three';

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
      color: idx < protons ? new Color('#ff5f6d') : new Color('#6ee7b7')
    }));
    return all;
  }, [protons, neutrons]);

  return (
    <Instances limit={protons + neutrons} castShadow receiveShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.35} />
      {particles.map((particle, index) => (
        <Instance key={index} position={particle.position} color={particle.color} />
      ))}
    </Instances>
  );
};
