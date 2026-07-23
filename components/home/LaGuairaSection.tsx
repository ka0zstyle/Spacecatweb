"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Heart, X, ChevronLeft, ChevronRight, Flame } from "lucide-react"
import type { Lang } from "@/lib/lang"
import { useScrollPosition } from "@/hooks/useScrollPosition"

interface LaGuairaSectionProps {
  lang: Lang
}

const images = [
  { src: "/assets/laguaira/1.JPG", alt: "La Guaira - Terremoto 2026", stat: "3,535", statKey: "laguaira_muertos" as const },
  { src: "/assets/laguaira/2.jpg", alt: "La Guaira - Rescate", stat: "16,740", statKey: "laguaira_heridos" as const },
  { src: "/assets/laguaira/3.webp", alt: "La Guaira - Solidaridad", stat: "17,854", statKey: "laguaira_desplazados" as const },
]

function useParallax(ref: React.RefObject<HTMLElement | null>, speed: number = 0.3) {
  useScrollPosition<number>((s) => {
    const el = ref.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const vh = s.vh || window.innerHeight
    const progress = (vh - rect.top) / (vh + rect.height)
    const offset = (progress - 0.5) * speed * 100
    el.style.setProperty("--parallax-y", `${offset}px`)
    return offset
  })
}

export default function LaGuairaSection({ lang }: LaGuairaSectionProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const prayRef = useRef<HTMLDivElement>(null)

  useParallax(heroRef, 0.4)
  useParallax(galleryRef, 0.2)
  useParallax(prayRef, 0.3)

  const openLightbox = (index: number) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox((i) => i !== null ? (i === 0 ? images.length - 1 : i - 1) : null)
  const lbNext = () => setLightbox((i) => i !== null ? (i === images.length - 1 ? 0 : i + 1) : null)

  return (
    <section id="laguaira" className="relative">
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Frame 1: Title/Tribute */}
        <div
          ref={heroRef}
          className="flex flex-col items-center justify-center w-full text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 rounded-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-sc-primary/60" />
              <Heart className="w-5 h-5 text-sc-primary/80 fill-sc-primary/40" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-sc-primary/60" />
            </div>
            <span className="inline-block px-4 py-1.5 mb-5 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary/80 border border-sc-primary/20 bg-sc-primary/5">
              {lang.laguaira_date}
            </span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
              {lang.laguaira_title} <span className="text-sc-primary">—</span>{" "}
              <span className="text-yellow-400">Ven</span>
              <span className="text-blue-400">ezu</span>
              <span className="text-red-500">ela</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto leading-relaxed">
              {lang.laguaira_subtitle}
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/40">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-sc-primary">{lang.laguaira_magnitude}</span>
                <span className="text-xs uppercase tracking-wider">Magnitud</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-sc-primary">2</span>
                <span className="text-xs uppercase tracking-wider">Sismos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frame 2: Gallery */}
        <div ref={galleryRef} className="flex flex-col items-center justify-center w-full mt-16">
          <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.laguaira_gallery}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {lang.laguaira_gallery_title}
          </h3>
          <p className="text-sm text-white/50 mb-8 max-w-lg text-center">
            {lang.laguaira_gallery_subtitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-5xl">
            {images.map((img, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <button
                  onClick={() => openLightbox(idx)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 hover:border-sc-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-sc-primary/10"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-sm text-white font-medium">{img.alt}</p>
                  </div>
                </button>
                <div className="bg-sc-card/40 backdrop-blur-sm rounded-xl border border-white/10 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50 flex items-center gap-1">
                      {img.statKey === "laguaira_muertos" && <Heart className="w-3 h-3 text-red-400 fill-red-400" />}
                      {img.statKey === "laguaira_heridos" && <Flame className="w-3 h-3 text-orange-400" />}
                      {img.statKey === "laguaira_desplazados" && <span className="text-sc-primary text-xs">▲</span>}
                      {lang[img.statKey]}
                    </span>
                    <span className="text-sc-primary font-bold text-sm">{img.stat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frame 3: Pray + Fact + Condolence (merged) */}
        <div ref={prayRef} className="flex flex-col items-center justify-center w-full mt-16">
          <div className="relative max-w-5xl w-full p-5 sm:p-6 rounded-3xl bg-sc-card/30 backdrop-blur-md border border-white/10">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-sc-primary/20 via-transparent to-sc-accent/10 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-sc-primary/10 flex-shrink-0">
                <Image
                  src="/assets/laguaira/pray.png"
                  alt="La Guaira - Oración"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
                  {lang.laguaira_date}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">
                  {lang.laguaira_pray_title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-white/60 leading-snug text-center sm:text-left max-w-lg">
                  {lang.laguaira_pray_text}
                </p>
                <div className="relative max-w-lg p-2 rounded-xl bg-sc-card/30 backdrop-blur-md border border-white/10">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-sc-primary/20 via-transparent to-sc-accent/10 pointer-events-none" />
                  <p className="relative z-10 text-[9px] sm:text-[10px] text-white/70 leading-snug italic text-center sm:text-left">
                    &ldquo;{lang.laguaira_pray_quote}&rdquo;
                  </p>
                </div>
                <p className="text-[9px] text-white/40 font-mono tracking-wide text-center sm:text-left">
                  {lang.laguaira_pray_context}
                </p>
              </div>
            </div>
          </div>
          <div className="relative max-w-xl mt-4 p-4 rounded-2xl bg-gradient-to-br from-sc-primary/10 via-sc-card/40 to-sc-accent/5 backdrop-blur-md border border-sc-primary/20">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-sc-primary/20 via-transparent to-sc-accent/10 pointer-events-none" />
            <div className="relative z-10 text-center">
              <Heart className="w-6 h-6 text-sc-primary/80 fill-sc-primary/40 mx-auto mb-2" />
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                {lang.laguaira_condolence_title}
              </h3>
              <p className="text-xs sm:text-sm text-white/60 leading-snug mb-3 max-w-lg mx-auto">
                {lang.laguaira_condolence_text}
              </p>
              <p className="text-xs font-semibold text-sc-primary tracking-wide">
                {lang.laguaira_condolence_author}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
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

          <div
            className="relative w-[90vw] h-[70vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightbox].src}
              alt={images[lightbox].alt}
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-6 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox(i) }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === lightbox ? "bg-white w-6" : "bg-white/40"}`}
              />
            ))}
          </div>

          <button
            onClick={closeLightbox}
            className="absolute bottom-14 px-6 py-2.5 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors z-20"
          >
            Cerrar
          </button>
        </div>
      )}
    </section>
  )
}
