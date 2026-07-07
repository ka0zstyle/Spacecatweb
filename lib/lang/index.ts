import type { en } from "./en"

export type Lang = typeof en

const enModule = require("./en").en as Lang
const esModule = require("./es").es as Lang

export const languages: Record<string, Lang> = {
  en: enModule,
  es: esModule,
}

export function getLang(locale: string): Lang {
  return languages[locale] || languages["es"]
}
