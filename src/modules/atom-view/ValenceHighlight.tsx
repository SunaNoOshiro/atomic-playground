import { Torus } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useSettingsStore } from '@state/settings.store';

interface ValenceHighlightProps {
  radius: number;
  visible: boolean;
}

export const ValenceHighlight = ({ radius, visible }: ValenceHighlightProps) => {
  const { settings } = useSettingsStore();
  const color = settings.atomMode === 'realistic' ? '#FF6584' : '#fb7185';
  const baseOpacity = settings.atomMode === 'realistic' ? 0.6 : 0.35;
  const { scale, opacity } = useSpring({
    scale: visible ? 1 : 0.5,
    opacity: visible ? baseOpacity : 0,
    config: { mass: 1, tension: 170 * settings.animationSpeed, friction: 20 }
  });

  return (
    <a.group scale={scale}>
      <Torus args={[radius, 0.05, 16, 120]}>
        <a.meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={1.1} />
      </Torus>
    </a.group>
  );
};
