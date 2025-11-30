import { motion } from 'framer-motion';
import { useSceneStore } from '@state/scene.store';
import { useTranslation } from 'react-i18next';

export const MoleculeBuilder = () => {
  const { molecule, addHydrogen, resetMolecule } = useSceneStore();
  const { t } = useTranslation();

  return (
    <section className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">{t('molecule.title')}</p>
          <h3 className="text-xl font-semibold">{molecule.name}</h3>
          <p className="text-sm text-slate-400">{t('molecule.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5"
            onClick={resetMolecule}
          >
            {t('molecule.reset')}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="px-3 py-2 rounded-lg border border-primary/60 bg-primary/20 text-primary"
            onClick={addHydrogen}
          >
            {t('molecule.addAtom')}
          </motion.button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {molecule.atoms.map((atom) => (
          <div key={atom.symbol + atom.atomicNumber + Math.random()} className="p-3 rounded-lg border border-white/10 bg-white/5">
            <p className="text-slate-200 font-semibold">{atom.name}</p>
            <p className="text-xs text-slate-400">Z={atom.atomicNumber} | N={atom.neutrons}</p>
            <p className="text-xs text-accent">{atom.shells.length} shells</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {molecule.bonds.map((bond) => (
          <span key={bond.id} className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
            {bond.from.symbol}–{bond.to.symbol} ({Math.round(bond.strength * 100)}%)
          </span>
        ))}
      </div>
    </section>
  );
};
