import { Molecule } from '@core/models/atom';
import { createAtom } from './AtomService';
import { nanoid } from 'nanoid/non-secure';

export const createWater = (): Molecule => {
  const oxygen = createAtom('Oxygen', 'O', 8, 8);
  const hydrogen1 = createAtom('Hydrogen', 'H', 1, 0);
  const hydrogen2 = createAtom('Hydrogen', 'H', 1, 0);

  return {
    id: nanoid(),
    name: 'Water',
    atoms: [oxygen, hydrogen1, hydrogen2],
    bonds: [
      { id: nanoid(), from: oxygen, to: hydrogen1, strength: 0.8 },
      { id: nanoid(), from: oxygen, to: hydrogen2, strength: 0.8 }
    ]
  };
};

export const createCustomMolecule = (atoms: Molecule['atoms']): Molecule => ({
  id: nanoid(),
  name: 'Custom molecule',
  atoms,
  bonds: atoms.length > 1
    ? atoms.slice(1).map((atom, index) => ({ id: nanoid(), from: atoms[0], to: atom, strength: 0.6 + index * 0.1 }))
    : []
});
