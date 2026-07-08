"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type { Lang } from "@/lib/lang"
import CatGame from "@/components/game/CatGame"
import { useGame } from "@/app/providers"

const SCRAMBLE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?"

interface HeroSectionProps {
  lang: Lang
}

export default function HeroSection({ lang }: HeroSectionProps) {
  const { gameActive, setGameActive } = useGame()
  const sectionRef = useRef<HTMLElement>(null)
  const catWrapRef = useRef<HTMLDivElement>(null)
  const catBodyRef = useRef<HTMLDivElement>(null)
  const catArmLRef = useRef<HTMLImageElement>(null)
  const catArmRRef = useRef<HTMLImageElement>(null)
  const catLegLRef = useRef<HTMLImageElement>(null)
  const catLegRRef = useRef<HTMLImageElement>(null)
  const catTailRef = useRef<HTMLImageElement>(null)
  const topTextRef = useRef<HTMLDivElement>(null)
  const scrollIndRef = useRef<HTMLDivElement>(null)
  const linesBackRef = useRef<HTMLDivElement>(null)
  const linesFrontRef = useRef<HTMLDivElement>(null)
  const frontLayerRef = useRef<HTMLDivElement>(null)
  const shockwaveRef = useRef<HTMLDivElement>(null)
  const visorRef = useRef<HTMLDivElement>(null)
  const clickRingRef = useRef<HTMLDivElement>(null)
  const eyeLeftRef = useRef<HTMLDivElement>(null)
  const eyeRightRef = useRef<HTMLDivElement>(null)
  const energyAuraRef = useRef<HTMLDivElement>(null)
  const meowBubbleRef = useRef<HTMLDivElement>(null)
  const eyesImageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const waveOverlayRef = useRef<HTMLDivElement>(null)
  const waveTilesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    headerRef.current = document.querySelector("header")
  }, [])

  useEffect(() => {
    const hero = sectionRef.current
    const catBody = catBodyRef.current
    const catWrap = catWrapRef.current
    const topText = topTextRef.current
    const scrollInd = scrollIndRef.current
    const linesBack = linesBackRef.current
    const linesFront = linesFrontRef.current

    if (!hero || !catBody || !catWrap || !topText || !scrollInd || !linesBack || !linesFront) return

    // ── Wave Clip-Path Reveal Animation ──────────────────────────────────
    const waveOverlay = waveOverlayRef.current
    const waveTiles = waveOverlay ? Array.from(waveOverlay.querySelectorAll<HTMLElement>(".hero-wave-tile")) : []
    const isMobile = window.innerWidth <= 768

    if (waveOverlay && waveTiles.length > 0) {
      const cols = isMobile ? 5 : 8
      const rows = isMobile ? 4 : 5
      const totalTiles = cols * rows

      // Hide extra tiles
      waveTiles.forEach((tile, i) => {
        if (i >= totalTiles) {
          tile.style.display = "none"
        }
      })

      if (isMobile) {
        waveOverlay.classList.add("mobile-mode")
      }

      // Calculate center of grid
      const centerCol = (cols - 1) / 2
      const centerRow = (rows - 1) / 2

      // Sort tiles by distance from center mathematically (CLOSEST first)
      const tilesWithDist = waveTiles.slice(0, totalTiles).map((tile, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const dist = Math.hypot(col - centerCol, row - centerRow)
        return { tile, dist }
      }).sort((a, b) => a.dist - b.dist)

      const maxDist = Math.max(...tilesWithDist.map(t => t.dist)) || 1

      // Animate tiles: center first, edges last = wave from center outward
      tilesWithDist.forEach(({ tile, dist }) => {
        const progress = dist / maxDist
        const delay = 1.0 + progress * 1.2
        const duration = 0.5

        gsap.to(tile, {
          clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
          duration,
          delay,
          ease: "power2.inOut",
        })
      })

      // Hide overlay after all tiles are gone
      gsap.to(waveOverlay, {
        opacity: 0,
        duration: 0.2,
        delay: 2.8,
        ease: "none",
        onComplete: () => { waveOverlay.style.display = "none" },
      })
    }

    // ── Split Chars (returns flat array + grouped by word) ──────────────────
    function splitChars(container: HTMLDivElement) {
      const spans = container.querySelectorAll<HTMLSpanElement>(".split-char")
      const allChars: HTMLSpanElement[] = []
      const groups: HTMLSpanElement[][] = []
      spans.forEach((span) => {
        const text = span.textContent?.trim() || ""
        span.innerHTML = ""
        const group: HTMLSpanElement[] = []
        text.split("").forEach((ch) => {
          const s = document.createElement("span")
          s.textContent = ch === " " ? "\u00A0" : ch
          s.style.display = "inline-block"
          span.appendChild(s)
          allChars.push(s)
          group.push(s)
        })
        groups.push(group)
      })
      return { allChars, groups }
    }

    const back = splitChars(linesBack)
    const front = splitChars(linesFront)
    const backChars = back.allChars
    const frontChars = front.allChars

    // ── Kill CSS transitions that fight GSAP ────────────────────────────────
    gsap.set([...backChars, ...frontChars], { transition: "none" })

    let eyeIdleActive = true
    let eyeIdleTimer: ReturnType<typeof setTimeout>
    function startEyeIdle() {
      if (!eyesImageRef.current) return
      eyeIdleActive = true
      const lookAround = () => {
        if (!eyeIdleActive || !eyesImageRef.current) return
        const tx = (Math.random() - 0.5) * 10
        const ty = (Math.random() - 0.5) * 4
        gsap.to(eyesImageRef.current, {
          x: tx,
          y: ty,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            if (!eyesImageRef.current) return
        gsap.to(eyesImageRef.current, {
          x: 0,
          y: 0,
          duration: 0.45,
          ease: "power2.inOut",
          onComplete: () => {
            const delay = 2000 + Math.random() * 3000
                setTimeout(lookAround, delay)
              },
            })
          },
        })
      }
      setTimeout(lookAround, 1000)
    }

    // ── Force layout reflow before measuring positions ──────────────────────
    void hero.offsetHeight

    // ── Spaghettification Offsets ───────────────────────────────────────────
    const heroRect = hero.getBoundingClientRect()
    const centerX = heroRect.width / 2
    const centerY = heroRect.height / 2

    function getOffsets(chars: HTMLSpanElement[]) {
      return chars.map(ch => {
        const r = ch.getBoundingClientRect()
        const cx = r.left - heroRect.left + r.width / 2
        const cy = r.top - heroRect.top + r.height / 2
        return {
          x: centerX - cx,
          y: centerY - cy,
          dist: Math.hypot(centerX - cx, centerY - cy),
        }
      })
    }

    const backOffsets = getOffsets(backChars)
    const frontOffsets = getOffsets(frontChars)
    const maxBackDist = Math.max(...backOffsets.map(o => o.dist)) || 1
    const maxFrontDist = Math.max(...frontOffsets.map(o => o.dist)) || 1

    // ── Text Scramble (works on individual spans, not parent) ──────────────
    const scrambleTimers: ReturnType<typeof setTimeout>[] = []
    const heroIntervals: ReturnType<typeof setInterval>[] = []
    function scrambleGroup(chars: HTMLSpanElement[], finalText: string, duration: number, delay: number) {
      const totalSteps = Math.floor(duration / 25)
      let step = 0
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          const progress = step / totalSteps
          chars.forEach((ch, i) => {
            if (!ch.isConnected) return
            const fc = finalText[i] || ""
            if (fc === " ") { ch.textContent = "\u00A0"; return }
            if (i / finalText.length < progress) { ch.textContent = fc }
            else { ch.textContent = SCRAMBLE_CHARSET[Math.floor(Math.random() * SCRAMBLE_CHARSET.length)] }
          })
          step++
          if (step > totalSteps) {
            chars.forEach((ch, i) => { ch.textContent = finalText[i] === " " ? "\u00A0" : (finalText[i] || "") })
            clearInterval(interval)
          }
        }, 25)
      }, delay)
      scrambleTimers.push(timer)
    }

    // ── Main Timeline ────────────────────────────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Phase 1: Top text fade in
    tl.fromTo(topText, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, 1)

    // Phase 2: Back text — emerge from center one by one
    backChars.forEach((char, i) => {
      const o = backOffsets[i]
      gsap.set(char, {
        x: o.x,
        y: o.y,
        scale: 0.05,
        opacity: 0,
        filter: "blur(8px) brightness(3)",
        transformOrigin: "50% 50%",
      })
    })

    const backOrder = backChars.map((_, i) => i).sort(() => Math.random() - 0.5)
    backOrder.forEach((charIndex, orderIndex) => {
      tl.to(
        backChars[charIndex],
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(1px) brightness(1)",
          duration: 1.8,
          ease: "power3.out",
        },
        1.5 + orderIndex * 0.15
      )
    })

    // Phase 3: Front text — emerge from center one by one (BEFORE cat)
    frontChars.forEach((char, i) => {
      const o = frontOffsets[i]
      gsap.set(char, {
        x: o.x * 1.1,
        y: o.y * 1.1,
        scale: 0.05,
        opacity: 0,
        filter: "blur(10px) brightness(5) hue-rotate(90deg)",
        transformOrigin: "50% 50%",
      })
    })

    tl.call(() => {
      const frontTexts = ["SPACE", "CAT", "WEB"]
      front.groups.forEach((group, i) => {
        scrambleGroup(group, frontTexts[i] || "", 800, i * 120)
      })
    }, undefined, 3.5)

    const frontOrder = frontChars.map((_, i) => i).sort(() => Math.random() - 0.5)
    frontOrder.forEach((charIndex, orderIndex) => {
      tl.to(
        frontChars[charIndex],
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px) brightness(1) hue-rotate(0deg)",
          duration: 2.2,
          ease: "power3.out",
        },
        3.5 + orderIndex * 0.18
      )
    })

    // Phase 4: Cat emerges from black hole center
    tl.fromTo(
      catBody,
      {
        y: 200,
        opacity: 0,
        scale: 0.05,
        filter: "brightness(0)",
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
        filter: "brightness(1)",
        duration: 2.0,
        ease: "power2.out",
      },
      6.5
    )

    // Phase 4.5: Zero-G subtle floating
    tl.call(() => {
      gsap.to(catBody, {
        y: -8,
        duration: 3.0,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
      gsap.to(catBody, {
        x: 4,
        duration: 4.0,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
      gsap.to(catBody, {
        rotation: -4,
        duration: 4.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "50% 50%",
      })
    }, undefined, 7.0)

    // Phase 4.8: Shockwave ring — expands when cat emerges
    tl.set(shockwaveRef.current, { visibility: "visible" }, 6.5)
    tl.fromTo(
      shockwaveRef.current,
      { width: 10, height: 10, opacity: 1, borderWidth: "3px" },
      {
        width: "100vw",
        height: "100vw",
        opacity: 0,
        borderWidth: "0px",
        duration: 2.5,
        ease: "power2.out",
        onComplete: () => {
          if (shockwaveRef.current) {
            shockwaveRef.current.style.visibility = "hidden"
          }
        },
      },
      6.5
    )

    // Phase 5: Scroll indicator
    tl.fromTo(
      scrollInd,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8 },
      9.0
    )

    // Phase 6: Limb animations + back text orbit
    function startIdleLimbs() {
      gsap.to(catArmLRef.current, {
        rotation: 12,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        overwrite: false,
      })
      gsap.to(catArmRRef.current, {
        rotation: -10,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        overwrite: false,
      })
      gsap.to(catLegLRef.current, {
        rotation: 10,
        duration: 3.0,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        overwrite: false,
      })
      gsap.to(catLegRRef.current, {
        rotation: -8,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        overwrite: false,
      })
      gsap.to(catTailRef.current, {
        rotation: 20,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        overwrite: false,
      })
    }
    tl.call(() => {
      startIdleLimbs()
      startEyeIdle()

      gsap.to(backChars, {
        rotationY: 8,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { amount: 2, from: "center", repeat: -1, yoyo: true },
      })
    }, undefined, 9.5)

    // Phase 7: Cat-Text interaction loop every 3 seconds
    tl.call(() => {
      const catWrapEl = catWrapRef.current
      const frontLayerEl = frontLayerRef.current
      if (!catWrapEl || !frontLayerEl) return

      let catInFront = false

      const interactionLoop = () => {
        if (catInFront) {
          // Text comes IN FRONT, cat goes behind
          gsap.to(catWrapEl, {
            scale: 0.85,
            filter: "blur(2px) brightness(0.7)",
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
              catWrapEl.style.zIndex = "3"
              frontLayerEl.style.zIndex = "6"
              gsap.to(catWrapEl, {
                scale: 1,
                filter: "blur(0px) brightness(1)",
                duration: 0.8,
                ease: "power2.out",
              })
            },
          })

          gsap.to(frontChars, {
            scale: 1.05,
            filter: "blur(0px) brightness(1.2)",
            duration: 0.6,
            ease: "power2.out",
            stagger: { amount: 0.2, from: "center" },
            onComplete: () => {
              gsap.to(frontChars, {
                scale: 1,
                filter: "blur(0px) brightness(1)",
                duration: 0.4,
                ease: "power2.in",
              })
            },
          })
        } else {
          // Cat comes IN FRONT, text goes behind
          gsap.to(frontChars, {
            scale: 0.9,
            filter: "blur(3px) brightness(0.6)",
            duration: 0.6,
            ease: "power2.inOut",
            stagger: { amount: 0.2, from: "center" },
            onComplete: () => {
              frontLayerEl.style.zIndex = "3"
              catWrapEl.style.zIndex = "6"
              gsap.to(frontChars, {
                scale: 1,
                filter: "blur(0px) brightness(1)",
                duration: 0.8,
                ease: "power2.out",
              })
            },
          })

          gsap.to(catWrapEl, {
            scale: 1.1,
            filter: "blur(0px) brightness(1.1)",
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(catWrapEl, {
                scale: 1,
                filter: "blur(0px) brightness(1)",
                duration: 0.4,
                ease: "power2.in",
              })
            },
          })
        }

        catInFront = !catInFront
      }

      const interactionInterval = setInterval(interactionLoop, 3000)
      heroIntervals.push(interactionInterval)
    }, undefined, 10.0)

    hero.classList.add("active")

    // ─ Mouse Interaction ────────
    const onMouseMove = (e: MouseEvent) => {
      const cr = catWrap.getBoundingClientRect()
      const dx = e.clientX - (cr.left + cr.width / 2)
      const dy = e.clientY - (cr.top + cr.height / 2)
      const dist = Math.hypot(dx, dy)

      const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)))
      const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2)))

      // Visor highlight follows cursor
      if (visorRef.current) {
        const visorOffsetX = normX * 8
        const visorOffsetY = normY * 5
        visorRef.current.style.transform = `translate(${visorOffsetX}px, ${visorOffsetY}px)`
      }

      // Desktop: eyes follow cursor
      if (window.innerWidth > 768 && eyesImageRef.current) {
        eyeIdleActive = false
        gsap.killTweensOf(eyesImageRef.current)
        const followX = normX * 4
        const followY = normY * 2
        gsap.to(eyesImageRef.current, {
          x: followX,
          y: followY,
          duration: 0.15,
          ease: "power2.out",
          overwrite: true,
        })
        clearTimeout(eyeIdleTimer)
        eyeIdleTimer = setTimeout(() => {
          if (eyesImageRef.current) {
            gsap.to(eyesImageRef.current, {
              x: 0,
              y: 0,
              duration: 0.3,
              ease: "power2.inOut",
              onComplete: () => startEyeIdle(),
            })
          }
        }, 1500)
      }

      // Repel behavior (only when close)
      if (dist < 150) {
        const f = (150 - dist) / 150
        gsap.to(catWrap, {
          x: -(dx / dist) * f * 30,
          y: -(dy / dist) * f * 30,
          duration: 0.15,
          ease: "power2.out",
          overwrite: "auto",
        })
      } else {
        gsap.to(catWrap, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.5)",
          overwrite: "auto",
        })
      }
    }
    hero.addEventListener("mousemove", onMouseMove)

    // ─ Click Interaction: ENERGY MODE ───────────────────────────────────────
    let meowIndex = 0
    const meowSounds = [
      new Audio("/assets/images/cat/meow1.mp3"),
      new Audio("/assets/images/cat/meow2.mp3"),
      new Audio("/assets/images/cat/meow3.mp3"),
    ]
    meowSounds.forEach(a => { a.volume = 0.5; a.preload = "auto" })

    const onCatClick = (e: MouseEvent) => {
      e.stopPropagation()

      // Play meow sound (cycle 1, 2, 3)
      meowSounds[meowIndex].currentTime = 0
      meowSounds[meowIndex].play().catch(() => {})
      meowIndex = (meowIndex + 1) % 3

      // Jump + spin animation
      gsap.timeline()
        .to(catWrap, { y: -50, scale: 1.1, duration: 0.25, ease: "power2.out" })
        .to(catWrap, { y: 0, scale: 1, duration: 0.5, ease: "bounce.out" })

      gsap.to(catBody, {
        rotation: "+=360",
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      })

      // Slow, prolonged limb wave on click
      const clickDuration = 4.5
      const shakeLimbs = (el: HTMLElement | null, rot: number, dur: number, reps: number) => {
        if (!el) return
        gsap.to(el, {
          rotation: `+=${rot}`,
          duration: dur,
          ease: "sine.inOut",
          yoyo: true,
          repeat: reps,
          overwrite: "auto",
        })
      }
      shakeLimbs(catArmLRef.current, 15, 0.4, 5)
      shakeLimbs(catArmRRef.current, -15, 0.45, 5)
      shakeLimbs(catLegLRef.current, 8, 0.42, 5)
      shakeLimbs(catLegRRef.current, -12, 0.38, 5)
      if (catTailRef.current) {
        gsap.to(catTailRef.current, {
          rotation: 25,
          duration: 0.35,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 7,
          overwrite: "auto",
        })
      }

      // Restart idle animations after click wave ends
      gsap.delayedCall(clickDuration, () => {
        startIdleLimbs()
        startEyeIdle()
      })

      // Energy aura - intense glow
      if (energyAuraRef.current) {
        gsap.timeline()
          .to(energyAuraRef.current, { opacity: 1, scale: 1.5, duration: 0.3, ease: "power2.out" })
          .to(energyAuraRef.current, { opacity: 0.6, scale: 1.2, duration: 0.5, ease: "sine.inOut" })
          .to(energyAuraRef.current, { opacity: 0, scale: 1.8, duration: 0.8, ease: "power2.in" })
      }

      // Click ring shockwave (bigger, golden)
      if (clickRingRef.current) {
        const ringSize = window.innerWidth <= 768 ? "280px" : "400px"
        gsap.fromTo(
          clickRingRef.current,
          { width: 10, height: 10, opacity: 1, borderWidth: "4px" },
          {
            width: ringSize,
            height: ringSize,
            opacity: 0,
            borderWidth: "0px",
            duration: 0.9,
            ease: "power2.out",
          }
        )
      }

      // Letters orbit around cat (energy mode)
      const orbitLetters = frontChars
      gsap.to(orbitLetters, {
        duration: 1.5,
        ease: "power2.out",
        keyframes: [
          { x: (i: number) => Math.cos(i * 0.8) * 30, y: (i: number) => Math.sin(i * 0.8) * 20, scale: 1.05, filter: "blur(0px) brightness(1.5) hue-rotate(30deg)" },
          { x: 0, y: 0, scale: 1, filter: "blur(0px) brightness(1) hue-rotate(0deg)" },
        ],
        stagger: { amount: 0.3, from: "center" },
      })

      // Burst of 12 particles in circle
      const burst = document.createElement("div")
      burst.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[6]"
      catBody?.appendChild(burst)

      for (let i = 0; i < 12; i++) {
        const particle = document.createElement("div")
        const angle = (Math.PI * 2 * i) / 12
        const dist = 100 + Math.random() * 50
        particle.className = "absolute w-2 h-2 rounded-full"
        particle.style.cssText = `
          left: 50%; top: 50%;
          background: rgba(243, 156, 18, 0.9);
          box-shadow: 0 0 10px rgba(243, 156, 18, 0.9), 0 0 20px rgba(211, 84, 0, 0.6);
        `
        burst.appendChild(particle)
        gsap.to(particle, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0,
          scale: 0.2,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => particle.remove(),
        })
      }
      setTimeout(() => burst.remove(), 900)

      // MEOW speech bubble animation
      if (meowBubbleRef.current) {
        gsap.killTweensOf(meowBubbleRef.current)
        gsap.timeline()
          .fromTo(
            meowBubbleRef.current,
            { opacity: 0, scale: 0, x: 0, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "back.out(2)" }
          )
          .to(meowBubbleRef.current, {
            opacity: 0, scale: 0.8, y: -20, duration: 0.3, ease: "power2.in"
          }, "+=0.5")
      }
    }
    catBody?.addEventListener("click", onCatClick)

    // Mobile: eyes look toward tap/click position
    const updateMobileEyes = () => {
      if (!eyesImageRef.current || !catBody) return
      const src = catBody.getBoundingClientRect()
      const sx = src.left + src.width / 2
      const sy = src.top + src.height / 2
      const dx = Math.max(-1, Math.min(1, ((window.innerWidth / 2) - sx) / (window.innerWidth / 2)))
      const dy = Math.max(-1, Math.min(1, ((window.innerHeight / 2) - sy) / (window.innerHeight / 2)))
      eyesImageRef.current.style.transition = "transform 0.4s ease-out"
      eyesImageRef.current.style.transform = `translate(calc(-50% + ${dx * 3}px), ${dy * 1}px)`
    }

    const onHeroMobileClick = (e: MouseEvent) => {
      if (window.innerWidth > 768 || !eyesImageRef.current || !catBody) return
      const cr = catBody.getBoundingClientRect()
      const dx = e.clientX - (cr.left + cr.width / 2)
      const dy = e.clientY - (cr.top + cr.height / 2)
      const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)))
      const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2)))
      eyesImageRef.current.style.transition = "none"
      eyesImageRef.current.style.transform = `translate(calc(-50% + ${normX * 6}px), ${normY * 2}px)`
      setTimeout(() => {
        if (eyesImageRef.current) {
          eyesImageRef.current.style.transition = "transform 0.4s ease-out"
          updateMobileEyes()
        }
      }, 600)
    }
    hero.addEventListener("click", onHeroMobileClick)

    // ── Scroll Handler ───────────────────────────────────────────────────────
    const header = headerRef.current
    const heroH = hero.offsetHeight
    const onScroll = () => {
      const past = window.scrollY > heroH * 0.6
      header?.classList.toggle("header-scrolled", past)
      document.body.classList.toggle("at-hero", !past)
      gsap.to(scrollInd, {
        opacity: window.scrollY < heroH * 0.5 ? 1 : 0,
        duration: 0.3,
        overwrite: "auto",
      })
      // Mobile: eyes track viewport center
      if (window.innerWidth <= 768) updateMobileEyes()
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      hero.removeEventListener("mousemove", onMouseMove)
      hero.removeEventListener("click", onHeroMobileClick)
      catBody?.removeEventListener("click", onCatClick)
      scrambleTimers.forEach(clearTimeout)
      heroIntervals.forEach(clearInterval)
      clearTimeout(eyeIdleTimer)
      eyeIdleActive = false
      if (eyesImageRef.current) gsap.killTweensOf(eyesImageRef.current)
      tl.kill()
    }
  }, [lang])

  const scrollDown = () => {
    const about = document.getElementById("about")
    if (about) about.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="hero-reveal relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Gradient Overlay (video is now in GlobalVideoBackground) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-[1]" />

      {/* Wave Clip-Path Reveal Overlay */}
      <div ref={waveOverlayRef} className="hero-wave-overlay">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { if (el) waveTilesRef.current[i] = el }}
            className="hero-wave-tile"
          />
        ))}
      </div>

      {/* Holographic Orbs */}
      <div className="hero-orb hero-orb-1 z-[2]" style={{ background: "rgba(211, 84, 0, 0.15)" }} />
      <div className="hero-orb hero-orb-2 z-[2]" style={{ background: "rgba(243, 156, 18, 0.1)" }} />
      <div className="hero-orb hero-orb-3 z-[2]" style={{ background: "rgba(230, 126, 34, 0.08)" }} />

      {/* Top Text */}
      <div
        ref={topTextRef}
        className="absolute top-24 lg:top-32 left-1/2 -translate-x-1/2 z-10 text-sc-primary font-medium text-sm sm:text-base tracking-[0.3em] uppercase"
        style={{ opacity: gameActive ? 0 : 1, transition: "opacity 0.5s ease" }}
      >
        {lang.hero_subtitle}
      </div>

      {/* Back Text Layer */}
      <div className="hero-reveal-content" style={{ perspective: "800px", opacity: gameActive ? 0 : 1, transition: "opacity 0.5s ease" }}>
        <div
          ref={linesBackRef}
          className="hero-reveal-text hero-reveal-text-back pointer-events-none select-none"
          aria-hidden="true"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="hero-text-line hero-line-left">
            <span className="split-char text-white/8">SPACE</span>
          </div>
          <div className="hero-text-line hero-line-center">
            <span className="split-char text-white/8">CAT</span>
          </div>
          <div className="hero-text-line hero-line-right">
            <span className="split-char text-white/8">WEB</span>
          </div>
        </div>
      </div>

      {/* Cat - composed parts */}
      <div className="hero-cat-wrap" id="heroCatWrap" style={{ transformStyle: "preserve-3d", opacity: gameActive ? 0 : 1, transition: "opacity 0.5s ease", pointerEvents: gameActive ? "none" : "auto" }}>
        <div ref={catWrapRef} className="hero-cat-mouse">
          <div ref={catBodyRef} className="hero-cat-body">
          {/* Backpack (behind everything) */}
          <img
            src="/assets/images/cat/cat-backpack.png"
            className="cat-part cat-backpack-img"
            alt="Astronaut Cat Backpack"
          />
          {/* Body */}
          <img
            src="/assets/images/cat/cat-body.png"
            className="cat-body-img"
            alt="Astronaut Cat Body"
          />
          {/* Left Arm */}
          <img
            ref={catArmLRef}
            src="/assets/images/cat/cat-arm-l.png"
            className="cat-part cat-arm-l-img"
            alt=""
          />
          {/* Right Arm */}
          <img
            ref={catArmRRef}
            src="/assets/images/cat/cat-arm-r.png"
            className="cat-part cat-arm-r-img"
            alt=""
          />
          {/* Left Leg */}
          <img
            ref={catLegLRef}
            src="/assets/images/cat/cat-leg-l.png"
            className="cat-part cat-leg-l-img"
            alt=""
          />
          {/* Right Leg */}
          <img
            ref={catLegRRef}
            src="/assets/images/cat/cat-leg-r.png"
            className="cat-part cat-leg-r-img"
            alt=""
          />
          {/* Tail */}
          <img
            ref={catTailRef}
            src="/assets/images/cat/cat-tail.png"
            className="cat-part cat-tail-img"
            alt=""
          />

          {/* Visor highlight - follows cursor for light reflection effect */}
          <div
            ref={visorRef}
            className="absolute pointer-events-none"
            style={{
              top: "8%",
              left: "20%",
              width: "60%",
              height: "28%",
              borderRadius: "50%",
              background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)",
              mixBlendMode: "screen",
              transform: "translate(0px, 0px)",
              transition: "transform 0.1s ease-out",
            }}
          />

          {/* Energy aura - glows during energy mode */}
          <div
            ref={energyAuraRef}
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(243, 156, 18, 0.8) 0%, rgba(211, 84, 0, 0.4) 40%, transparent 70%)",
              filter: "blur(20px)",
              opacity: 0,
              transform: "scale(0.8)",
            }}
          />

          {/* Click ring - expands on click */}
          <div
            ref={clickRingRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
            style={{
              width: "10px",
              height: "10px",
              border: "2px solid rgba(243, 156, 18, 0.8)",
              boxShadow: "0 0 20px rgba(243, 156, 18, 0.6), 0 0 40px rgba(211, 84, 0, 0.4)",
              opacity: 0,
            }}
          />
          {/* Eyes overlay - on cat face */}
          <div
            ref={eyesImageRef}
            className="absolute pointer-events-none"
            style={{
              top: "23.0%",
              left: "63.5%",
              width: "42.0%",
              transform: "translate(-50%, 0px)",
              zIndex: 2,
            }}
          >
            <img
              src="/assets/images/cat/cat-eyes.png"
              alt="Cat Eyes"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 0 6px rgba(243, 156, 18, 0.7))",
              }}
            />
          </div>
          {/* Meow speech bubble - inside catBody to follow rotation */}
          <div
            ref={meowBubbleRef}
            className="absolute pointer-events-none"
            style={{
              top: "-8%",
              right: "-10%",
              zIndex: 60,
              opacity: 0,
              transform: "scale(0) translateY(20px)",
            }}
          >
              <div
                className="relative px-4 py-2 rounded-2xl font-bold text-lg whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, rgba(243, 156, 18, 0.95) 0%, rgba(211, 84, 0, 0.95) 100%)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(243, 156, 18, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                }}
              >
                MEOW!
                <div
                  className="absolute -bottom-3 left-6 w-0 h-0"
                  style={{
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "12px solid rgba(211, 84, 0, 0.95)",
                  }}
                />
              </div>
              <div className="absolute top-2 -right-6 flex gap-1">
                <div className="w-1 h-3 rounded-full" style={{ background: "rgba(243, 156, 18, 0.8)", animation: "meowWave 0.6s ease-out infinite" }} />
                <div className="w-1 h-4 rounded-full" style={{ background: "rgba(243, 156, 18, 0.8)", animation: "meowWave 0.6s ease-out 0.1s infinite" }} />
                <div className="w-1 h-3 rounded-full" style={{ background: "rgba(243, 156, 18, 0.8)", animation: "meowWave 0.6s ease-out 0.2s infinite" }} />
              </div>
          </div>
        </div>
        </div>

        {/* Cat Glow Effect */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(211, 84, 0, 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Front Text Layer */}
      <div ref={frontLayerRef} className="hero-reveal-content" style={{ perspective: "800px", opacity: gameActive ? 0 : 1, transition: "opacity 0.5s ease" }}>
        <div
          ref={linesFrontRef}
          className="hero-reveal-text hero-reveal-text-front"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="hero-text-line hero-line-left" style={{ position: "relative" }}>
            <span className="split-char text-white">SPACE</span>
            {/* SPACE line sparks (smaller, farther back) */}
            <div className="hero-text-streak" aria-hidden="true"
              style={{ top: "50%", "--dir": "-30px", "--w": "60px", animationDelay: "0.2s", animationDuration: "2.6s" } as React.CSSProperties} />
            <div className="hero-text-spark-particle" aria-hidden="true"
              style={{ top: "40%", left: "30%", animationDelay: "0.4s", animationDuration: "1.5s", width: "3px", height: "3px" }} />
            <div className="hero-text-spark-particle fly-down" aria-hidden="true"
              style={{ top: "55%", left: "60%", animationDelay: "0.9s", animationDuration: "1.7s", width: "3px", height: "3px" }} />
          </div>
          <div className="hero-text-line hero-line-center" style={{ position: "relative" }}>
            <span className="split-char text-sc-accent">CAT</span>
            {/* CAT line sparks (bigger, closer to viewer) */}
            <div className="hero-text-streak" aria-hidden="true"
              style={{ top: "45%", "--dir": "-40px", "--w": "90px", animationDelay: "0.6s", animationDuration: "2.8s" } as React.CSSProperties} />
            <div className="hero-text-streak" aria-hidden="true"
              style={{ top: "55%", "--dir": "40px", "--w": "70px", animationDelay: "1.8s", animationDuration: "3.2s" } as React.CSSProperties} />
            <div className="hero-text-spark-particle" aria-hidden="true"
              style={{ top: "35%", left: "25%", animationDelay: "0.2s", animationDuration: "1.6s", width: "5px", height: "5px" }} />
            <div className="hero-text-spark-particle" aria-hidden="true"
              style={{ top: "50%", left: "70%", animationDelay: "1.0s", animationDuration: "1.4s", width: "5px", height: "5px" }} />
            <div className="hero-text-spark-particle fly-down" aria-hidden="true"
              style={{ top: "60%", left: "45%", animationDelay: "1.5s", animationDuration: "1.8s", width: "5px", height: "5px" }} />
          </div>
          <div className="hero-text-line hero-line-right" style={{ position: "relative" }}>
            <span className="split-char text-white">WEB</span>
            {/* WEB line sparks (smaller, farther back) */}
            <div className="hero-text-streak" aria-hidden="true"
              style={{ top: "50%", "--dir": "-35px", "--w": "55px", animationDelay: "1.2s", animationDuration: "2.9s" } as React.CSSProperties} />
            <div className="hero-text-spark-particle fly-down" aria-hidden="true"
              style={{ top: "45%", left: "40%", animationDelay: "0.5s", animationDuration: "1.6s", width: "3px", height: "3px" }} />
            <div className="hero-text-spark-particle" aria-hidden="true"
              style={{ top: "55%", left: "70%", animationDelay: "1.3s", animationDuration: "1.5s", width: "3px", height: "3px" }} />
          </div>
        </div>
      </div>

      {/* Shockwave Ring */}
      <div
        ref={shockwaveRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none rounded-full"
        style={{
          width: "10px",
          height: "10px",
          border: "2px solid rgba(211, 84, 0, 0.8)",
          boxShadow: "0 0 30px rgba(211, 84, 0, 0.6), 0 0 60px rgba(243, 156, 18, 0.4), inset 0 0 30px rgba(211, 84, 0, 0.3)",
          opacity: 0,
          visibility: "hidden",
        }}
      />

      {/* Neon Glow Line */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] z-[6] pointer-events-none opacity-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(211, 84, 0, 0.5) 20%, rgba(243, 156, 18, 0.8) 50%, rgba(211, 84, 0, 0.5) 80%, transparent 100%)",
          boxShadow: "0 0 20px rgba(211, 84, 0, 0.5), 0 0 40px rgba(211, 84, 0, 0.3)",
        }}
      />

      {/* Scroll Indicator */}
      {!gameActive && (
        <div
          ref={scrollIndRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0"
        >
          <span className="text-xs text-sc-muted tracking-[0.2em] uppercase font-mono">SCROLL</span>
          <div className="w-6 h-10 rounded-full border-2 border-sc-primary/40 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 rounded-full bg-sc-primary animate-[hero-scroll-wheel_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Bottom Navigation Hint */}
      {!gameActive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={scrollDown}
            className="text-sc-muted/50 hover:text-sc-primary transition-colors text-sm tracking-[0.2em] uppercase font-mono"
          >
          ↓ {lang.nav_home}
          </button>
        </div>
      )}

      {/* Corner Decorations */}
      <div className="absolute top-8 left-8 z-10 opacity-30">
        <div className="w-16 h-[1px] bg-sc-primary/50 mb-1" />
        <div className="w-8 h-[1px] bg-sc-primary/30" />
      </div>
      <div className="absolute top-8 right-8 z-10 opacity-30">
        <div className="w-16 h-[1px] bg-sc-primary/50 mb-1 ml-auto" />
        <div className="w-8 h-[1px] bg-sc-primary/30 ml-auto" />
      </div>
      <div className="absolute bottom-24 left-8 z-10 opacity-30">
        <div className="w-8 h-[1px] bg-sc-primary/30 mb-1" />
        <div className="w-16 h-[1px] bg-sc-primary/50" />
      </div>
      <div className="absolute bottom-24 right-8 z-10 opacity-30">
        <div className="w-8 h-[1px] bg-sc-primary/30 mb-1 ml-auto" />
        <div className="w-16 h-[1px] bg-sc-primary/50" />
      </div>

      {!gameActive && (
        <button
          onClick={() => setGameActive(true)}
          className="absolute top-40 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-normal text-[10px] sm:text-xs text-sc-primary bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-colors active:scale-95"
        >
          🎮 {lang.game_play}
        </button>
      )}

      {gameActive && (
        <CatGame lang={lang} onClose={() => setGameActive(false)} onStart={() => {}} />
      )}
    </section>
  )
}
