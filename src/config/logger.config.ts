import { LoggingLevel } from '@core/models/settings';

export type ModuleName =
  | 'app'
  | 'layout'
  | 'home'
  | 'atom'
  | 'molecule'
  | 'settings'
  | 'i18n';

export const defaultLoggingLevel: LoggingLevel = 'info';

export const moduleLogging: Record<ModuleName, LoggingLevel> = {
  app: 'info',
  layout: 'info',
  home: 'debug',
  atom: 'debug',
  molecule: 'debug',
  settings: 'info',
  i18n: 'warn'
};
