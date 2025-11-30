import { Atom, Particle, Shell } from '@core/models/atom';
import { nanoid } from 'nanoid/non-secure';

export type AtomPresetKey = 'oxygen' | 'hydrogen' | 'helium';

const shellCapacities = [2, 8, 18, 32];

const atomPresets: Record<AtomPresetKey, { name: string; symbol: string; atomicNumber: number; neutrons: number }> = {
  oxygen: { name: 'Oxygen', symbol: 'O', atomicNumber: 8, neutrons: 8 },
  hydrogen: { name: 'Hydrogen', symbol: 'H', atomicNumber: 1, neutrons: 0 },
  helium: { name: 'Helium', symbol: 'He', atomicNumber: 2, neutrons: 2 }
};

export const createShells = (atomicNumber: number): Shell[] => {
  const shells: Shell[] = [];
  let remaining = atomicNumber;
  let level = 1;
  while (remaining > 0 && level <= shellCapacities.length) {
    const capacity = shellCapacities[level - 1];
    const electronsCount = Math.min(remaining, capacity);
    const electrons: Particle[] = Array.from({ length: electronsCount }, (_, idx) => ({
      id: nanoid(),
      type: 'electron',
      charge: -1,
      positionIndex: idx
    } as Particle & { positionIndex: number }));
    shells.push({
      level,
      electrons,
      radius: 1.5 + level * 0.75,
      isValence: remaining - electronsCount === 0
    });
    remaining -= electronsCount;
    level += 1;
  }
  return shells;
};

export const createAtom = (name: string, symbol: string, atomicNumber: number, neutrons: number): Atom => ({
  name,
  symbol,
  atomicNumber,
  neutrons,
  shells: createShells(atomicNumber)
});

export const createAtomFromPreset = (preset: AtomPresetKey): Atom => {
  const atom = atomPresets[preset];
  return createAtom(atom.name, atom.symbol, atom.atomicNumber, atom.neutrons);
};

export const defaultAtom = (): Atom => createAtomFromPreset('oxygen');

export const availableAtoms = Object.entries(atomPresets).map(([key, preset]) => ({
  key: key as AtomPresetKey,
  ...preset
}));
