import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const HomeView = () => {
  const { t } = useTranslation();
  const features = t('home.features', { returnObjects: true }) as string[];

  return (
    <section className="glass-panel p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">{t('app.title')}</p>
          <h1 className="text-3xl font-bold text-slate-50">{t('home.heroTitle')}</h1>
          <p className="mt-2 text-slate-300 max-w-2xl">{t('home.heroSubtitle')}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="hidden md:block px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/40"
        >
          {t('home.cta')}
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <motion.div
            key={feature}
            whileHover={{ y: -4 }}
            className="rounded-xl bg-white/5 border border-white/10 p-4"
          >
            <h3 className="font-semibold text-slate-100 text-lg">{feature}</h3>
            <p className="text-sm text-slate-400 mt-2">
              {t('app.subtitle')}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
