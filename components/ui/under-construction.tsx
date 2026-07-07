import { Wrench } from "lucide-react"
import type { Lang } from "@/lib/lang"

interface UnderConstructionProps {
  lang: Lang
}

export default function UnderConstruction({ lang }: UnderConstructionProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sc-dark via-sc-surface/20 to-sc-dark pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-sc-primary/40" />
          <Wrench className="w-5 h-5 text-sc-primary/60" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-sc-primary/40" />
        </div>
        
        <span className="inline-block px-4 py-1.5 mb-5 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary/70 border border-sc-primary/20 bg-sc-primary/5">
          {lang.under_construction_badge}
        </span>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {lang.under_construction_title}
        </h2>
        
        <p className="text-sc-muted text-lg max-w-xl mx-auto leading-relaxed">
          {lang.under_construction_text}
        </p>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-sc-muted/50">
          <div className="h-px w-12 bg-white/10" />
          <span className="font-mono text-xs tracking-widest uppercase">{lang.under_construction_coming_soon}</span>
          <div className="h-px w-12 bg-white/10" />
        </div>
      </div>
    </section>
  )
}
