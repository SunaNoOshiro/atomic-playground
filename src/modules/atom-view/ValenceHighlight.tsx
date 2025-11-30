import { Torus } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useSettingsStore } from '@state/settings.store';

interface ValenceHighlightProps {
  radius: number;
  visible: boolean;
}

export const ValenceHighlight = ({ radius, visible }: ValenceHighlightProps) => {
  const { settings } = useSettingsStore();
  const { scale, opacity } = useSpring({
    scale: visible ? 1 : 0.5,
    opacity: visible ? 0.6 : 0,
    config: { mass: 1, tension: 170 * settings.animationSpeed, friction: 20 }
  });

  return (
    <a.group scale={scale}>
      <Torus args={[radius, 0.05, 16, 120]}>
        <a.meshStandardMaterial color="#FF6584" transparent opacity={opacity} emissive="#ff2d55" emissiveIntensity={1.2} />
      </Torus>
    </a.group>
  );
};
