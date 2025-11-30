import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { createLogger } from '@core/services/LoggerService';
import { moduleLogging } from '@config/logger.config';

const logger = createLogger('i18n');

const resources = import.meta.glob('./*.json', { eager: true, import: 'default' });

const translationResources: Record<string, { translation: object }> = {};
Object.entries(resources).forEach(([path, value]) => {
  const lang = path.split('/').pop()?.replace('.json', '') || 'en';
  translationResources[lang] = { translation: value as object };
});

const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem('atomic-lang') : null;

i18next
  .use(initReactI18next)
  .init({
    resources: translationResources,
    lng: storedLanguage || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })
  .then(() => logger.info('i18next initialized'))
  .catch((error) => logger.error('i18next init failed', error));

export default i18next;
