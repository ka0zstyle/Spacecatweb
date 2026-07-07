"use client"

import { Heart } from "lucide-react"
import type { Lang } from "@/lib/lang"

interface GratitudeSectionProps {
  lang: Lang
}

export default function GratitudeSection({ lang }: GratitudeSectionProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sc-dark via-sc-surface/20 to-sc-dark pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Heart className="w-10 h-10 text-sc-primary/60 fill-sc-primary/30 mx-auto mb-6" />
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-5">
          {lang.laguaira_gratitude_title}
        </h3>
        <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto">
          {lang.laguaira_gratitude_text}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-white/30">
          <div className="h-px w-12 bg-white/10" />
          <span className="font-mono text-xs tracking-widest uppercase">{lang.laguaira_memorial}</span>
          <div className="h-px w-12 bg-white/10" />
        </div>
      </div>
    </section>
  )
}
