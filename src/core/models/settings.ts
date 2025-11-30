export type Theme = 'light' | 'dark' | 'system';
export type AtomMode = 'realistic' | 'simplified';
export type LoggingLevel = 'debug' | 'info' | 'warn' | 'error';

export enum VisualizationMode {
  BOHR = 'bohr',
  QUANTUM = 'quantum'
}

export interface SettingsState {
  theme: Theme;
  language: string;
  loggingLevel: LoggingLevel;
  animationSpeed: number;
  atomMode: AtomMode;
  enableLogging: boolean;
  visualizationMode: VisualizationMode;
  quantumAnimationIntensity: number;
  reducedMotion: boolean;
}

export interface ISettingsProvider {
  load(): SettingsState | null;
  save(settings: SettingsState): void;
}

export interface ISettingsService {
  getSettings(): SettingsState;
  updateSettings(settings: Partial<SettingsState>): SettingsState;
  subscribe(listener: (settings: SettingsState) => void): () => void;
}
