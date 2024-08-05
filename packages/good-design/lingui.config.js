/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "es-419"],
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
