import { messages as enMessages } from "./en/messages";
import { messages as esMessages } from "./es/messages";
import { messages as es419Messages } from "./es-419/messages";
import { messages as frMessages } from "./fr/messages";
import { messages as hiMessages } from "./hi/messages";
import { messages as idMessages } from "./id/messages";
import { messages as itMessages } from "./it/messages";
import { messages as koMessages } from "./ko/messages";
import { messages as ptMessages } from "./pt/messages";
import { messages as trMessages } from "./tr/messages";
import { messages as ukMessages } from "./uk/messages";
import { messages as viMessages } from "./vi/messages";
import { messages as zhMessages } from "./zh/messages";

export const defaultMessages = {
  en: enMessages,
  es: esMessages,
  "es-419": es419Messages,
  fr: frMessages,
  hi: hiMessages,
  id: idMessages,
  it: itMessages,
  ko: koMessages,
  pt: ptMessages,
  tr: trMessages,
  uk: ukMessages,
  vi: viMessages,
  zh: zhMessages
};

export const localeCodes = ["en", "es", "es-419", "fr", "hi", "id", "it", "ko", "pt", "tr", "uk", "vi", "zh"];
