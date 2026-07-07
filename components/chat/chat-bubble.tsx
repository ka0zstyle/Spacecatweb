"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLang } from "@/app/providers"
import { useGame } from "@/app/providers"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brasil" },
  { value: "ca", label: "Canadá" },
  { value: "cl", label: "Chile" },
  { value: "co", label: "Colombia" },
  { value: "cr", label: "Costa Rica" },
  { value: "ec", label: "Ecuador" },
  { value: "es", label: "España" },
  { value: "us", label: "Estados Unidos" },
  { value: "fr", label: "Francia" },
  { value: "de", label: "Alemania" },
  { value: "it", label: "Italia" },
  { value: "mx", label: "México" },
  { value: "pa", label: "Panamá" },
  { value: "pe", label: "Perú" },
  { value: "uk", label: "Reino Unido" },
  { value: "uy", label: "Uruguay" },
  { value: "ve", label: "Venezuela" },
  { value: "other", label: "Otro" },
]

export default function ChatBubble() {
  const lang = useLang()
  const { gameActive } = useGame()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [country, setCountry] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      const audio = new Audio("/assets/sounds/notify.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {})
    }
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    setSending(true)
    setError(false)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), country, message: message.trim() }),
      })
      if (!res.ok) throw new Error("Failed")
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false); setName(""); setEmail(""); setPhone(""); setCountry(""); setMessage("") }, 2000)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={cn("fixed bottom-6 left-6 z-50", gameActive && "hidden")} ref={panelRef}>
      {open && (
        <div className="fixed bottom-20 inset-x-4 sm:left-6 sm:right-auto sm:w-96 bg-sc-card border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden overflow-x-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-sc-primary">
            <span className="text-sm font-semibold text-white">{lang.chat_header_title}</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {sent ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-sc-muted">{lang.contact_title} — {lang.form_submit}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
              <label htmlFor="chat-name" className="sr-only">{lang.form_name}</label>
              <input
                id="chat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang.form_name}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors"
                required
              />
              <label htmlFor="chat-email" className="sr-only">{lang.form_email}</label>
              <input
                id="chat-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang.form_email}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors"
                required
              />
              <label htmlFor="chat-phone" className="sr-only">{lang.form_whatsapp}</label>
              <input
                id="chat-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={lang.form_whatsapp}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors"
              />
              <label htmlFor="chat-country" className="sr-only">{lang.country_select}</label>
              <select
                id="chat-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sc-primary transition-colors"
              >
                <option value="" className="bg-sc-card">{lang.country_select}</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value} className="bg-sc-card">{c.label}</option>
                ))}
              </select>
              <label htmlFor="chat-message" className="sr-only">{lang.chat_message_placeholder}</label>
              <textarea
                id="chat-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lang.chat_message_placeholder}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors resize-none"
                required
              />
              {error && <p className="text-xs text-red-400">{lang.contact_error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium rounded-lg bg-sc-primary text-white hover:bg-sc-primary-light transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {lang.chat_send_label}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-[color,background-color,transform] duration-300",
          open
            ? "bg-sc-dark border border-white/10 scale-90 rotate-90"
            : "bg-sc-primary text-white hover:bg-sc-primary-light hover:scale-110 shadow-sc-primary/30"
        )}
        aria-label="Chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
