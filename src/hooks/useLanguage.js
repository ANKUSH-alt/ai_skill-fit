import { useEffect, useState } from 'react';
import useLanguageStore from '../store/languageStore';
import knTranslations from '../i18n/kn.json';
import hiTranslations from '../i18n/hi.json';
import enTranslations from '../i18n/en.json';

const translations = {
  kannada: knTranslations,
  hindi: hiTranslations,
  english: enTranslations
};

export const useLanguage = () => {
  const { language, initLanguage } = useLanguageStore();
  const [currentLang, setCurrentLang] = useState(language);

  useEffect(() => {
    if (!language) {
      initLanguage();
    }
    setCurrentLang(language || useLanguageStore.getState().getLanguage());
  }, [language, initLanguage]);

  const t = (key) => {
    const lang = currentLang || 'kannada';
    const langData = translations[lang] || translations.kannada;
    const value = langData?.[key];
    
    // Return the value if it exists, otherwise return empty array for array keys or the key itself
    if (value !== undefined && value !== null) {
      return value;
    }
    
    // Return empty array for known array keys
    if (key === 'districts' || key === 'education_options') {
      return [];
    }
    
    return key;
  };

  return { t, language: currentLang };
};

export default useLanguage;
