import { DesktopLayout } from '@layouts/desktop/DesktopLayout';
import { MobileLayout } from '@layouts/mobile/MobileLayout';
import { createLogger } from '@core/services/LoggerService';
import { useSettingsStore } from '@state/settings.store';
import { useTheme } from '@utils/theme';
import { useIsMobile } from '@utils/responsive';
import { useEffect, useMemo } from 'react';

const logger = createLogger('app');

function resolveTheme(preference: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (preference === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return preference;
}

function App() {
  const isMobile = useIsMobile();
  const { settings } = useSettingsStore();
  const theme = useMemo(() => resolveTheme(settings.theme), [settings.theme]);

  useTheme(theme);

  useEffect(() => {
    logger.info(`Layout: ${isMobile ? 'mobile' : 'desktop'}`);
  }, [isMobile]);

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

export default App;
