import { useEffect } from 'react';
import { Theme } from '@core/models/settings';

export const useTheme = (theme: Theme): void => {
  useEffect(() => {
    const className = theme === 'dark' ? 'theme-dark' : theme === 'light' ? 'theme-light' : '';
    document.body.classList.remove('theme-dark', 'theme-light');
    if (className) {
      document.body.classList.add(className);
    }
  }, [theme]);
};
