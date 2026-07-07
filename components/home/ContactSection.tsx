"use client"

import { Phone, Send, MessageCircle, MapPin } from "lucide-react"
import ScrollyFrames from "@/components/ui/scrolly-frames"
import type { Lang } from "@/lib/lang"
import { useState } from "react"

interface ContactSectionProps {
  lang: Lang
}

const countries = [
  "US", "UK", "CA", "AU", "DE", "FR", "IT", "BR", "ES",
  "MX", "AR", "CO", "CL", "PE", "VE", "EC", "UY", "PA", "CR", "OTHER",
] as const

export default function ContactSection({ lang }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    whatsapp: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setStatus("success")
        setFormData({ name: "", email: "", country: "", whatsapp: "", message: "" })
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <section id="contact" className="relative">
      <ScrollyFrames
        className="relative min-h-screen flex items-center"
        innerClassName="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        pinSpacing={1400}
        startOffset={80}
        showProgress={false}
      >
        <div className="flex flex-col items-center justify-center w-full text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            <MessageCircle size={12} />
            {lang.nav_contact}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl">
            {lang.contact_title}
          </h2>
          <p className="mt-6 text-sc-muted text-lg max-w-2xl">
            {lang.contact_description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <Phone className="w-5 h-5 text-sc-primary" />
              <a
                href={`tel:${lang.contact_phone}`}
                className="text-sm text-white hover:text-sc-primary transition-colors font-medium"
              >
                {lang.contact_phone}
              </a>
            </div>
            <a
              href={`https://wa.me/${lang.contact_phone.replace(/[\s\-\(\)\+]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-green-400/30 transition-colors"
            >
              <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-sm text-white font-medium">WhatsApp</span>
            </a>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <MapPin className="w-5 h-5 text-sc-accent" />
              <span className="text-sm text-white font-medium">Global / Remoto</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-center w-full"
        >
          <div className="w-full max-w-2xl p-8 rounded-2xl bg-sc-card/60 backdrop-blur-md border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Cuéntanos sobre tu proyecto
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="sr-only">{lang.form_name}</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={lang.form_name}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-sc-muted/50 focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="sr-only">{lang.form_email}</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={lang.form_email}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-sc-muted/50 focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-country" className="sr-only">{lang.country_select}</label>
                  <select
                    id="contact-country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20"
                  >
                    <option value="" disabled className="bg-sc-dark">
                      {lang.country_select}
                    </option>
                    {countries.map((c) => (
                      <option key={c} value={c} className="bg-sc-dark">
                        {lang[`country_${c.toLowerCase()}` as keyof typeof lang] as string}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-whatsapp" className="sr-only">{lang.form_whatsapp}</label>
                  <input
                    id="contact-whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder={lang.form_whatsapp}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-sc-muted/50 focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="sr-only">{lang.form_message}</label>
                <textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={lang.form_message}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-sc-muted/50 focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20 resize-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-6 w-full py-3 bg-sc-primary text-white rounded-xl font-medium hover:bg-sc-primary/80 transition-colors duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sc-primary/25"
            >
              {status === "sending" ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {lang.form_submit}
                  <Send size={16} />
                </>
              )}
            </button>
            {status === "success" && (
              <p className="mt-4 text-sm text-green-400 text-center animate-fade-in">
                Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className="mt-4 text-sm text-red-400 text-center animate-fade-in">
                {lang.contact_error}
              </p>
            )}
          </div>
        </form>
      </ScrollyFrames>
    </section>
  )
}
