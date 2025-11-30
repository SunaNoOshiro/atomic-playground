import { useMemo } from 'react';
import { Atom } from '@core/models/atom';
import { nanoid } from 'nanoid/non-secure';
import { DOrbitalOrientation, IOrbital, IOrbitalSet, POrbitalOrientation } from '../models/orbitals';

const pOrientations: POrbitalOrientation[] = ['px', 'py', 'pz'];
const dOrientations: DOrbitalOrientation[] = ['dxy', 'dyz', 'dxz', 'dx2y2', 'dz2'];

export const useOrbitals = (atom: Atom): IOrbitalSet[] => {
  return useMemo(() => {
    return atom.shells.map((shell) => {
      let remainingElectrons = shell.electrons.length;
      const orbitals: IOrbital[] = [];
      const baseColor = shell.isValence ? '#c8b5ff' : '#7ad0e3';

      if (remainingElectrons > 0) {
        const electrons = Math.min(2, remainingElectrons);
        orbitals.push({
          id: `${shell.level}-s`,
          type: 's',
          principal: shell.level,
          electrons,
          radius: shell.radius * 0.7,
          color: baseColor,
          phaseOffset: Math.random() * Math.PI * 2
        });
        remainingElectrons -= electrons;
      }

      if (shell.level >= 2 && remainingElectrons > 0) {
        let orientationIndex = 0;
        while (remainingElectrons > 0 && orientationIndex < pOrientations.length) {
          const electrons = Math.min(2, remainingElectrons);
          orbitals.push({
            id: `${shell.level}-p-${orientationIndex}`,
            type: 'p',
            principal: shell.level,
            electrons,
            orientation: pOrientations[orientationIndex],
            radius: shell.radius,
            color: baseColor,
            phaseOffset: Math.random() * Math.PI * 2
          });
          remainingElectrons -= electrons;
          orientationIndex += 1;
        }
      }

      if (shell.level >= 3 && remainingElectrons > 0) {
        let orientationIndex = 0;
        while (remainingElectrons > 0 && orientationIndex < dOrientations.length) {
          const electrons = Math.min(2, remainingElectrons);
          orbitals.push({
            id: `${shell.level}-d-${orientationIndex}-${nanoid(4)}`,
            type: 'd',
            principal: shell.level,
            electrons,
            orientation: dOrientations[orientationIndex],
            radius: shell.radius * 1.15,
            color: baseColor,
            phaseOffset: Math.random() * Math.PI * 2
          });
          remainingElectrons -= electrons;
          orientationIndex += 1;
        }
      }

      return {
        shell: shell.level,
        orbitals,
        isValence: shell.isValence
      };
    });
  }, [atom.shells]);
};
