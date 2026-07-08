import { ShieldCheck, Banknote, CalendarCheck, ArrowDown } from "lucide-react"
import ScrollyFrames from "@/components/ui/scrolly-frames"
import type { Lang } from "@/lib/lang"

interface PaymentSectionProps {
  lang: Lang
}

const features = [
  { icon: ShieldCheck, key: "payment_feature_1" },
  { icon: Banknote, key: "payment_feature_2" },
  { icon: CalendarCheck, key: "payment_feature_3" },
] as const

export default function PaymentSection({ lang }: PaymentSectionProps) {
  return (
    <section id="payment" className="relative">
      <ScrollyFrames
        className="relative h-screen flex items-center"
        innerClassName="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        pinSpacing={1200}
        startOffset={80}
        showProgress={false}
      >
        <div className="flex flex-col items-center justify-center text-center w-full">
          <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.payment_title}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl">
            {lang.payment_title}
          </h2>
          <p className="mt-6 text-sc-muted text-lg max-w-2xl">
            {lang.payment_subtitle}
          </p>
          <p className="mt-4 text-sc-muted/80 text-sm leading-relaxed max-w-2xl">
            {lang.payment_description}
          </p>
          <ArrowDown className="mt-8 w-5 h-5 text-sc-primary animate-bounce" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 w-full">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.key}
                className="group relative flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-sc-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sc-primary/10"
              >
                <div className="w-12 h-12 rounded-xl bg-sc-primary/10 flex items-center justify-center group-hover:bg-sc-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-sc-primary" />
                </div>
                <span className="text-base font-medium text-white">
                  {lang[feature.key as keyof typeof lang] as string}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-sc-primary text-white rounded-full font-medium hover:bg-sc-primary/80 transition-all duration-200 hover:-translate-y-0.5 shadow-2xl shadow-sc-primary/30 text-base"
          >
            {lang.payment_cta}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </ScrollyFrames>
    </section>
  )
}
