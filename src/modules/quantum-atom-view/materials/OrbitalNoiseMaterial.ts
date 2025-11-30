import { shaderMaterial } from '@react-three/drei';
import { Color, ShaderMaterial } from 'three';
import { extend, ReactThreeFiber } from '@react-three/fiber';

const fragmentNoise = /* glsl */ `
  varying vec3 vPosition;
  uniform float time;
  uniform vec3 color;
  uniform float opacity;

  float random(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float n000 = random(i + vec3(0.0, 0.0, 0.0));
    float n100 = random(i + vec3(1.0, 0.0, 0.0));
    float n010 = random(i + vec3(0.0, 1.0, 0.0));
    float n110 = random(i + vec3(1.0, 1.0, 0.0));
    float n001 = random(i + vec3(0.0, 0.0, 1.0));
    float n101 = random(i + vec3(1.0, 0.0, 1.0));
    float n011 = random(i + vec3(0.0, 1.0, 1.0));
    float n111 = random(i + vec3(1.0, 1.0, 1.0));

    float n00 = mix(n000, n100, u.x);
    float n01 = mix(n001, n101, u.x);
    float n10 = mix(n010, n110, u.x);
    float n11 = mix(n011, n111, u.x);

    float n0 = mix(n00, n10, u.y);
    float n1 = mix(n01, n11, u.y);

    return mix(n0, n1, u.z);
  }

  void main() {
    float n = noise(vPosition * 0.8 + time * 0.35);
    float band = smoothstep(0.25, 0.95, n);
    float flicker = 0.4 + 0.6 * noise(vec3(n * 1.4) + time * 0.7);
    float alpha = opacity * band * flicker;
    gl_FragColor = vec4(color, alpha);
  }
`;

const vertexShader = /* glsl */ `
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const OrbitalNoiseMaterial = shaderMaterial(
  {
    time: 0,
    color: new Color('#7ad0e3'),
    opacity: 0.35
  },
  vertexShader,
  fragmentNoise
);

extend({ OrbitalNoiseMaterial });

export type OrbitalNoiseMaterialType = ShaderMaterial & {
  time: number;
  color: Color;
  opacity: number;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitalNoiseMaterial: ReactThreeFiber.Object3DNode<OrbitalNoiseMaterialType, typeof OrbitalNoiseMaterial>;
    }
  }
}
