import { QuadraticBezierLine } from '@react-three/drei';
import { Molecule } from '@core/models/atom';
import { useSpring, a } from '@react-spring/three';

interface BondingAnimationProps {
  molecule: Molecule;
}

export const BondingAnimation = ({ molecule }: BondingAnimationProps) => {
  const { opacity } = useSpring({ from: { opacity: 0 }, to: { opacity: 0.9 }, loop: { reverse: true }, config: { duration: 1200 } });

  if (!molecule.bonds.length) return null;

  const bondColor = '#7c3aed';

  return (
    <group>
      {molecule.bonds.map((bond) => (
        <a.group key={bond.id}>
          <QuadraticBezierLine
            start={[0, 0, 0]}
            end={[Math.random() * 2 - 1, Math.random() * 1.5, Math.random() * 2 - 1]}
            mid={[0, 0.2, 0]}
            color={bondColor}
            lineWidth={1.2}
            dashed
            dashSize={0.18}
            gapSize={0.12}
            transparent
            opacity={opacity as unknown as number}
          />
        </a.group>
      ))}
    </group>
  );
};
