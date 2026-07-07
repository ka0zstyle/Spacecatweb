"use client"

import { useState, useEffect } from "react"
import { Menu, X, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Lang } from "@/lib/lang"
import { useGame } from "@/app/providers"

interface HeaderProps {
  lang: Lang
  currentLocale: string
}

const navItems = ["home", "about", "services", "portfolio", "pricing", "blog", "laguaira", "contact"] as const

export default function Header({ lang, currentLocale }: HeaderProps) {
  const { gameActive, setGameActive } = useGame()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let rafId = 0
    const updateActiveSection = () => {
      const sections = ["home", "about", "services", "portfolio", "pricing", "blog", "contact"]
      const probeY = window.scrollY + 150
      let active = sections[0]
      for (const id of sections) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (probeY >= top) active = id
      }
      setActiveSection(prev => prev !== active ? active : prev)
    }
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateActiveSection)
    }
    updateActiveSection()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    if (typeof window !== "undefined" && window.location.pathname === "/blog") {
      const params = new URLSearchParams(window.location.search)
      const lang = params.get("lang") || "es"
      window.location.href = `/?lang=${lang}#${id}`
      return
    }
    const el = document.getElementById(id)
    if (el) {
      const rect = el.getBoundingClientRect()
      const targetY = window.scrollY + rect.top - 80
      window.scrollTo({ top: targetY, behavior: "smooth" })
    }
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          mobileOpen ? "-translate-y-full" : "translate-y-0",
          scrolled
            ? "bg-sc-dark/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button onClick={() => scrollTo("home")} className="flex items-center shrink-0">
              <img
                src="/assets/images/SpaceCatWeb.webp"
                alt="SpaceCatWeb"
                className={cn("h-8 w-auto lg:h-10 transition-opacity duration-300", !scrolled && "opacity-0")}
              />
            </button>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item === "home" ? "home" : item)}
                  className={cn(
                    "relative px-4 py-3 min-h-11 text-sm font-medium rounded-lg transition-colors duration-200",
                    activeSection === item
                      ? "text-sc-primary"
                      : "text-sc-muted hover:text-white"
                  )}
                >
                  {lang[`nav_${item}` as keyof typeof lang] as string}
                  {activeSection === item && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-sc-primary rounded-full" />
                  )}
                </button>
              ))}
              <div className="ml-4 flex items-center gap-2 pl-4 border-l border-white/10">
                <a
                  href="/?lang=en"
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded min-h-[44px] flex items-center gap-1.5 transition-colors",
                    currentLocale === "en"
                      ? "text-sc-primary bg-sc-primary/10"
                      : "text-sc-muted hover:text-white"
                  )}
                >
                  <img src="/assets/images/flag-us.webp" alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                  <span>EN</span>
                </a>
                <a
                  href="/"
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded min-h-[44px] flex items-center gap-1.5 transition-colors",
                    currentLocale === "es"
                      ? "text-sc-primary bg-sc-primary/10"
                      : "text-sc-muted hover:text-white"
                  )}
                >
                  <img src="/assets/images/flag-es.webp" alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                  <span>ES</span>
                </a>
              </div>
            </nav>

            <button
              onClick={() => gameActive ? setGameActive(false) : setMobileOpen(!mobileOpen)}
              className={cn(
                "lg:hidden p-2 transition-colors",
                gameActive ? "text-red-400 hover:text-red-300" : "text-sc-muted hover:text-white"
              )}
              aria-label={gameActive ? "Stop game" : "Toggle menu"}
            >
              {gameActive ? <Square size={22} /> : mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "lg:hidden fixed top-0 right-0 z-50 h-full w-72 bg-sc-dark/95 border-l border-white/5 shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <img
              src="/assets/images/SpaceCatWeb.webp"
              alt="SpaceCatWeb"
              className="h-6 w-auto"
            />
          <button onClick={() => setMobileOpen(false)} className="p-2 text-sc-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-1">
          {navItems.map((item, i) => (
            <button
              key={item}
              onClick={() => scrollTo(item === "home" ? "home" : item)}
              className={cn(
                "w-full text-left px-4 py-3 min-h-11 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center",
                activeSection === item
                  ? "text-sc-primary bg-sc-primary/10"
                  : "text-sc-muted hover:text-white hover:bg-white/5"
              )}
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {lang[`nav_${item}` as keyof typeof lang] as string}
            </button>
          ))}
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2 px-4">
            <a
              href="/?lang=en"
              className={cn(
                "flex-1 text-sm font-medium px-3 py-3 min-h-11 rounded-lg transition-colors flex items-center justify-center gap-2",
                currentLocale === "en"
                  ? "text-sc-primary bg-sc-primary/10"
                  : "text-sc-muted bg-white/5 hover:text-white"
              )}
            >
              <img src="/assets/images/flag-us.webp" alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
              <span>EN</span>
            </a>
            <a
              href="/"
              className={cn(
                "flex-1 text-sm font-medium px-3 py-3 min-h-11 rounded-lg transition-colors flex items-center justify-center gap-2",
                currentLocale === "es"
                  ? "text-sc-primary bg-sc-primary/10"
                  : "text-sc-muted bg-white/5 hover:text-white"
              )}
            >
              <img src="/assets/images/flag-es.webp" alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
              <span>ES</span>
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
