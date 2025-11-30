import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { Suspense } from 'react';
import { Nucleus } from './Nucleus';
import { ElectronShell } from './ElectronShell';
import { ValenceHighlight } from './ValenceHighlight';
import { BondingAnimation } from './BondingAnimation';
import { useSceneStore } from '@state/scene.store';
import { useSettingsStore } from '@state/settings.store';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const AtomView = () => {
  const { atom, molecule, atomOptions, atomType, selectAtom } = useSceneStore();
  const { settings } = useSettingsStore();
  const { t } = useTranslation();

  const valenceShell = atom.shells.find((shell) => shell.isValence);
  const electronCount = useMemo(
    () => atom.shells.reduce((total, shell) => total + shell.electrons.length, 0),
    [atom.shells]
  );

  return (
    <section className="glass-panel p-4 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">{t('atom.title')}</p>
          <h3 className="text-2xl font-semibold">{t(`atom.presets.${atomType}.label`)}</h3>
          <p className="text-sm text-slate-400">{t('atom.mode' + (settings.atomMode === 'realistic' ? 'Realistic' : 'Simplified'))}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2 text-xs text-slate-300">
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Z={atom.atomicNumber}</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">N={atom.neutrons}</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">e⁻={electronCount}</span>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {atomOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => selectAtom(option.key)}
                className={`px-3 py-1 rounded-full border text-xs transition ${
                  atomType === option.key
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-white/10 text-slate-200 hover:border-white/20'
                }`}
              >
                {t(`atom.presets.${option.key}.label`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-3">
        <div className="h-[380px] w-full rounded-xl overflow-hidden border border-white/10">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <color attach="background" args={[settings.theme === 'light' ? '#f8fafc' : '#0b1224']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <Suspense fallback={null}>
              <Float speed={settings.animationSpeed} rotationIntensity={0.4} floatIntensity={0.6}>
                <Nucleus protons={atom.atomicNumber} neutrons={atom.neutrons} />
                {atom.shells.map((shell) => (
                  <ElectronShell key={shell.level} shell={shell} />
                ))}
                {valenceShell && <ValenceHighlight radius={valenceShell.radius} visible />}
                <BondingAnimation molecule={molecule} />
              </Float>
              <Stars radius={40} depth={20} count={800} factor={4} fade speed={1} />
            </Suspense>
            <OrbitControls enablePan={false} />
          </Canvas>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{t('atom.structure.heading')}</p>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t(`atom.presets.${atomType}.label`)}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">{t(`atom.presets.${atomType}.summary`)}</p>
          <ul className="space-y-1 text-slate-200">
            <li>
              <span className="text-slate-400">{t('atom.structure.protons')}:</span> {atom.atomicNumber}
            </li>
            <li>
              <span className="text-slate-400">{t('atom.structure.neutrons')}:</span> {atom.neutrons}
            </li>
            <li>
              <span className="text-slate-400">{t('atom.structure.electrons')}:</span> {electronCount}
            </li>
            <li>
              <span className="text-slate-400">{t('atom.structure.shells')}:</span>{' '}
              {atom.shells.map((shell) => `${shell.level}(${shell.electrons.length})`).join(' • ')}
            </li>
          </ul>
          <p className="text-xs text-slate-400 leading-relaxed">{t(`atom.presets.${atomType}.structure`)}</p>
          <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{t('atom.valence')}</span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{t('atom.animation')}</span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{t('atom.motionHint')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
