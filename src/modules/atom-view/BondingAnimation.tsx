import { QuadraticBezierLine } from '@react-three/drei';
import { Molecule } from '@core/models/atom';
import { useSpring, a } from '@react-spring/three';
import { VisualizationMode } from '@core/models/settings';

interface BondingAnimationProps {
  molecule: Molecule;
  visualizationMode: VisualizationMode;
}

export const BondingAnimation = ({ molecule, visualizationMode }: BondingAnimationProps) => {
  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: visualizationMode === VisualizationMode.QUANTUM ? 0.8 : 0.9 },
    loop: { reverse: true },
    config: { duration: visualizationMode === VisualizationMode.QUANTUM ? 900 : 1200 }
  });

  if (!molecule.bonds.length) return null;

  const bondColor = visualizationMode === VisualizationMode.QUANTUM ? '#7dd3fc' : '#b6a8ff';

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
            dashSize={visualizationMode === VisualizationMode.QUANTUM ? 0.12 : 0.18}
            gapSize={visualizationMode === VisualizationMode.QUANTUM ? 0.08 : 0.12}
            transparent
            opacity={opacity as unknown as number}
          />
        </a.group>
      ))}
    </group>
  );
};
