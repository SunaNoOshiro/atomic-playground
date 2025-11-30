export const safeLocalStorage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStorage get failed', error);
      return null;
    }
  },
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('LocalStorage set failed', error);
    }
  }
};
