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

export const AtomView = () => {
  const { atom, molecule } = useSceneStore();
  const { settings } = useSettingsStore();
  const { t } = useTranslation();

  const valenceShell = atom.shells.find((shell) => shell.isValence);

  return (
    <section className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">{t('atom.title')}</p>
          <h3 className="text-2xl font-semibold">{atom.name}</h3>
          <p className="text-sm text-slate-400">{t('atom.mode' + (settings.atomMode === 'realistic' ? 'Realistic' : 'Simplified'))}</p>
        </div>
        <div className="flex gap-2 text-xs text-slate-300">
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Z={atom.atomicNumber}</span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">N={atom.neutrons}</span>
        </div>
      </div>

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

      <div className="text-sm text-slate-300 flex items-center gap-3 flex-wrap">
        <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{t('atom.valence')}</span>
        <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{t('atom.animation')}</span>
      </div>
    </section>
  );
};
