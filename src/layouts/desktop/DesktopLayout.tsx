import { HomeView } from '@modules/home/HomeView';
import { AtomView } from '@modules/atom-view/AtomView';
import { MoleculeBuilder } from '@modules/molecule-view/MoleculeBuilder';
import { SettingsPanel } from '@modules/home/SettingsPanel';
import { useTranslation } from 'react-i18next';

export const DesktopLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">{t('app.title')}</p>
          <h2 className="text-2xl font-semibold text-slate-50">{t('app.subtitle')}</h2>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-sm text-slate-300">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{t('nav.home')}</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{t('nav.atom')}</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{t('nav.molecule')}</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{t('nav.settings')}</span>
        </nav>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <HomeView />
          <AtomView />
        </div>
        <div className="space-y-6">
          <SettingsPanel />
          <MoleculeBuilder />
        </div>
      </div>
    </div>
  );
};
