import { HomeView } from '@modules/home/HomeView';
import { AtomView } from '@modules/atom-view/AtomView';
import { MoleculeBuilder } from '@modules/molecule-view/MoleculeBuilder';
import { SettingsPanel } from '@modules/home/SettingsPanel';
import { useTranslation } from 'react-i18next';

export const MobileLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral px-4 py-6 space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">{t('app.title')}</p>
        <h2 className="text-xl font-semibold text-slate-50">{t('app.subtitle')}</h2>
        <div className="flex gap-2 text-xs text-slate-300">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{t('nav.home')}</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{t('nav.atom')}</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{t('nav.settings')}</span>
        </div>
      </header>

      <div className="space-y-4">
        <HomeView />
        <AtomView />
        <MoleculeBuilder />
        <SettingsPanel />
      </div>
    </div>
  );
};
