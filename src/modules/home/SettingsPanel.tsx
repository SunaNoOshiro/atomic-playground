import { useSettingsStore } from '@state/settings.store';
import { changeLanguage } from '@core/services/LocalizationService';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useSceneStore } from '@state/scene.store';

const loggingLevels = ['debug', 'info', 'warn', 'error'] as const;
const themes = ['system', 'light', 'dark'] as const;
const atomModes = ['realistic', 'simplified'] as const;
const visualizationModes = ['classic', 'quantum'] as const;

export const SettingsPanel = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const { atomOptions, atomType, selectAtom } = useSceneStore();

  useEffect(() => {
    changeLanguage(settings.language);
  }, [settings.language]);

  return (
    <section className="glass-panel p-5 space-y-4">
      <div>
        <h2 className="section-title">{t('settings.title')}</h2>
        <p className="section-subtitle">{t('app.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-200 font-semibold">{t('settings.theme')}</span>
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as typeof themes[number] })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          >
            {themes.map((theme) => (
              <option key={theme} value={theme} className="text-slate-900">
                {theme}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <span className="text-slate-200 font-semibold">{t('settings.atomSelection')}</span>
          <div className="grid grid-cols-3 gap-2">
            {atomOptions.map((option) => (
              <button
                key={option.key}
                className={`rounded-lg px-3 py-2 border transition ${
                  atomType === option.key
                    ? 'border-primary bg-primary/20 text-primary shadow-[0_0_0_1px_rgba(94,234,212,0.4)]'
                    : 'border-white/10 hover:border-white/20 text-slate-100'
                }`}
                onClick={() => selectAtom(option.key)}
              >
                <div className="text-sm font-semibold">{option.symbol}</div>
                <div className="text-[11px] text-slate-300 leading-tight">{t(`atom.presets.${option.key}.label`)}</div>
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-200 font-semibold">{t('settings.language')}</span>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          >
            <option value="en" className="text-slate-900">English</option>
            <option value="ua" className="text-slate-900">Українська</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-200 font-semibold">{t('settings.visualizationMode')}</span>
            <span className="text-[11px] text-slate-400">{t('settings.quantumModeInfo')}</span>
          </div>
          <select
            value={settings.visualizationMode}
            onChange={(e) =>
              updateSettings({ visualizationMode: e.target.value as (typeof visualizationModes)[number] })
            }
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          >
            {visualizationModes.map((mode) => (
              <option key={mode} value={mode} className="text-slate-900">
                {t(`settings.visualizationModes.${mode}.label`)}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t(`settings.visualizationModes.${settings.visualizationMode}.description`)}
          </p>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-200 font-semibold">{t('settings.logging')}</span>
          <select
            value={settings.loggingLevel}
            onChange={(e) => updateSettings({ loggingLevel: e.target.value as typeof loggingLevels[number] })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          >
            {loggingLevels.map((level) => (
              <option key={level} value={level} className="text-slate-900">
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-200 font-semibold">{t('settings.speed')}</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.animationSpeed}
            onChange={(e) => updateSettings({ animationSpeed: Number(e.target.value) })}
            className="accent-primary"
          />
          <span className="text-xs text-slate-400">{settings.animationSpeed.toFixed(1)}x</span>
        </label>

        <label
          className={`flex flex-col gap-2 text-sm ${settings.visualizationMode !== 'quantum' ? 'opacity-60' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-semibold">{t('settings.quantumIntensity')}</span>
            <span className="text-xs text-slate-400">{settings.quantumAnimationIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={settings.quantumAnimationIntensity}
            onChange={(e) => updateSettings({ quantumAnimationIntensity: Number(e.target.value) })}
            disabled={settings.visualizationMode !== 'quantum'}
            className="accent-primary disabled:cursor-not-allowed"
          />
          <p className="text-xs text-slate-400">{t('settings.quantumIntensityHint')}</p>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-200 font-semibold">{t('settings.atomMode')}</span>
          <div className="flex gap-2">
            {atomModes.map((mode) => (
              <button
                key={mode}
                className={`flex-1 rounded-lg px-3 py-2 border ${
                  settings.atomMode === mode ? 'border-primary bg-primary/20 text-primary' : 'border-white/10'
                }`}
                onClick={() => updateSettings({ atomMode: mode })}
              >
                {mode}
              </button>
            ))}
          </div>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.enableLogging}
            onChange={(e) => updateSettings({ enableLogging: e.target.checked })}
            className="h-4 w-4 rounded border-white/30 bg-white/5 mt-1"
          />
          <div className="flex flex-col gap-1">
            <span className="text-slate-200">{t('settings.loggingToggle')}</span>
            <span className="text-xs text-slate-400 leading-relaxed">{t('settings.loggingHint')}</span>
          </div>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
            className="h-4 w-4 rounded border-white/30 bg-white/5 mt-1"
          />
          <div className="flex flex-col gap-1">
            <span className="text-slate-200">{t('settings.reducedMotion')}</span>
            <span className="text-xs text-slate-400 leading-relaxed">{t('settings.reducedMotionHint')}</span>
          </div>
        </label>
      </div>
    </section>
  );
};

