import { ISettingsProvider, ISettingsService, SettingsState } from '@core/models/settings';
import { safeLocalStorage } from '@utils/storage';

export const SETTINGS_KEY = 'atomic-settings';

export class LocalSettingsProvider implements ISettingsProvider {
  load(): SettingsState | null {
    const raw = safeLocalStorage.get(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as SettingsState) : null;
  }

  save(settings: SettingsState): void {
    safeLocalStorage.set(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export class SettingsService implements ISettingsService {
  private provider: ISettingsProvider;
  private listeners: Array<(settings: SettingsState) => void> = [];
  private state: SettingsState;

  constructor(provider: ISettingsProvider, defaults: SettingsState) {
    this.provider = provider;
    const stored = provider.load();
    this.state = { ...defaults, ...(stored ?? {}) };
  }

  getSettings(): SettingsState {
    return this.state;
  }

  updateSettings(settings: Partial<SettingsState>): SettingsState {
    this.state = { ...this.state, ...settings };
    this.provider.save(this.state);
    this.listeners.forEach((listener) => listener(this.state));
    return this.state;
  }

  subscribe(listener: (settings: SettingsState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
