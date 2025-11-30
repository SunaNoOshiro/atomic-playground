import { create } from 'zustand';
import { Atom, Molecule } from '@core/models/atom';
import { createWater } from '@core/services/MoleculeService';
import { AtomPresetKey, availableAtoms, createAtom, createAtomFromPreset, defaultAtom } from '@core/services/AtomService';
import { nanoid } from 'nanoid/non-secure';

interface SceneStore {
  atom: Atom;
  molecule: Molecule;
  atomType: AtomPresetKey;
  atomOptions: typeof availableAtoms;
  addHydrogen: () => void;
  selectAtom: (preset: AtomPresetKey) => void;
  resetMolecule: () => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  atom: defaultAtom(),
  molecule: createWater(),
  atomType: 'oxygen',
  atomOptions: availableAtoms,
  selectAtom: (preset) => {
    set({ atom: createAtomFromPreset(preset), atomType: preset });
  },
  addHydrogen: () => {
    const { molecule } = get();
    const newAtom = createAtom('Hydrogen', 'H', 1, 0);
    const updatedAtoms = [...molecule.atoms, newAtom];
    set({
      molecule: {
        ...molecule,
        atoms: updatedAtoms,
        bonds: [
          ...molecule.bonds,
          { id: nanoid(), from: molecule.atoms[0], to: newAtom, strength: 0.5 }
        ]
      }
    });
  },
  resetMolecule: () => set({ molecule: createWater(), atom: defaultAtom(), atomType: 'oxygen' })
}));
