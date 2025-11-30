import { ColorRepresentation } from 'three';

export type OrbitalType = 's' | 'p' | 'd';
export type POrbitalOrientation = 'px' | 'py' | 'pz';
export type DOrbitalOrientation = 'dxy' | 'dyz' | 'dxz' | 'dx2y2' | 'dz2';

export interface IOrbitalBase {
  id: string;
  principal: number;
  electrons: number;
  radius: number;
  color: ColorRepresentation;
  phaseOffset: number;
}

export interface IOrbital extends IOrbitalBase {
  type: OrbitalType;
  orientation?: POrbitalOrientation | DOrbitalOrientation;
}

export interface IOrbitalSet {
  shell: number;
  orbitals: IOrbital[];
  isValence: boolean;
}
