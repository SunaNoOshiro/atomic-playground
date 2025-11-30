import i18next from 'i18next';
import { createLogger } from './LoggerService';

const logger = createLogger('i18n');

export const changeLanguage = async (lng: string): Promise<void> => {
  try {
    await i18next.changeLanguage(lng);
    if (typeof window !== 'undefined') {
      localStorage.setItem('atomic-lang', lng);
    }
    logger.info(`Language changed to ${lng}`);
  } catch (error) {
    logger.error('Failed to change language', error);
  }
};
