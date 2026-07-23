"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  MessageCircle,
  X,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLang } from "@/app/providers"
import { useGame } from "@/app/providers"
import { EmojiPicker } from "@/components/chat/EmojiPicker"
import { playChatNotificationSound } from "@/lib/chat-sound"

const CHAT_SESSION_KEY = "spacecat_chat_session_id"
const CHAT_MUTED_KEY = "spacecat_chat_muted"

type ChatMessage = {
  id: string
  role: "VISITOR" | "ADMIN"
  content: string
  createdAt: string
}

function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CHAT_SESSION_KEY)
}

function setStoredSessionId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(CHAT_SESSION_KEY, id)
}

function getMuted(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(CHAT_MUTED_KEY) === "1"
}

function setMutedVal(muted: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(CHAT_MUTED_KEY, muted ? "1" : "0")
}

export default function ChatBubble() {
  const pathname = usePathname()
  const lang = useLang()
  const { gameActive } = useGame()

  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formWhatsApp, setFormWhatsApp] = useState("")
  const [formError, setFormError] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [muted, setMutedState] = useState(false)
  const [badgeCount, setBadgeCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<"OPEN" | "CLOSED">("OPEN")
  const [closingChat, setClosingChat] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const prevMessageIdsRef = useRef<Set<string>>(new Set())
  const prevAdminCountRef = useRef(0)
  const lastSeenAdminCountRef = useRef(0)
  const closedPollRunRef = useRef(false)
  const openedRef = useRef(false)

  const syncAdminReadState = useCallback(
    (adminCount?: number) => {
      const count = adminCount ?? messages.filter((m) => m.role === "ADMIN").length
      prevAdminCountRef.current = count
      lastSeenAdminCountRef.current = count
      closedPollRunRef.current = false
      setBadgeCount(0)
      setPulse(false)
    },
    [messages]
  )

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value)
    setMutedVal(value)
  }, [])

  const startSession = useCallback(async (name: string, email: string, whatsapp: string) => {
    setLoading(true)
    setFormError("")
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          visitorName: name.trim(),
          visitorEmail: email.trim(),
          visitorWhatsApp: whatsapp.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(data.error || "No se pudo iniciar el chat")
        return
      }
      setSessionId(data.sessionId)
      setStoredSessionId(data.sessionId)
      setShowForm(false)
      setSessionStatus("OPEN")

      const msgRes = await fetch(`/api/chat/session/${data.sessionId}/messages`, {
        credentials: "same-origin",
      })
      if (msgRes.ok) {
        const msgData = await msgRes.json()
        const initialMessages = msgData.messages ?? []
        setMessages(initialMessages)
        initialMessages.forEach((m: ChatMessage) => prevMessageIdsRef.current.add(m.id))
        if (msgData.status === "CLOSED") setSessionStatus("CLOSED")
      }
    } catch {
      setFormError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStoredSession = useCallback(async () => {
    const sid = getStoredSessionId()
    if (!sid) {
      setShowForm(true)
      return
    }
    setLoading(true)
    try {
      const msgRes = await fetch(`/api/chat/session/${sid}/messages`, {
        credentials: "same-origin",
      })
      if (msgRes.ok) {
        setSessionId(sid)
        setShowForm(false)
        const msgData = await msgRes.json()
        setMessages(msgData.messages ?? [])
        msgData.messages?.forEach((m: ChatMessage) => prevMessageIdsRef.current.add(m.id))
        if (msgData.status === "CLOSED") setSessionStatus("CLOSED")
      } else {
        localStorage.removeItem(CHAT_SESSION_KEY)
        setShowForm(true)
      }
    } catch {
      setShowForm(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text ?? input.trim()).trim()
      if (!msg || !sessionId || sending) return
      setSending(true)
      setInput("")
      const tempId = `tmp-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`
      setMessages((prev) => [
        ...prev,
        { id: tempId, role: "VISITOR" as const, content: msg, createdAt: new Date().toISOString() },
      ])
      try {
        const res = await fetch(`/api/chat/session/${sessionId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ content: msg }),
        })
        if (res.ok) {
          const created = await res.json()
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: created.id } : m))
          )
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== tempId))
          setInput(msg)
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setInput(msg)
      } finally {
        setSending(false)
      }
    },
    [input, sessionId, sending]
  )

  const closeChat = useCallback(async () => {
    if (!sessionId || closingChat) return
    if (!window.confirm("¿Cerrar la conversación? No podrás enviar más mensajes.")) return
    setClosingChat(true)
    try {
      const res = await fetch(`/api/chat/session/${sessionId}`, {
        method: "PATCH",
        credentials: "same-origin",
      })
      if (res.ok) {
        setSessionStatus("CLOSED")
      }
    } catch {
      // ignore
    } finally {
      setClosingChat(false)
    }
  }, [sessionId, closingChat])

  const openNewChat = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem(CHAT_SESSION_KEY)
    setSessionId(null)
    setStoredSessionId("")
    setShowForm(true)
    setMessages([])
    setSessionStatus("OPEN")
  }, [])

  useEffect(() => {
    setMutedState(getMuted())
  }, [])

  useEffect(() => {
    if (!open) {
      openedRef.current = false
      return
    }
    if (!openedRef.current && showForm) {
      openedRef.current = true
      loadStoredSession()
    }
  }, [open, showForm, loadStoredSession])

  useEffect(() => {
    if (!open || !sessionId) return
    const adminCount = messages.filter((m) => m.role === "ADMIN").length
    syncAdminReadState(adminCount)
  }, [open, sessionId, messages, syncAdminReadState])

  // SSE stream
  useEffect(() => {
    if (!open || !sessionId) return
    const es = new EventSource(`/api/chat/session/${sessionId}/stream`, { withCredentials: true })
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          messages?: ChatMessage[]
          status?: string
        }
        if (data.status === "CLOSED") {
          setSessionStatus("CLOSED")
        }
        const newMessages = data.messages ?? []
        if (newMessages.length > 0) {
          const prevIds = prevMessageIdsRef.current
          const hadNewAdmin = newMessages.some(
            (m: ChatMessage) => m.role === "ADMIN" && !prevIds.has(m.id)
          )
          newMessages.forEach((m: ChatMessage) => prevIds.add(m.id))
          setMessages((prev) => {
            const existingIds = new Set(prev.map((x) => x.id))
            const toAppend = newMessages.filter((m) => !existingIds.has(m.id))
            if (toAppend.length === 0) return prev
            return [...prev, ...toAppend]
          })
          if (hadNewAdmin && !getMuted()) {
            playChatNotificationSound()
          }
        }
      } catch {
        // ignore
      }
    }
    es.onerror = () => {}
    return () => es.close()
  }, [open, sessionId])

  // Poll when closed for badge count
  useEffect(() => {
    if (open) return
    const sid = getStoredSessionId()
    if (!sid) {
      setBadgeCount(0)
      return
    }
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/session/${sid}/messages`, {
          credentials: "same-origin",
        })
        if (res.ok) {
          const data = await res.json()
          const list = data.messages ?? []
          const adminCount = list.filter((m: ChatMessage) => m.role === "ADMIN").length
          const unread = Math.max(0, adminCount - lastSeenAdminCountRef.current)
          setBadgeCount(unread)
          if (closedPollRunRef.current && adminCount > prevAdminCountRef.current) {
            prevAdminCountRef.current = adminCount
            setPulse(true)
            if (!getMuted()) playChatNotificationSound()
            window.setTimeout(() => setPulse(false), 3000)
          } else {
            prevAdminCountRef.current = adminCount
            closedPollRunRef.current = true
          }
        }
      } catch {
        // ignore
      }
    }
    poll()
    const t = setInterval(poll, 15000)
    return () => clearInterval(t)
  }, [open])

  useEffect(() => {
    if (open) {
      setBadgeCount(0)
      setPulse(false)
      closedPollRunRef.current = false
    }
  }, [open])

  // Scroll to bottom
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current?.scrollHeight ?? 0,
        behavior: "smooth",
      })
    })
  }, [messages, open])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = formName.trim()
    const email = formEmail.trim()
    const whatsapp = formWhatsApp.trim()
    if (!name || !email || !whatsapp) {
      setFormError("Ingresa tu nombre, correo y WhatsApp.")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError("Correo no válido.")
      return
    }
    const digits = whatsapp.replace(/\D/g, "")
    if (digits.length < 9) {
      setFormError("WhatsApp inválido (mín. 9 dígitos).")
      return
    }
    startSession(name, email, whatsapp)
  }

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji)
  }

  if (gameActive) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {open && (
          <div
            className={cn(
              "flex flex-col rounded-2xl shadow-xl overflow-hidden",
              "w-[min(100vw-2rem,380px)] h-[480px]"
            )}
          style={{
            background: "linear-gradient(160deg, #0a0a18 0%, #0f0e1a 60%, #100d05 100%)",
            border: "1px solid rgba(211,84,0,0.25)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ borderBottom: "1px solid rgba(211,84,0,0.2)", background: "rgba(211,84,0,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-bold" style={{ color: "#D35400" }}>SpaceCatWeb</span>
              <span className="text-xs text-white/50">{lang.chat_support_online}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setMuted(!muted)}
                aria-label={lang.chat_mute_label}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => { syncAdminReadState(); setOpen(false) }}
                aria-label={lang.chat_minimize_label}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showForm ? (
            <div className="flex flex-1 flex-col justify-center p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="h-10 w-10 border-2 border-sc-primary/30 border-t-sc-primary rounded-full animate-spin" />
                  <p className="text-sm text-white/50">Cargando chat...</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <p className="text-sm text-white/70">Ingresa tus datos para comenzar el chat.</p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/70">Nombre</label>
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/70">Correo electrónico</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/70">WhatsApp</label>
                    <input
                      type="tel"
                      value={formWhatsApp}
                      onChange={(e) => setFormWhatsApp(e.target.value)}
                      placeholder="Ej: 999 888 777"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors"
                      autoComplete="tel"
                    />
                  </div>
                  {formError && <p className="text-sm text-red-400">{formError}</p>}
                  <button
                    type="submit"
                    className="w-full py-2.5 text-sm font-medium rounded-lg bg-sc-primary text-white hover:bg-sc-primary-light transition-colors"
                  >
                    {lang.chat_start_button}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <div className="h-10 w-10 border-2 border-sc-primary/30 border-t-sc-primary rounded-full animate-spin" />
                    <p className="text-sm text-white/50">Cargando mensajes...</p>
                  </div>
                ) : (
                  <>
                    {messages.length === 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%]">
                          <p className="mb-0.5 text-xs font-semibold text-sc-primary-light">Soporte</p>
                          <div className="rounded-2xl rounded-tl-md bg-sc-primary px-3 py-2 text-sm text-white">
                            ¡Hola! Soy Johandri. ¿En qué puedo ayudarte?
                          </div>
                        </div>
                      </div>
                    )}
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn("flex", m.role === "VISITOR" ? "justify-end" : "justify-start")}
                      >
                        {m.role === "ADMIN" ? (
                          <div className="max-w-[85%] flex items-end gap-2">
                            <div className="h-6 w-6 rounded-full bg-sc-primary/50 shrink-0" />
                            <div>
                              <p className="mb-0.5 text-xs font-semibold text-sc-primary-light">Johandri</p>
                              <div className="rounded-2xl rounded-tl-md bg-sc-primary px-3 py-2 text-sm text-white">
                                {m.content}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl rounded-tr-md bg-sc-accent px-3 py-2 text-sm text-white max-w-[85%]">
                            {m.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="border-t p-3" style={{ borderColor: "rgba(211,84,0,0.15)" }}>
                {sessionStatus === "CLOSED" ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-white/70 text-center">
                      Esta conversación está cerrada.
                    </p>
                    <button
                      type="button"
                      className="w-full py-2 text-sm font-medium rounded-lg border border-sc-primary/30 text-sc-primary hover:bg-sc-primary/10 transition-colors"
                      onClick={openNewChat}
                    >
                      Abrir nuevo chat
                    </button>
                  </div>
                ) : (
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      sendMessage()
                    }}
                  >
                    <EmojiPicker onPick={insertEmoji} disabled={loading || sending} />
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={lang.chat_message_placeholder}
                      className="flex-1 min-w-0 px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-sc-muted focus:outline-none focus:border-sc-primary transition-colors"
                      disabled={loading || sending}
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center h-9 w-9 shrink-0 rounded-xl bg-sc-primary text-white hover:bg-sc-primary-light transition-colors disabled:opacity-50"
                      disabled={loading || sending || !input.trim()}
                      aria-label="Enviar"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {!open && (
        <button
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300",
            "bg-sc-primary text-white hover:bg-sc-primary-light hover:scale-110 shadow-sc-primary/30",
            pulse && "animate-palpitar"
          )}
          onClick={() => {
            setBadgeCount(0)
            setOpen(true)
          }}
          aria-label="Abrir chat"
        >
          <MessageCircle size={22} />
          {badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}
