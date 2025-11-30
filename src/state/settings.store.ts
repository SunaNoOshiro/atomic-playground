import { create } from 'zustand';
import { SettingsService, LocalSettingsProvider } from '@core/services/SettingsService';
import { SettingsState, VisualizationMode } from '@core/models/settings';
import { bindSettingsToLoggers } from '@core/services/LoggerService';

const defaults: SettingsState = {
  theme: 'system',
  language: 'en',
  loggingLevel: 'info',
  animationSpeed: 1,
  atomMode: 'realistic',
  enableLogging: true,
  visualizationMode: VisualizationMode.BOHR
};

const settingsService = new SettingsService(new LocalSettingsProvider(), defaults);

interface SettingsStore {
  settings: SettingsState;
  updateSettings: (partial: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: settingsService.getSettings(),
  updateSettings: (partial) => {
    const updated = settingsService.updateSettings(partial);
    bindSettingsToLoggers(updated);
    set({ settings: updated });
  }
}));

settingsService.subscribe((next) => {
  bindSettingsToLoggers(next);
});
