"use client"

import { useState } from "react"
import { Zap, Shield, HeadphonesIcon, ArrowRight, Code2, Cpu, Database } from "lucide-react"
import ScrollyFrames from "@/components/ui/scrolly-frames"
import CardModal from "@/components/ui/card-modal"
import type { Lang } from "@/lib/lang"

interface ServicesSectionProps {
  lang: Lang
}

const iconMap = [
  "service-icon-01.webp",
  "service-icon-02.webp",
  "service-icon-03.webp",
  "service-icon-04.webp",
] as const

const skills = [
  { labelKey: "services_skill_1", pct: 84 },
  { labelKey: "services_skill_2", pct: 88 },
  { labelKey: "services_skill_3", pct: 95 },
] as const

const highlights = [
  { icon: Zap, titleKey: "services_highlight_1_title", descKey: "services_highlight_1_desc" },
  { icon: Shield, titleKey: "services_highlight_2_title", descKey: "services_highlight_2_desc" },
  { icon: HeadphonesIcon, titleKey: "services_highlight_3_title", descKey: "services_highlight_3_desc" },
] as const

const techCategories: { icon: typeof Code2; label: string; items: string[] }[] = [
  { icon: Code2, label: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { icon: Cpu, label: "Backend", items: ["Node.js", "PHP", "Java", "REST APIs", "GraphQL"] },
  { icon: Database, label: "Data & Cloud", items: ["PostgreSQL", "MongoDB", "Prisma", "Docker", "AWS"] },
]

export default function ServicesSection({ lang }: ServicesSectionProps) {
  const [openCard, setOpenCard] = useState<number | null>(null)

  return (
    <section id="services" className="relative">
      <ScrollyFrames
        className="relative h-screen flex items-center"
        innerClassName="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        pinSpacing={1600}
        startOffset={80}
        showProgress={true}
      >
        <div className="flex flex-col items-center justify-center w-full text-center">
          <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.services_detail_title}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl">
            {lang.services_detail_title}
          </h2>
          <p className="mt-6 text-sc-muted text-lg max-w-2xl">
            {lang.services_detail_description}
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-4xl">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                onClick={() => setOpenCard(i)}
                className="flex gap-4 p-5 rounded-2xl bg-sc-card/60 backdrop-blur-md border border-white/10 hover:border-sc-primary/30 transition-all duration-300 hover:-translate-y-1 text-left cursor-pointer"
              >
                <div className="shrink-0">
                  <img
                    src={`/assets/images/${iconMap[i - 1]}`}
                    alt=""
                    className="w-[50px] h-[50px]"
                  />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    {lang[`service_${i}_title` as keyof typeof lang] as string}
                  </h4>
                  <p className="text-sm text-sc-muted leading-relaxed line-clamp-2">
                    {lang[`service_${i}_description` as keyof typeof lang] as string}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <img
              loading="lazy"
              src="/assets/images/services-left-image.webp"
              alt="Web development services"
              className="w-full max-w-lg mx-auto"
            />
            <div className="flex flex-col gap-6">
              <span className="inline-block px-3 py-1 w-fit rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
                Skills
              </span>
              {skills.map((skill) => (
                <div key={skill.labelKey}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-white">
                      {lang[skill.labelKey as keyof typeof lang] as string}
                    </h4>
                    <span className="text-xs text-sc-muted">{skill.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sc-primary to-sc-accent"
                      style={{ width: `${skill.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.services_highlight_title}
          </span>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 text-center max-w-2xl">
            {lang.services_highlight_intro}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.titleKey}
                  className="p-6 rounded-2xl bg-sc-card/40 backdrop-blur-md border border-white/10 hover:border-sc-primary/30 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-sc-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-sc-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {lang[item.titleKey as keyof typeof lang] as string}
                  </h4>
                  <p className="text-sm text-sc-muted leading-relaxed">
                    {lang[item.descKey as keyof typeof lang] as string}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="mt-10 w-full max-w-4xl">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 text-center">
              {lang.services_tech_title as string}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {techCategories.map((cat) => {
                const Icon = cat.icon
                return (
                  <div
                    key={cat.label}
                    className="p-5 rounded-2xl bg-sc-card/40 backdrop-blur-md border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5 text-sc-primary" />
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                        {cat.label}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-sc-primary/10 text-sc-muted border border-sc-primary/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <a
            href="#contact"
            className="mt-10 inline-flex items-center gap-2 px-8 py-3 bg-sc-primary text-white rounded-full font-medium hover:bg-sc-primary/80 transition-all hover:-translate-y-0.5 shadow-lg shadow-sc-primary/25"
          >
            {lang.services_highlight_cta}
            <ArrowRight size={16} />
          </a>
        </div>
      </ScrollyFrames>

      {[1, 2, 3, 4].map((i) => (
        <CardModal
          key={i}
          isOpen={openCard === i}
          onClose={() => setOpenCard(null)}
          title={lang[`service_${i}_title` as keyof typeof lang] as string}
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src={`/assets/images/${iconMap[i - 1]}`}
              alt=""
              className="w-[60px] h-[60px]"
            />
            <h4 className="text-xl font-semibold text-white">
              {lang[`service_${i}_title` as keyof typeof lang] as string}
            </h4>
          </div>
          <p className="text-sc-muted leading-relaxed">
            {lang[`service_${i}_description` as keyof typeof lang] as string}
          </p>
        </CardModal>
      ))}
    </section>
  )
}
