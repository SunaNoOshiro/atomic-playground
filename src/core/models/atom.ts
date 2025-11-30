export interface Particle {
  id: string;
  type: 'proton' | 'neutron' | 'electron';
  charge: number;
  positionIndex?: number;
}

export interface Shell {
  level: number;
  electrons: Particle[];
  radius: number;
  isValence: boolean;
}

export interface Atom {
  name: string;
  symbol: string;
  atomicNumber: number;
  neutrons: number;
  shells: Shell[];
}

export interface MoleculeBond {
  id: string;
  from: Atom;
  to: Atom;
  strength: number;
}

export interface Molecule {
  id: string;
  name: string;
  atoms: Atom[];
  bonds: MoleculeBond[];
}
