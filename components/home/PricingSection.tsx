"use client"

import { useState } from "react"
import { Check, HelpCircle, X, Star } from "lucide-react"
import ScrollyFrames from "@/components/ui/scrolly-frames"
import CardModal from "@/components/ui/card-modal"
import type { Lang } from "@/lib/lang"

interface PricingSectionProps {
  lang: Lang
}

export default function PricingSection({ lang }: PricingSectionProps) {
  const [showConditions, setShowConditions] = useState(false)
  const [openPlan, setOpenPlan] = useState<number | null>(null)

  const plans = [
    {
      nameKey: "pricing_plan_1_name",
      priceKey: "pricing_plan_1_price",
      periodKey: "pricing_plan_1_period",
      features: Array.from({ length: 13 }, (_, i) => `pricing_plan_1_feature_${i + 1}` as const),
      featured: false,
    },
    {
      nameKey: "pricing_plan_2_name",
      priceKey: "pricing_plan_2_price",
      periodKey: "pricing_plan_2_period",
      badgeKey: "pricing_plan_2_badge",
      features: Array.from({ length: 16 }, (_, i) => `pricing_plan_2_feature_${i + 1}` as const),
      featured: true,
    },
    {
      nameKey: "pricing_plan_3_name",
      priceKey: "pricing_plan_3_price",
      periodKey: "pricing_plan_3_period",
      features: Array.from({ length: 21 }, (_, i) => `pricing_plan_3_feature_${i + 1}` as const),
      featured: false,
    },
  ] as const

  return (
    <section id="pricing" className="relative">
      <ScrollyFrames
        className="relative h-screen flex items-center"
        innerClassName="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        pinSpacing={1200}
        startOffset={80}
        showProgress={true}
      >
        <div className="flex flex-col items-center justify-center w-full text-center">
          <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            {lang.nav_pricing}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl">
            {lang.pricing_title}
          </h2>
          <p className="mt-6 text-sc-muted text-lg max-w-2xl">
            {lang.pricing_subtitle}
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {plans.map((plan, idx) => (
              <button
                key={plan.nameKey}
                onClick={() => setOpenPlan(idx)}
                className={`relative rounded-2xl p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 text-left cursor-pointer ${
                  plan.featured
                    ? "bg-sc-card/70 border-2 border-sc-primary/50 shadow-2xl shadow-sc-primary/20 scale-[1.02]"
                    : "bg-sc-card/40 border border-white/10 hover:border-white/20"
                }`}
              >
                {plan.featured && "badgeKey" in plan && plan.badgeKey && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 bg-sc-primary text-white text-xs font-medium rounded-full">
                    <Star size={12} className="fill-white" />
                    {lang[plan.badgeKey as keyof typeof lang] as string}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {lang[plan.nameKey as keyof typeof lang] as string}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm text-sc-muted">
                    {lang[plan.periodKey as keyof typeof lang] as string}
                  </span>
                  <span className="text-4xl font-black text-white">
                    {lang[plan.priceKey as keyof typeof lang] as string}
                  </span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.slice(0, 6).map((featKey) => (
                    <li key={featKey} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-sc-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-sc-muted">
                        {lang[featKey as keyof typeof lang] as string}
                      </span>
                    </li>
                  ))}
                  {plan.features.length > 6 && (
                    <li className="text-xs text-sc-primary/80 italic pl-6">
                      {lang.pricing_more_features.replace("{count}", String(plan.features.length - 6))}
                    </li>
                  )}
                </ul>
                <span className={`block w-full py-3 rounded-xl text-center font-medium transition-colors duration-200 ${
                  plan.featured
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary/25"
                    : "bg-white/5 text-white border border-white/10"
                }`}>
                  {lang.pricing_all_features}
                </span>
              </button>
            ))}
          </div>
        </div>

        {plans.map((plan, idx) => (
          <CardModal
            key={plan.nameKey}
            isOpen={openPlan === idx}
            onClose={() => setOpenPlan(null)}
            title={lang[plan.nameKey as keyof typeof lang] as string}
          >
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-sc-muted">
                  {lang[plan.periodKey as keyof typeof lang] as string}
                </span>
                <span className="text-3xl font-black text-white">
                  {lang[plan.priceKey as keyof typeof lang] as string}
                </span>
              </div>
            </div>
            <ul className="space-y-2.5">
              {plan.features.map((featKey) => (
                <li key={featKey} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sc-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-sc-muted">
                    {lang[featKey as keyof typeof lang] as string}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={() => setOpenPlan(null)}
              className={`block w-full py-3 mt-6 rounded-xl text-center font-medium transition-colors duration-200 ${
                plan.featured
                  ? "bg-sc-primary text-white hover:bg-sc-primary/80 shadow-lg shadow-sc-primary/25"
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {lang.pricing_button}
            </a>
          </CardModal>
        ))}

        <div className="flex flex-col items-center justify-center w-full text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-2xl">
            {lang.pricing_ideal_heading}
          </h3>
          <p className="text-sc-muted text-lg max-w-xl mb-8">
            {lang.pricing_ideal_desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="#contact"
              className="px-8 py-3 bg-sc-primary text-white rounded-full font-medium hover:bg-sc-primary/80 transition-all hover:-translate-y-0.5 shadow-lg shadow-sc-primary/25"
            >
              {lang.pricing_button}
            </a>
            <button
              onClick={() => setShowConditions(!showConditions)}
              className="inline-flex items-center gap-2 text-sm text-sc-muted hover:text-sc-primary transition-colors"
            >
              <HelpCircle size={14} />
              {lang.pricing_conditions}
            </button>
          </div>

          {showConditions && (
            <div className="mt-6 relative w-full max-w-md bg-sc-card/80 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl animate-fade-in">
              <button
                onClick={() => setShowConditions(false)}
                className="absolute top-3 right-3 text-sc-muted hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              <p className="text-sm text-sc-muted leading-relaxed text-left">
                {lang.pricing_conditions_text}
              </p>
            </div>
          )}
        </div>
      </ScrollyFrames>
    </section>
  )
}
