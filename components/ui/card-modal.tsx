"use client"

import { useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface CardModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function CardModal({ isOpen, onClose, title, children }: CardModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", onKey)
    return () => {
      html.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    panelRef.current.scrollTop = 0
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(8px)",
        }}
      />
      <div
        ref={panelRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "16px",
          backgroundColor: "rgba(30, 30, 30, 0.98)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(30, 30, 30, 0.95)",
            backdropFilter: "blur(8px)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "white", paddingRight: "32px" }}>
            {title}
          </h3>
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              padding: "6px",
              borderRadius: "9999px",
              color: "#999",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
