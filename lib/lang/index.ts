import { en } from "./en"
import { es } from "./es"

export type Lang = typeof en

export const languages: Record<string, Lang> = { en, es }

export function getLang(locale: string): Lang {
  return languages[locale] ?? languages.es
}
