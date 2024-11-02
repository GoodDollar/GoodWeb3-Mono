/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "es", "es-419", "fr", "hi", "id", "it", "ko", "pt", "tr", "uk", "vi", "zh"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"]
    }
  ],
  format: "po",
  runtimeConfigModule: ["<rootDir>/src/theme/i18nCustom", "customI18n"]
};
