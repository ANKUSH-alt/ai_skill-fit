import { create } from 'zustand';

const STORAGE_KEY = 'skillfit_lang';

const useLanguageStore = create((set, get) => ({
  language: null,
  
  initLanguage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ language: stored });
      }
    } catch (error) {
      console.warn('Could not access localStorage:', error);
    }
  },
  
  setLanguage: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      sessionStorage.setItem(STORAGE_KEY, lang);
      set({ language: lang });
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
      set({ language: lang });
    }
  },
  
  getLanguage: () => {
    try {
      return get().language || localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return get().language;
    }
  }
}));

export default useLanguageStore;
