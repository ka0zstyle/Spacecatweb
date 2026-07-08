"use client"

import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowRight, ExternalLink, ChevronLeft, ChevronRight, X, ShoppingCart, Building2, Factory } from "lucide-react"
import ScrollyFrames from "@/components/ui/scrolly-frames"
import { projects, getLocaleProject } from "@/lib/portfolio-data"
import type { Lang } from "@/lib/lang"

interface PortfolioSectionProps {
  lang: Lang
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  meepleland: ShoppingCart,
  nanosoluciones: Building2,
  galpoven: Factory,
}

export default function PortfolioSection({ lang }: PortfolioSectionProps) {
  const searchParams = useSearchParams()
  const locale = (searchParams.get("lang") || "es") as "es" | "en"
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  const localizedProjects = projects.map((p) => getLocaleProject(p, locale))
  const project = localizedProjects[current]
  const Icon = iconMap[project.slug] || Building2

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? localizedProjects.length - 1 : c - 1)), [localizedProjects.length])
  const next = useCallback(() => setCurrent((c) => (c === localizedProjects.length - 1 ? 0 : c + 1)), [localizedProjects.length])

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index })
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox((lb) => lb ? { ...lb, index: lb.index === 0 ? lb.images.length - 1 : lb.index - 1 } : null)
  const lbNext = () => setLightbox((lb) => lb ? { ...lb, index: lb.index === lb.images.length - 1 ? 0 : lb.index + 1 } : null)

  return (
    <section id="portfolio" className="relative">
      <ScrollyFrames
        className="relative min-h-screen flex items-center"
        innerClassName="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        pinSpacing={1200}
        startOffset={80}
        showProgress={true}
      >
        <div className="flex flex-col items-center justify-center w-full text-center">
          <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.nav_portfolio}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl">
            {lang.portfolio_title}
          </h2>
          <p className="mt-6 text-sc-muted text-lg max-w-2xl">
            {lang.portfolio_description}
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="w-full max-w-5xl">
            <div className="relative rounded-2xl bg-sc-card/40 backdrop-blur-md border border-white/10 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-[420px] shrink-0 bg-gradient-to-br from-sc-primary/10 to-sc-accent/5 p-4">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/20">
                    {project.images[0] ? (
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        className="object-cover"
                        onClick={() => openLightbox(project.images, 0)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-16 h-16 text-sc-primary/30" />
                      </div>
                    )}
                  </div>
                  {project.images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {project.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => openLightbox(project.images, i)}
                          className="relative w-16 h-12 shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-sc-primary transition-colors"
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 lg:p-8 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-sc-primary/10 text-sc-primary text-xs font-medium">
                      {project.category}
                    </span>
                    {project.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-sm text-sc-muted leading-relaxed mb-5">
                    {project.description}
                  </p>
                  <ul className="space-y-1.5 mb-6 flex-1">
                    {project.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-sc-muted">
                        <span className="text-sc-primary mt-0.5 shrink-0">&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-sc-primary text-white rounded-full font-medium hover:bg-sc-primary/80 transition-all text-sm"
                    >
                      {locale === "en" ? "Visit Site" : "Visitar Sitio"}
                      <ExternalLink size={13} />
                    </a>
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all text-sm"
                    >
                      {lang.portfolio_contact}
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full bg-sc-card/60 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-sc-primary/50 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {localizedProjects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-sc-primary w-7" : "bg-white/20 hover:bg-white/40"}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-sc-card/60 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-sc-primary/50 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-2xl">
            {lang.portfolio_heading}
          </h3>
          <p className="text-sc-muted text-lg max-w-xl mb-8">
            {lang.portfolio_heading_desc}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-sc-primary text-white rounded-full font-medium hover:bg-sc-primary/80 transition-all hover:-translate-y-0.5 shadow-2xl shadow-sc-primary/30 text-base"
          >
            {lang.payment_cta}
            <ArrowRight size={16} />
          </a>
        </div>
      </ScrollyFrames>

      {lightbox && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={closeLightbox}
              className="w-12 h-12 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {lightbox.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lbPrev() }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition-colors z-20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lbNext() }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition-colors z-20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            className="relative w-[90vw] h-[70vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.index]}
              alt=""
              fill
              className="object-contain"
            />
          </div>

          {lightbox.images.length > 1 && (
            <div className="absolute bottom-14 flex gap-2">
              {lightbox.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: i } : null) }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === lightbox.index ? "bg-white w-6" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}

          <button
            onClick={closeLightbox}
            className="absolute bottom-6 px-6 py-2.5 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors z-20"
          >
            Cerrar
          </button>
        </div>
      )}
    </section>
  )
}
