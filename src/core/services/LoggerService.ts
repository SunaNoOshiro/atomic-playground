import log, { Logger } from 'loglevel';
import { moduleLogging, ModuleName, defaultLoggingLevel } from '@config/logger.config';
import { SettingsState } from '@core/models/settings';

const moduleCache = new Map<ModuleName, Logger>();

const applyLevel = (logger: Logger, level: string, enabled: boolean) => {
  if (!enabled) {
    logger.disableAll();
    return;
  }
  logger.setLevel(level as log.LogLevelDesc, false);
};

export const createLogger = (module: ModuleName): Logger => {
  if (moduleCache.has(module)) return moduleCache.get(module)!;
  const logger = log.getLogger(module);
  const configuredLevel = moduleLogging[module] || defaultLoggingLevel;
  applyLevel(logger, configuredLevel, true);
  moduleCache.set(module, logger);
  return logger;
};

export const bindSettingsToLoggers = (settings: SettingsState): void => {
  moduleCache.forEach((logger) => applyLevel(logger, settings.loggingLevel, settings.enableLogging));
};
