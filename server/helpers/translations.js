

export const translations = (lang, key) => {
    if (!lang) {
        lang = 'en';
    }

    if (!key) {
        key = 'TRANSLATION_KEY_NOT_PROVIDED';
    }

    const translationPath = `../i18n/translations.${lang}`;
    const translations = require(translationPath);
    return translations[key];
}