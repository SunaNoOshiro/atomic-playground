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
import { QuantumAtomRenderer } from '@modules/quantum-atom-view/QuantumAtomRenderer';
import { VisualizationMode } from '@core/models/settings';
import { useOrbitals } from '@modules/quantum-atom-view/hooks/useOrbitals';

export const AtomView = () => {
  const { atom, molecule, atomType } = useSceneStore();
  const { settings } = useSettingsStore();
  const { t } = useTranslation();

  const valenceShell = atom.shells.find((shell) => shell.isValence);
  const orbitalSets = useOrbitals(atom);
  const electronCount = useMemo(
    () => atom.shells.reduce((total, shell) => total + shell.electrons.length, 0),
    [atom.shells]
  );

  const valenceOrbitals = useMemo(() => {
    const valenceSet = orbitalSets.find((set) => set.isValence);
    if (!valenceSet) return [] as { label: string; electrons: number; orbitalCount: number }[];

    const summaryMap = new Map<string, { label: string; electrons: number; orbitalCount: number }>();

    valenceSet.orbitals.forEach((orbital) => {
      const label = `${orbital.principal}${orbital.type}`;
      const existing = summaryMap.get(label) ?? { label, electrons: 0, orbitalCount: 0 };
      existing.electrons += orbital.electrons;
      existing.orbitalCount += 1;
      summaryMap.set(label, existing);
    });

    return Array.from(summaryMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true })
    );
  }, [orbitalSets]);

  const modeDescription =
    settings.atomMode === 'realistic'
      ? t('atom.modeDescriptions.realistic')
      : t('atom.modeDescriptions.simplified');

  const valenceBondingDescription = t(`atom.presets.${atomType}.bonding`, {
    defaultValue: t('atom.valenceOrbitals.bondingHint')
  });

  const visualizationLabel = t(`settings.visualizationOptions.${settings.visualizationMode}`);

  const canvasBackground = useMemo(() => {
    if (settings.theme === 'light') {
      return '#dfe2d6';
    }

    return settings.atomMode === 'simplified' ? '#0c1624' : '#0a0f1a';
  }, [settings.atomMode, settings.theme]);

  const legend = [
    { color: '#f59f8b', label: t('atom.legend.protons') },
    { color: '#9ad6b0', label: t('atom.legend.neutrons') },
    { color: '#7ad0e3', label: t('atom.legend.electrons') },
    { color: '#f2c94c', label: t('atom.legend.valence') },
    { color: '#b6a8ff', label: t('atom.legend.bonds') }
  ];

  return (
    <section className="glass-panel p-4 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">{t('atom.title')}</p>
          <h3 className="text-2xl font-semibold">{t(`atom.presets.${atomType}.label`)}</h3>
            <p className="text-sm text-slate-400">{t('atom.mode' + (settings.atomMode === 'realistic' ? 'Realistic' : 'Simplified'))}</p>
            <p className="text-xs text-primary font-medium mt-1">{visualizationLabel}</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">{modeDescription}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2 text-xs text-slate-300">
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Z={atom.atomicNumber}</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">N={atom.neutrons}</span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">e⁻={electronCount}</span>
          </div>
          <div className="flex gap-2 flex-wrap justify-end text-[11px] text-slate-200">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-3">
        <div className="h-[380px] w-full rounded-xl overflow-hidden border border-white/10">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <color attach="background" args={[canvasBackground]} />
            <fog attach="fog" args={[canvasBackground, 10, 22]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <Suspense fallback={null}>
              <Float speed={settings.animationSpeed} rotationIntensity={0.4} floatIntensity={0.6}>
                {settings.visualizationMode === VisualizationMode.BOHR ? (
                  <>
                    <Nucleus
                      protons={atom.atomicNumber}
                      neutrons={atom.neutrons}
                      visualizationMode={settings.visualizationMode}
                    />
                    {atom.shells.map((shell) => (
                      <ElectronShell key={shell.level} shell={shell} visualizationMode={settings.visualizationMode} />
                    ))}
                    {valenceShell && (
                      <ValenceHighlight
                        radius={valenceShell.radius}
                        visible
                        visualizationMode={settings.visualizationMode}
                      />
                    )}
                    <BondingAnimation molecule={molecule} visualizationMode={settings.visualizationMode} />
                  </>
                ) : (
                  <QuantumAtomRenderer atom={atom} />
                )}
              </Float>
              {settings.atomMode === 'realistic' && <Stars radius={40} depth={20} count={800} factor={4} fade speed={1} />}
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
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-200 space-y-2">
            <p className="font-semibold text-slate-100">{t('atom.legend.title')}</p>
            <p className="text-slate-400 leading-relaxed">{t('atom.legend.description')}</p>
            <div className="flex flex-wrap gap-2">
              {legend.map((item) => (
                <div
                  key={item.label + '-details'}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
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
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-100">{t('atom.valenceOrbitals.heading')}</p>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {t('atom.valenceOrbitals.label')}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">{t('atom.valenceOrbitals.description')}</p>
            {valenceOrbitals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {valenceOrbitals.map((orbital) => (
                  <div
                    key={orbital.label}
                    className="rounded border border-white/10 bg-white/5 p-2 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100">{orbital.label}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {t('atom.valenceOrbitals.electronCount', { count: orbital.electrons })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {t('atom.valenceOrbitals.orbitalCount', { count: orbital.orbitalCount })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-[11px]">{t('atom.valenceOrbitals.empty')}</p>
            )}
            <p className="text-slate-300 leading-relaxed">{valenceBondingDescription}</p>
          </div>
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
