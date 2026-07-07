"use client"

import { useState, useRef, useEffect } from "react"
import { Smile } from "lucide-react"

const EMOJIS = [
  "😀", "😊", "😂", "❤️", "👍", "👋", "🙏", "😅", "😢", "🔥",
  "✅", "❌", "⭐", "💬", "📌", "🎉", "👏", "🤔", "😎",
  "💪", "🙂", "😁", "😃", "😄", "😆", "😉", "😍", "🥰", "😘",
]

export function EmojiPicker({
  onPick,
  disabled,
}: {
  onPick: (emoji: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-center h-9 w-9 shrink-0 rounded-lg text-sc-muted hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-label="Insertar emoji"
      >
        <Smile className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 flex w-[220px] flex-wrap gap-1 rounded-xl border border-white/10 bg-sc-dark p-2 shadow-lg">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded p-1.5 text-lg leading-none hover:bg-white/10 transition-colors"
              onClick={() => {
                onPick(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
