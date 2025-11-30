import { QuadraticBezierLine } from '@react-three/drei';
import { Molecule } from '@core/models/atom';
import { useSpring, a } from '@react-spring/three';
import { VisualizationMode } from '@core/models/settings';
import { useSettingsStore } from '@state/settings.store';

interface BondingAnimationProps {
  molecule: Molecule;
  visualizationMode: VisualizationMode;
}

export const BondingAnimation = ({ molecule, visualizationMode }: BondingAnimationProps) => {
  const { settings } = useSettingsStore();
  const motionScale = settings.reducedMotion ? 0.65 : 1;
  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 0.85 },
    loop: { reverse: true },
    config: { duration: 1200 / (settings.animationSpeed * motionScale) }
  });

  if (!molecule.bonds.length) return null;

  const bondColor = visualizationMode === VisualizationMode.QUANTUM ? '#8ec5ff' : '#b6a8ff';

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
