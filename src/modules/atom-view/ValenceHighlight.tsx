import { Torus } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useSettingsStore } from '@state/settings.store';
import { VisualizationMode } from '@core/models/settings';

interface ValenceHighlightProps {
  radius: number;
  visible: boolean;
  visualizationMode: VisualizationMode;
}

export const ValenceHighlight = ({ radius, visible, visualizationMode }: ValenceHighlightProps) => {
  const { settings } = useSettingsStore();
  const motionScale = settings.reducedMotion ? 0.6 : 1;
  const quantumScale =
    visualizationMode === VisualizationMode.QUANTUM ? settings.quantumAnimationIntensity : 1;
  const color = settings.atomMode === 'realistic' ? '#f2c94c' : '#f4a261';
  const baseOpacity =
    (settings.atomMode === 'realistic' ? 0.58 : 0.32) *
    (visualizationMode === VisualizationMode.QUANTUM ? 1.2 : 1) *
    (0.75 + quantumScale * 0.35) *
    (motionScale * 0.8 + 0.25);
  const { scale, opacity } = useSpring({
    scale: visible ? 1 : 0.5,
    opacity: visible ? baseOpacity : 0,
    config: { mass: 1, tension: 170 * settings.animationSpeed * motionScale, friction: 20 }
  });

  return (
    <a.group scale={scale}>
      <Torus args={[radius, 0.05, 16, 120]}>
        <a.meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={1.1} />
      </Torus>
    </a.group>
  );
};
