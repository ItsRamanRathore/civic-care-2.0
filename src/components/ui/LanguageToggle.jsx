import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import Icon from '../AppIcon';

const LanguageToggle = () => {
  const { language, switchLanguage, t } = useTranslation();

  const handleLanguageSwitch = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    switchLanguage(newLanguage);
  };

  return (
    <button
      onClick={handleLanguageSwitch}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
      title={language === 'en' ? t('switchToHindi') : t('switchToEnglish')}
    >
      <Icon name="Globe" size={16} className="mr-2" />
      <span className="hidden sm:inline">
        {language === 'en' ? t('hindi') : t('english')}
      </span>
      <span className="sm:hidden">
        {language === 'en' ? 'हिं' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;