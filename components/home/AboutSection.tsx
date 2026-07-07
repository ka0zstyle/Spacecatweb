import { Code2, Globe, BarChart3, Users, Sparkles, Target, Cat } from "lucide-react"
import ScrollyFrames from "@/components/ui/scrolly-frames"
import type { Lang } from "@/lib/lang"

interface AboutSectionProps {
  lang: Lang
}

const stats = [
  { icon: Code2, value: "50+", labelKey: "about_stat_1_label" as const },
  { icon: Globe, value: "30+", labelKey: "about_stat_2_label" as const },
  { icon: BarChart3, value: "95%", labelKey: "about_stat_3_label" as const },
  { icon: Users, value: "40+", labelKey: "about_stat_4_label" as const },
]

const values = [
  { icon: Sparkles, titleKey: "about_values_1_title" as const, descKey: "about_values_1_desc" as const },
  { icon: Target, titleKey: "about_values_2_title" as const, descKey: "about_values_2_desc" as const },
]

export default function AboutSection({ lang }: AboutSectionProps) {
  return (
    <section id="about" className="relative">
      <ScrollyFrames
        className="relative min-h-screen flex items-center"
        innerClassName="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        pinSpacing={1800}
        startOffset={80}
        showProgress={true}
      >
        <div className="flex flex-col items-center justify-center w-full text-center">
          <span className="inline-block px-3 py-1 mb-2 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.about_subtitle}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance max-w-2xl">
            {lang.about_title}
          </h2>
          <div className="mt-6 relative w-full max-w-[200px] mx-auto">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 blur-xl opacity-50" />
            <img
              loading="lazy"
              src="/assets/images/about-left-image.webp"
              alt="person graphic"
              className="relative w-full drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <p className="text-sc-muted leading-relaxed text-sm lg:text-base body-text text-center max-w-2xl">
            {lang.about_description}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.about_stats_badge}
          </span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-3xl">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.labelKey}
                  className="p-4 rounded-2xl bg-sc-card/50 backdrop-blur-md border border-white/10 text-center group hover:border-sc-primary/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-6 h-6 text-sc-primary mx-auto mb-2" />
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-sc-muted mt-1 uppercase tracking-wider">
                    {lang[stat.labelKey as keyof typeof lang] as string}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-sc-card/40 backdrop-blur-md border border-white/10 max-w-2xl">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 flex items-center justify-center">
              <Cat className="w-7 h-7 text-sc-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{lang.about_cats_title}</h3>
              <p className="text-sm text-sc-muted leading-relaxed">{lang.about_cats_text}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.about_values_title}
          </span>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center max-w-2xl">
            {lang.about_values_heading}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div
                  key={v.titleKey}
                  className="flex gap-3 p-4 rounded-2xl bg-sc-card/40 backdrop-blur-md border border-white/10"
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-sc-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-sc-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">{lang[v.titleKey]}</h4>
                    <p className="text-sm text-sc-muted leading-relaxed">{lang[v.descKey]}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <a
            href="#contact"
            className="mt-8 inline-flex px-8 py-3 bg-sc-primary text-white rounded-full font-medium hover:bg-sc-primary/80 transition-all hover:-translate-y-0.5 shadow-lg shadow-sc-primary/25"
          >
            {lang.payment_cta}
          </a>
        </div>
      </ScrollyFrames>
    </section>
  )
}
