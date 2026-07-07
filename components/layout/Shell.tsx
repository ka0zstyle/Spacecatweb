"use client"

import { type ReactNode, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getLang } from "@/lib/lang"
import { LangProvider, GameProvider } from "@/app/providers"
import Header from "./Header"
import Footer from "./Footer"
import MainContent from "./MainContent"
import InitialLoader from "@/components/ui/initial-loader"
import PageLoader from "@/components/ui/page-loader"
import ScrollToTop from "@/components/ui/scroll-to-top"
import ScrollProgress from "@/components/ui/scroll-progress"
import ChatBubble from "@/components/chat/chat-bubble"
import GlobalVideoBackground from "@/components/ui/global-video-background"
import LanguageSplash from "./LanguageSplash"

export default function Shell({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const locale = searchParams?.get("lang") ?? "es"
  const lang = useMemo(() => getLang(locale), [locale])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LangProvider lang={lang} locale={locale}>
      <GameProvider>
        <LanguageSplash />
        <InitialLoader />
        <PageLoader />
        <GlobalVideoBackground />
        <Header lang={lang} currentLocale={locale} />
        <MainContent>{children}</MainContent>
        <Footer lang={lang} />
        <ScrollToTop />
        <ScrollProgress lang={lang} />
        <ChatBubble />
      </GameProvider>
    </LangProvider>
  )
}
