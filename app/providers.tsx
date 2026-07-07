"use client"

import { type ReactNode, createContext, useContext, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getLang, languages } from "@/lib/lang"
import type { Lang } from "@/lib/lang"

const LangContext = createContext<Lang | null>(null)
const LocaleContext = createContext<string>("es")

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used within LangProvider")
  return ctx
}

export function useLocale() {
  return useContext(LocaleContext)
}

const GameContext = createContext<{
  gameActive: boolean
  setGameActive: (v: boolean) => void
}>({ gameActive: false, setGameActive: () => {} })

export function useGame() {
  return useContext(GameContext)
}

export function Providers({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const locale = searchParams?.get("lang") ?? "es"
  const lang = useMemo(() => getLang(locale), [locale])

  return (
    <LangContext.Provider value={lang}>
      <LocaleContext.Provider value={locale}>
        {children}
      </LocaleContext.Provider>
    </LangContext.Provider>
  )
}

export function LangProvider({ lang, locale, children }: { lang: Lang; locale: string; children: ReactNode }) {
  return (
    <LangContext.Provider value={lang}>
      <LocaleContext.Provider value={locale}>
        {children}
      </LocaleContext.Provider>
    </LangContext.Provider>
  )
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameActive, setGameActive] = useState(false)
  return (
    <GameContext.Provider value={{ gameActive, setGameActive }}>
      {children}
    </GameContext.Provider>
  )
}
