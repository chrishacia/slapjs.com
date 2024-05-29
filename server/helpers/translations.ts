import { Translations } from '../types/trasnlations.types';

const translationsMap: { [key: string]: () => Promise<Translations> } = {
    en: () => import('../i18n/translations.en').then(module => module.en),
    es: () => import('../i18n/translations.es').then(module => module.es),
    // Add more languages as needed
};

export const translations = async (lang: string, key: string): Promise<string> => {
    if (!lang) {
        lang = 'en';
    }

    if (!key) {
        key = 'TRANSLATION_KEY_NOT_PROVIDED';
    }

    const loadTranslations = translationsMap[lang] || translationsMap['en'];
    const translationData = await loadTranslations();

    return translationData[key] || key;
};
