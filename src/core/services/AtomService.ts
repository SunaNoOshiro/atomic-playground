import { Atom, Particle, Shell } from '@core/models/atom';
import { nanoid } from 'nanoid/non-secure';

const shellCapacities = [2, 8, 18, 32];

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

export const defaultAtom = (): Atom => createAtom('Oxygen', 'O', 8, 8);
