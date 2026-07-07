"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import type { Lang } from "@/lib/lang"

function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  return new (window.AudioContext || (window as any).webkitAudioContext)()
}

let musicNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode; lfoGain: GainNode } | null = null
let musicStopFn: (() => void) | null = null

function startPixelMusic(ctx: AudioContext): () => void {
  const master = ctx.createGain()
  master.gain.value = 0.08
  master.connect(ctx.destination)

  const out = master
  let stopped = false

  const noteFreqs = [220, 261.63, 293.66, 329.63, 392, 440, 523.25]
  const bassFreqs = [110, 130.81, 146.83]

  let beat = 0
  const bpm = 130
  const beatMs = (60 / bpm) * 1000 / 2

  const playNote = (freq: number, durMs: number, type: OscillatorType = "square", vol = 0.5) => {
    if (stopped) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(vol, now + 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, now + durMs / 1000)
    osc.connect(g)
    g.connect(out)
    osc.start(now)
    osc.stop(now + durMs / 1000 + 0.02)
  }

  const arpPattern = [0, 2, 4, 2, 5, 4, 2, 0]
  const bassPattern = [0, 0, 1, 0, 2, 0, 1, 0]

  const interval = setInterval(() => {
    if (stopped) return
    const idx = beat % arpPattern.length
    playNote(noteFreqs[arpPattern[idx]], beatMs * 0.9, "square", 0.4)
    if (beat % 2 === 0) {
      playNote(bassFreqs[bassPattern[idx]], beatMs * 1.8, "triangle", 0.6)
    }
    if (beat % 4 === 0) {
      playNote(80, beatMs * 0.3, "sawtooth", 0.3)
    }
    beat++
  }, beatMs)

  return () => {
    stopped = true
    clearInterval(interval)
  }
}

function stopPixelMusic() {
  if (musicStopFn) {
    musicStopFn()
    musicStopFn = null
  }
}

function playSound(ctx: AudioContext | null, type: "hit" | "dodge" | "combo" | "score" | "gameover" | "start") {
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  if (type === "hit") {
    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25)
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.start(now)
    osc.stop(now + 0.3)
  } else if (type === "dodge") {
    osc.type = "sine"
    osc.frequency.setValueAtTime(660, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1)
    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc.start(now)
    osc.stop(now + 0.15)
  } else if (type === "combo") {
    osc.type = "triangle"
    osc.frequency.setValueAtTime(523, now)
    osc.frequency.setValueAtTime(659, now + 0.06)
    osc.frequency.setValueAtTime(784, now + 0.12)
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc.start(now)
    osc.stop(now + 0.2)
  } else if (type === "gameover") {
    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.8)
    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
    osc.start(now)
    osc.stop(now + 0.9)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = "square"
    osc2.frequency.setValueAtTime(110, now + 0.15)
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.7)
    gain2.gain.setValueAtTime(0.2, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.8)
  } else if (type === "start") {
    osc.type = "sine"
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.setValueAtTime(554, now + 0.1)
    osc.frequency.setValueAtTime(659, now + 0.2)
    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc.start(now)
    osc.stop(now + 0.35)
  } else {
    osc.type = "square"
    osc.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.start(now)
    osc.stop(now + 0.1)
  }
}

interface CatGameProps {
  lang: Lang
  onClose: () => void
  onStart: () => void
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  targetR: number
  life: number
  trail: { x: number; y: number }[]
  alive: boolean
}

type PowerUpType = "shield" | "slow" | "double" | "heart" | "gun"

interface PowerUp {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  targetR: number
  life: number
  type: PowerUpType
  trail: { x: number; y: number }[]
  alive: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  r: number
  color: string
  alive: boolean
}

interface Bullet {
  x: number
  y: number
  vy: number
  r: number
  life: number
  alive: boolean
}

interface FloatingText {
  x: number
  y: number
  text: string
  color: string
  life: number
  maxLife: number
  size: number
}

interface ScoreEntry {
  name: string
  score: number
  max_combo: number
  created_at: string
}

interface CatPart {
  img: HTMLImageElement | null
  src: string
  wPct: number
  hPct: number
  leftPct: number
  topPct: number
  zIndex: number
}

type GameState = "idle" | "playing" | "gameOver" | "scoreboard"

const MAX_LIVES = 7
const INVULNERABILITY_MS = 1500
const BASE_SPEED = 2.5
const SPEED_INCREMENT = 0.15
const BASE_SPAWN_MS = 1400
const SPAWN_DECREMENT = 30
const MIN_SPAWN_MS = 900
const METEOR_MIN_R = 10
const METEOR_MAX_R = 30
const CAT_W_BASE = 70
const CAT_H_BASE = 87
const CAT_BOTTOM_PAD_BASE = 40
const BASE_GRAVITY = 0.04
const GRAVITY_INCREMENT = 0.005
const SPAWN_ANIM_MS = 350
const MAX_DT = 33 // Cap at ~30fps to prevent huge spikes
const MAX_TRAIL = 8 // Max trail points per entity
const MAX_PARTICLES = 150 // Cap total particles
const MAX_FLOATING_TEXTS = 12 // Cap floating texts

function getWaveCount(score: number): number {
  if (score < 15) return 1
  if (score < 35) return 1
  if (score < 70) return 2
  if (score < 120) return 2
  if (score < 200) return 3
  return 3
}

const BLUR_COLORS = [
  "rgba(180, 20, 20, ALPHA)",
  "rgba(139, 69, 19, ALPHA)",
  "rgba(128, 0, 128, ALPHA)",
  "rgba(139, 0, 78, ALPHA)",
  "rgba(100, 0, 50, ALPHA)",
  "rgba(80, 0, 80, ALPHA)",
  "rgba(60, 0, 100, ALPHA)",
  "rgba(40, 0, 60, ALPHA)",
]

function getBlurColor(tier: number): string {
  if (tier < 5) return ""
  const colorIdx = Math.min(Math.floor((tier - 5) / 5), BLUR_COLORS.length - 1)
  const levelInBracket = (tier - 5) % 5
  const bracketAlpha = 0.10 + levelInBracket * 0.06
  const baseAlpha = Math.min(0.45, bracketAlpha)
  return BLUR_COLORS[colorIdx].replace("ALPHA", baseAlpha.toFixed(2))
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = () => resolve(img)
  })
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, alive: boolean) {
  const s = 8
  if (alive) {
    ctx.fillStyle = "#E74C3C"
    ctx.shadowColor = "rgba(231, 76, 60, 0.6)"
    ctx.shadowBlur = 6
  } else {
    ctx.fillStyle = "#444"
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
  }
  ctx.beginPath()
  ctx.moveTo(cx, cy + s * 0.6)
  ctx.bezierCurveTo(cx, cy + s * 0.2, cx - s, cy - s * 0.2, cx - s, cy - s * 0.4)
  ctx.bezierCurveTo(cx - s, cy - s * 0.9, cx - s * 0.4, cy - s, cx, cy - s * 0.3)
  ctx.bezierCurveTo(cx + s * 0.4, cy - s, cx + s, cy - s * 0.9, cx + s, cy - s * 0.4)
  ctx.bezierCurveTo(cx + s, cy - s * 0.2, cx, cy + s * 0.2, cx, cy + s * 0.6)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
  if (!alive) {
    ctx.strokeStyle = "#666"
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

export default function CatGame({ lang, onClose, onStart }: CatGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const partsRef = useRef<CatPart[]>([])
  const partsLoadedRef = useRef(false)
  const flyCatRef = useRef<HTMLImageElement | null>(null)
  const flyCatLoadedRef = useRef(false)
  const rafRef = useRef<number>(0)
  const meteorsRef = useRef<Meteor[]>([])
  const powerUpsRef = useRef<PowerUp[]>([])
  const streaksRef = useRef<{ x: number; y: number; length: number; speed: number; alpha: number }[]>([])
  const catTrailRef = useRef<{ x: number; y: number; life: number; maxLife: number }[]>([])
  const lastPowerUpRef = useRef(0)
  const POWER_UP_BASE_INTERVAL = 8000
  const slowMoRef = useRef(0)
  const doublePointsRef = useRef(0)
  const shieldRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const catXRef = useRef(0)
  const catBobRef = useRef(0)
  const catTiltRef = useRef(0)
  const scoreRef = useRef(0)
  const meteorCountRef = useRef(0)
  const comboRef = useRef(0)
  const displayComboRef = useRef(0)
  const maxComboRef = useRef(0)
  const livesRef = useRef(MAX_LIVES)
  const invulnRef = useRef(0)
  const elapsedRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const stateRef = useRef<GameState>("idle")
  const shakeRef = useRef(0)
  const startedRef = useRef(false)
  const isMobileRef = useRef(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const muteRef = useRef(false)
  const musicMutedRef = useRef(false)
  const lastHitSoundRef = useRef<number>(-1)
  const lastDodgeSoundRef = useRef<number>(-1)
  const lastBurstRef = useRef(0)
  const gunRef = useRef(0)
  const bulletsRef = useRef<Bullet[]>([])
  const gunPointsRef = useRef(0)
  const gunLevelRef = useRef(1)
  const gunBarRef = useRef(0)
  const prevTierRef = useRef(0)
  const levelFlashRef = useRef(0)
  const floatingTextsRef = useRef<FloatingText[]>([])
  const blurFlickerRef = useRef(0)
  const prevBlurTierRef = useRef(0)

  const [gameState, setGameState] = useState<GameState>("idle")
  const [displayScore, setDisplayScore] = useState(0)
  const [displayLives, setDisplayLives] = useState(MAX_LIVES)
  const [displayCombo, setDisplayCombo] = useState(0)
  const [playerName, setPlayerName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loadingScores, setLoadingScores] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [muted, setMuted] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)

  useEffect(() => {
    muteRef.current = muted
  }, [muted])

  useEffect(() => {
    musicMutedRef.current = musicMuted
  }, [musicMuted])

  useEffect(() => {
    isMobileRef.current = isMobile
  }, [isMobile])

  const playRandomHitSound = useCallback(() => {
    if (muteRef.current) return
    const sounds: ("hit" | "combo" | "score")[] = ["hit", "combo", "score"]
    let idx = Math.floor(Math.random() * sounds.length)
    while (idx === lastHitSoundRef.current) idx = Math.floor(Math.random() * sounds.length)
    lastHitSoundRef.current = idx
    playSound(audioCtxRef.current, sounds[idx])
  }, [])

  const playRandomDodgeSound = useCallback(() => {
    if (muteRef.current) return
    const sounds: ("dodge" | "combo" | "score")[] = ["dodge", "combo", "score"]
    let idx = Math.floor(Math.random() * sounds.length)
    while (idx === lastDodgeSoundRef.current) idx = Math.floor(Math.random() * sounds.length)
    lastDodgeSoundRef.current = idx
    playSound(audioCtxRef.current, sounds[idx])
  }, [])

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext()
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume()
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const catScale = 0.6
  const CAT_W = CAT_W_BASE * catScale
  const CAT_H = CAT_H_BASE * catScale
  const CAT_BOTTOM_PAD = CAT_BOTTOM_PAD_BASE * catScale
  const CAT_W_REF = useRef(CAT_W)
  const CAT_H_REF = useRef(CAT_H)
  CAT_W_REF.current = CAT_W
  CAT_H_REF.current = CAT_H

  useEffect(() => {
    return () => {
      stopPixelMusic()
    }
  }, [])

  const getDifficulty = useCallback(() => {
    const score = meteorCountRef.current
    let tier = 0
    let threshold = 10
    let gap = 10
    while (score >= threshold) {
      tier++
      gap = Math.min(gap + 10, 60)
      threshold += gap
    }
    return {
      speed: BASE_SPEED + tier * SPEED_INCREMENT,
      spawnMs: Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - tier * SPAWN_DECREMENT),
      gravity: BASE_GRAVITY + tier * GRAVITY_INCREMENT,
    }
  }, [])

  const spawnMeteor = useCallback((w: number, h: number) => {
    if (stateRef.current !== "playing") return
    const { speed } = getDifficulty()
    const mobile = isMobileRef.current
    const maxR = mobile ? METEOR_MAX_R * 0.5 : METEOR_MAX_R
    const minR = mobile ? METEOR_MIN_R * 0.8 : METEOR_MIN_R
    const targetR = minR + Math.random() * (maxR - minR)
    const margin = maxR
    const spawnX = margin + Math.random() * Math.max(1, w - margin * 2)
    const spawnY = h * 0.42
    const vxDir = Math.random() < 0.5 ? -1 : 1
    const vx = vxDir * (w * 0.001 + Math.random() * w * 0.0015)
    const vy = -(speed * 2.5 + Math.random() * 1.2)
    meteorsRef.current.push({
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      r: targetR * 0.3,
      targetR,
      life: 0,
      trail: [],
      alive: true,
    })
  }, [getDifficulty])

  const spawnPowerUp = useCallback((w: number, h: number) => {
    if (stateRef.current !== "playing") return
    const types: PowerUpType[] = ["shield", "slow", "double", "heart", "gun"]
    const type = types[Math.floor(Math.random() * types.length)]
    const targetR = 14
    const margin = targetR
    const spawnX = margin + Math.random() * Math.max(1, w - margin * 2)
    const spawnY = h * 0.42
    const vx = (Math.random() - 0.5) * w * 0.0008
    const vy = -(1.5 + Math.random() * 1)
    powerUpsRef.current.push({
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      r: targetR * 0.3,
      targetR,
      life: 0,
      type,
      trail: [],
      alive: true,
    })
  }, [])

  const spawnExplosion = useCallback((x: number, y: number, count: number, color: string) => {
    const activeCount = particlesRef.current.filter(p => p.alive).length
    const canSpawn = Math.min(count, MAX_PARTICLES - activeCount)
    if (canSpawn <= 0) return
    for (let i = 0; i < canSpawn; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 4
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 20,
        r: 2 + Math.random() * 3,
        color,
        alive: true,
      })
    }
  }, [])

  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string, size: number = 20) => {
    if (floatingTextsRef.current.length >= MAX_FLOATING_TEXTS) return
    floatingTextsRef.current.push({
      x, y, text, color, size,
      life: 0,
      maxLife: 90,
    })
  }, [])

  const startGame = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true
      onStart()
    }
    ensureAudio()
    if (!muteRef.current) playSound(audioCtxRef.current, "start")
    if (!musicMutedRef.current && audioCtxRef.current && !musicStopFn) {
      musicStopFn = startPixelMusic(audioCtxRef.current)
    }
    meteorsRef.current = []
    powerUpsRef.current = []
    particlesRef.current = []
    streaksRef.current = []
    catTrailRef.current = []
    bulletsRef.current = []
    floatingTextsRef.current = []
    scoreRef.current = 0
    meteorCountRef.current = 0
    livesRef.current = MAX_LIVES
    invulnRef.current = 0
    elapsedRef.current = 0
    lastSpawnRef.current = 0
    lastPowerUpRef.current = 0
    lastBurstRef.current = 0
    shakeRef.current = 0
    slowMoRef.current = 0
    doublePointsRef.current = 0
    shieldRef.current = 0
    gunRef.current = 0
    gunPointsRef.current = 0
    gunLevelRef.current = 1
    gunBarRef.current = 0
    prevTierRef.current = 0
    levelFlashRef.current = 0
    blurFlickerRef.current = 0
    prevBlurTierRef.current = 0
    stateRef.current = "playing"
    setGameState("playing")
    setDisplayScore(0)
    setDisplayLives(MAX_LIVES)
    setDisplayCombo(0)
    comboRef.current = 0
    displayComboRef.current = 0
    maxComboRef.current = 0
    ;(window as any).__gameZoom = 1
    ;(window as any).__gameRotation = 0
  }, [onStart, ensureAudio])

  const endGame = useCallback(() => {
    stateRef.current = "gameOver"
    setGameState("gameOver")
    stopPixelMusic()
    if (!muteRef.current) playSound(audioCtxRef.current, "gameover")
    ;(window as any).__gameZoom = 1
    ;(window as any).__gameRotation = 0
    const canvas = canvasRef.current
    if (canvas) {
      spawnExplosion(catXRef.current, canvas.height - CAT_BOTTOM_PAD, 24, "#F39C12")
      spawnExplosion(catXRef.current, canvas.height - CAT_BOTTOM_PAD, 16, "#D35400")
    }
  }, [spawnExplosion])

  const showScoreboard = useCallback(async () => {
    stateRef.current = "scoreboard"
    setGameState("scoreboard")
    setLoadingScores(true)
    try {
      const res = await fetch("/api/scores")
      if (res.ok) {
        const data = await res.json()
        setScores(data)
      }
    } catch {
      setScores([])
    } finally {
      setLoadingScores(false)
    }
  }, [])

  const saveScore = useCallback(async () => {
    if (!playerName.trim()) return
    setSaving(true)
    setSaveError(false)
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName.trim(),
          score: scoreRef.current,
          maxCombo: maxComboRef.current,
          elapsed: elapsedRef.current / 1000,
        }),
      })
      if (!res.ok) throw new Error()
      await showScoreboard()
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }, [playerName, showScoreboard])

  useEffect(() => {
    const parts = [
      { src: "/assets/images/cat/cat-backpack.png", wPct: 0.773, hPct: 0.638, leftPct: 0.096, topPct: 0.332, zIndex: 0 },
      { src: "/assets/images/cat/cat-tail.png", wPct: 0.482, hPct: 0.229, leftPct: 0.281, topPct: 0.977, zIndex: 1 },
      { src: "/assets/images/cat/cat-leg-l.png", wPct: 0.569, hPct: 0.468, leftPct: -0.42, topPct: 0.61, zIndex: 1 },
      { src: "/assets/images/cat/cat-leg-r.png", wPct: 0.576, hPct: 0.549, leftPct: -0.097, topPct: 0.815, zIndex: 1 },
      { src: "/assets/images/cat/cat-arm-l.png", wPct: 0.601, hPct: 0.26, leftPct: -0.289, topPct: 0.393, zIndex: 1 },
      { src: "/assets/images/cat/cat-arm-r.png", wPct: 0.351, hPct: 0.532, leftPct: 0.633, topPct: 0.558, zIndex: 1 },
      { src: "/assets/images/cat/cat-body.png", wPct: 1, hPct: 1, leftPct: 0, topPct: 0, zIndex: 2 },
      { src: "/assets/images/cat/cat-eyes.png", wPct: 0.42, hPct: 0, leftPct: 0.63, topPct: 0.225, zIndex: 3 },
    ]
    Promise.all(parts.map(async (p) => {
      const img = await loadImage(p.src)
      return { img: img.complete ? img : null, ...p }
    })).then((loaded) => {
      partsRef.current = loaded
      partsLoadedRef.current = true
    })
    loadImage("/assets/images/cat/cat-fly.png").then((img) => {
      flyCatRef.current = img.complete ? img : null
      flyCatLoadedRef.current = true
    })
  }, [])

  const drawCat = useCallback((ctx: CanvasRenderingContext2D, bx: number, by: number, bw: number, bh: number, blink: boolean, bobY: number = 0, tilt: number = 0) => {
    const flyImg = flyCatRef.current
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    if (flyImg && flyCatLoadedRef.current) {
      const scale = Math.max(bw / flyImg.naturalWidth, bh / flyImg.naturalHeight)
      const dw = flyImg.naturalWidth * scale
      const dh = flyImg.naturalHeight * scale
      const dx = bx + (bw - dw) / 2
      const dy = by + (bh - dh) / 2 + bobY
      const cx = bx + bw / 2
      const cy = by + bh / 2 + bobY
      if (tilt !== 0) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(tilt)
        ctx.drawImage(flyImg, -dw / 2, -dh / 2, dw, dh)
        ctx.restore()
      } else {
        ctx.drawImage(flyImg, dx, dy, dw, dh)
      }
      return
    }
    const sorted = [...partsRef.current].sort((a, b) => a.zIndex - b.zIndex)
    for (const part of sorted) {
      if (!part.img) continue
      if (part.src.endsWith("cat-eyes.png") && blink) continue
      const pw = part.wPct * bw
      const ph = part.hPct > 0 ? part.hPct * bh : pw * (part.img.naturalHeight / part.img.naturalWidth)
      const px = bx + part.leftPct * bw
      const py = by + part.topPct * bh + bobY
      ctx.drawImage(part.img, px, py, pw, ph)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      catXRef.current = rect.width / 2
    }
    resize()
    window.addEventListener("resize", resize)

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (stateRef.current !== "playing") return
      const rect = canvas.getBoundingClientRect()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      catXRef.current = Math.max(CAT_W / 2, Math.min(rect.width - CAT_W / 2, clientX - rect.left))
    }

    canvas.addEventListener("mousemove", onPointerMove)
    canvas.addEventListener("touchmove", onPointerMove, { passive: true })
    canvas.addEventListener("touchstart", onPointerMove, { passive: true })

    let lastTime = performance.now()

    const loop = (time: number) => {
      const rawDt = time - lastTime
      lastTime = time
      const dt = Math.min(rawDt, MAX_DT) // Cap delta to prevent huge spikes
      const w = canvas.width
      const h = canvas.height
      let lastCatX = catXRef.current

      ctx.clearRect(0, 0, w, h)

      if (stateRef.current === "playing" && Math.random() < 0.4) {
        streaksRef.current.push({
          x: Math.random() * w,
          y: -50,
          length: 20 + Math.random() * 40,
          speed: 4 + Math.random() * 3,
          alpha: 0.3 + Math.random() * 0.4,
        })
        if (streaksRef.current.length > 20) streaksRef.current.shift()
      }

      const streaks = streaksRef.current
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i]
        s.y += s.speed
        if (s.y > h + s.length) {
          streaks[i] = streaks[streaks.length - 1]
          streaks.pop()
          continue
        }
        ctx.strokeStyle = `rgba(255, 200, 100, ${s.alpha * 0.5})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x, s.y + s.length)
        ctx.stroke()
      }

      const shake = shakeRef.current
      if (shake > 0) {
        ctx.save()
        ctx.translate(
          (Math.random() - 0.5) * shake * 2,
          (Math.random() - 0.5) * shake * 2
        )
        shakeRef.current = Math.max(0, shake - 0.5)
      }

      if (stateRef.current === "playing") {
        elapsedRef.current += dt

        if (invulnRef.current > 0) invulnRef.current -= dt

        const baseZoom = 1
        const maxZoom = 1.8
        const zoomSteps = Math.floor(prevTierRef.current / 5)
        const targetZoom = baseZoom + zoomSteps * 0.1
        const targetRotation = elapsedRef.current > 8500 ? Math.sin((elapsedRef.current - 8500) / 4000) * 6 : 0
        ;(window as any).__gameZoom = targetZoom
        ;(window as any).__gameRotation = targetRotation

        const { spawnMs } = getDifficulty()
        lastSpawnRef.current += dt
        if (lastSpawnRef.current >= spawnMs) {
          lastSpawnRef.current = 0
          const baseWave = getWaveCount(scoreRef.current)
          const extraMeteors = Math.floor(prevTierRef.current / 4)
          const waveCount = baseWave + extraMeteors
          for (let i = 0; i < waveCount; i++) {
            setTimeout(() => spawnMeteor(w, h), i * 80)
          }
        }

        lastBurstRef.current += dt
        if (lastBurstRef.current >= 20000) {
          lastBurstRef.current = 0
          const burstCount = 5 + Math.floor(Math.random() * 4)
          for (let i = 0; i < burstCount; i++) {
            setTimeout(() => spawnMeteor(w, h), i * 60)
          }
          if (!muteRef.current) playSound(audioCtxRef.current, "combo")
        }

        const score = meteorCountRef.current
        let currentTier = 0
        let threshold = 10
        let gap = 10
        while (score >= threshold) {
          currentTier++
          gap = Math.min(gap + 10, 60)
          threshold += gap
        }
        if (currentTier > prevTierRef.current) {
          prevTierRef.current = currentTier
          levelFlashRef.current = 500
          if (currentTier >= 5) {
            blurFlickerRef.current = 800
          }
          if (currentTier % 5 === 0 && currentTier >= 5) {
            spawnFloatingText(w / 2, h * 0.35, "DANGER ZONE", "#FF0000", 32)
          } else {
            spawnFloatingText(w / 2, h * 0.35, "DIFICULT +", "#FF4444", 28)
          }
          if (!muteRef.current) playSound(audioCtxRef.current, "combo")
        }

        const catDrawX = catXRef.current - CAT_W / 2
        const catDrawY = h * 0.88 - CAT_H

        const hitboxPad = 6
        const hitX = catDrawX + hitboxPad
        const hitY = catDrawY + hitboxPad
        const hitW = CAT_W - hitboxPad * 2
        const hitH = CAT_H - hitboxPad * 2

        const meteors = meteorsRef.current
        const { gravity } = getDifficulty()
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i]
          const slowFactor = slowMoRef.current > 0 ? 0.4 : 1
          m.vy += gravity * slowFactor
          m.vx *= 0.993
          m.x += m.vx * slowFactor
          m.y += m.vy
          m.life += dt

          if (m.life > 100) {
            m.trail.push({ x: m.x, y: m.y })
            if (m.trail.length > MAX_TRAIL) m.trail.shift()
          }

          const isFalling = m.vy > 0
          const growT = Math.min(1, m.life / 800)
          const drawR = m.targetR * (0.3 + 0.7 * growT)
          m.r = drawR
          const alpha = Math.min(1, m.life / 200)

          for (let t = 0; t < m.trail.length; t++) {
            const tp = m.trail[t]
            const tProgress = (t + 1) / m.trail.length
            const tAlpha = tProgress * 0.7 * alpha
            const tR = drawR * 0.9 * tProgress
            ctx.globalAlpha = tAlpha
            ctx.beginPath()
            ctx.arc(tp.x, tp.y, tR, 0, Math.PI * 2)
            const tGrad = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tR * 2.5)
            tGrad.addColorStop(0, "rgba(255, 200, 50, 0.8)")
            tGrad.addColorStop(0.4, "rgba(243, 156, 18, 0.5)")
            tGrad.addColorStop(1, "rgba(211, 84, 0, 0)")
            ctx.fillStyle = tGrad
            ctx.fill()
          }

          ctx.globalAlpha = alpha
          if (m.life < 250) {
            const flashR = m.targetR * 1.5 * (1 - m.life / 250)
            ctx.beginPath()
            ctx.arc(m.x, m.y, flashR, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(255, 238, 0, 0.4)"
            ctx.fill()
          }

          const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, drawR * 1.5)
          grad.addColorStop(0, "#FFEE00")
          grad.addColorStop(0.3, "#F39C12")
          grad.addColorStop(0.6, "#D35400")
          grad.addColorStop(1, "rgba(211,84,0,0)")
          ctx.beginPath()
          ctx.arc(m.x, m.y, drawR * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()

          ctx.beginPath()
          ctx.arc(m.x, m.y, drawR * 0.65, 0, Math.PI * 2)
          ctx.fillStyle = "#8B4513"
          ctx.fill()

          ctx.beginPath()
          ctx.arc(m.x - drawR * 0.15, m.y - drawR * 0.15, drawR * 0.12, 0, Math.PI * 2)
          ctx.fillStyle = "#A0522D"
          ctx.fill()

          ctx.globalAlpha = 1

          if (m.y > h + m.targetR * 2 || m.x < -m.targetR * 3 || m.x > w + m.targetR * 3) {
            m.alive = false
            meteorCountRef.current++
            comboRef.current++
            displayComboRef.current = comboRef.current
            setDisplayCombo(comboRef.current)
            if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
            const comboBonus = Math.floor(comboRef.current / 5)
            const pointMult = doublePointsRef.current > 0 ? 2 : 1
            scoreRef.current += (1 + comboBonus) * pointMult
            setDisplayScore(scoreRef.current)
            playRandomDodgeSound()
            continue
          }

          if (invulnRef.current <= 0 && isFalling && m.life > 200) {
            const cx = Math.max(hitX, Math.min(m.x, hitX + hitW))
            const cy = Math.max(hitY, Math.min(m.y, hitY + hitH))
            const dist = Math.hypot(m.x - cx, m.y - cy)
            if (dist < m.r * 1.5) {
              m.alive = false
              meteorCountRef.current++
              if (shieldRef.current > 0) {
                shieldRef.current = 0
                spawnExplosion(m.x, m.y, 20, "#3498DB")
                spawnExplosion(m.x, m.y, 10, "#FFFFFF")
                if (!muteRef.current) playSound(audioCtxRef.current, "combo")
                continue
              }
              livesRef.current--
              setDisplayLives(livesRef.current)
              invulnRef.current = INVULNERABILITY_MS
              shakeRef.current = 8
              spawnExplosion(m.x, m.y, 14, "#F39C12")
              spawnExplosion(m.x, m.y, 8, "#E74C3C")
              comboRef.current = 0
              displayComboRef.current = 0
              setDisplayCombo(0)
              playRandomHitSound()
              if (livesRef.current <= 0) {
                endGame()
              }
              continue
            }
          }
        }

        const bobY = Math.sin(time / 300) * 3
        const catTilt = (catXRef.current - lastCatX) * 0.04
        catTiltRef.current = catTiltRef.current * 0.85 + catTilt * 0.15
        lastCatX = catXRef.current

        const catCenterX = catDrawX + CAT_W / 2
        const catCenterY = catDrawY + CAT_H / 2 + bobY
        catTrailRef.current.push({
          x: catCenterX + (Math.random() - 0.5) * CAT_W * 0.6,
          y: catCenterY + (Math.random() - 0.5) * CAT_H * 0.4,
          life: 0,
          maxLife: 25 + Math.random() * 15,
        })
        if (catTrailRef.current.length > 40) catTrailRef.current.shift()

        for (const p of catTrailRef.current) {
          p.life++
          p.y += 1.5
          if (p.life >= p.maxLife) continue
          const t = 1 - p.life / p.maxLife
          ctx.globalAlpha = t * 0.5
          ctx.fillStyle = "rgba(255, 200, 100, 0.6)"
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2 + t * 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1

        const filteredTrail = catTrailRef.current.filter(p => p.life < p.maxLife)
        catTrailRef.current = filteredTrail

        if (shieldRef.current > 0) {
          const sphereR = Math.max(CAT_W, CAT_H) * 0.65
          const pulse = 1 + Math.sin(time / 150) * 0.05
          const sR = sphereR * pulse
          const cx = catCenterX
          const cy = catCenterY
          const shieldGrad = ctx.createRadialGradient(cx, cy, sR * 0.7, cx, cy, sR)
          shieldGrad.addColorStop(0, "rgba(52, 152, 219, 0.15)")
          shieldGrad.addColorStop(0.7, "rgba(52, 152, 219, 0.4)")
          shieldGrad.addColorStop(1, "rgba(52, 152, 219, 0.8)")
          ctx.fillStyle = shieldGrad
          ctx.beginPath()
          ctx.arc(cx, cy, sR, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 + Math.sin(time / 200) * 0.2})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(cx, cy, sR, 0, Math.PI * 2)
          ctx.stroke()
          ctx.strokeStyle = `rgba(150, 220, 255, 0.3)`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(cx, cy, sR * 1.1, 0, Math.PI * 2)
          ctx.stroke()
        }

        if (gunRef.current > 0) {
          gunRef.current -= dt
          const gunBarSpeed = 5000 + gunLevelRef.current * 2000
          gunBarRef.current += dt / gunBarSpeed
          if (gunBarRef.current >= 1) {
            gunBarRef.current = 0
            gunLevelRef.current++
            levelFlashRef.current = 500
            spawnFloatingText(w / 2, h * 0.42, `LVL UP GUN LV${gunLevelRef.current}`, "#FFD700", 26)
            if (!muteRef.current) playSound(audioCtxRef.current, "combo")
          }
          const bulletCount = Math.min(gunLevelRef.current + 1, 8)
          if (Math.random() < 0.2) {
            const catCX = catDrawX + CAT_W / 2
            const spread = 12
            for (let b = 0; b < bulletCount; b++) {
              const offset = (b - (bulletCount - 1) / 2) * spread
              bulletsRef.current.push({
                x: catCX + offset,
                y: catDrawY,
                vy: -(7 + Math.random() * 2),
                r: 4,
                life: 0,
                alive: true,
              })
            }
          }
        }

        const bullets = bulletsRef.current
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i]
          b.y += b.vy
          b.life += dt
          if (b.y < -20 || b.life > 2000) {
            b.alive = false
            continue
          }
          ctx.fillStyle = "#FFD700"
          ctx.shadowColor = "#FFD700"
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0

          for (let j = meteors.length - 1; j >= 0; j--) {
            const m = meteors[j]
            if (!m.alive) continue
            const dist = Math.hypot(b.x - m.x, b.y - m.y)
            if (dist < m.r * 1.5 + b.r) {
              spawnExplosion(m.x, m.y, 12, "#FFD700")
              spawnExplosion(m.x, m.y, 8, "#F39C12")
              m.alive = false
              b.alive = false
              meteorCountRef.current++
              comboRef.current += 5
              displayComboRef.current = comboRef.current
              setDisplayCombo(comboRef.current)
              if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
              const comboBonus = Math.floor(comboRef.current / 5)
              const pointMult = doublePointsRef.current > 0 ? 2 : 1
              scoreRef.current += (5 + comboBonus) * pointMult
              setDisplayScore(scoreRef.current)
              spawnFloatingText(m.x, m.y - 30, "+5 COMBO!", "#FFD700", 32)
              if (!muteRef.current) playSound(audioCtxRef.current, "dodge")
              if (gunRef.current > 0) {
                gunBarRef.current += 0.12
                if (gunBarRef.current >= 1) {
                  gunBarRef.current = 0
                  gunLevelRef.current++
                  levelFlashRef.current = 500
                  spawnFloatingText(w / 2, h * 0.42, `LVL UP GUN LV${gunLevelRef.current}`, "#FFD700", 26)
                  if (!muteRef.current) playSound(audioCtxRef.current, "combo")
                }
              }
              break
            }
          }
        }

        if (levelFlashRef.current > 0) {
          levelFlashRef.current -= dt
          const flashAlpha = Math.min(0.3, levelFlashRef.current / 500 * 0.3)
          ctx.fillStyle = `rgba(255, 165, 0, ${flashAlpha})`
          ctx.fillRect(0, 0, w, h)
        }

        if (prevTierRef.current >= 5) {
          const blurColor = getBlurColor(prevTierRef.current)
          if (blurColor) {
            let finalAlpha = 1
            if (blurFlickerRef.current > 0) {
              blurFlickerRef.current -= dt
              finalAlpha = Math.sin(blurFlickerRef.current / 50) > 0 ? 1 : 0.2
            }
            ctx.globalAlpha = finalAlpha
            ctx.fillStyle = blurColor
            ctx.fillRect(0, 0, w, h)
            ctx.globalAlpha = 1
          }
        }

        drawCat(ctx, catDrawX, catDrawY, CAT_W, CAT_H, invulnRef.current > 0 && Math.floor(time / 100) % 2 === 0, bobY, catTiltRef.current)

        if (slowMoRef.current > 0) slowMoRef.current -= dt
        if (doublePointsRef.current > 0) doublePointsRef.current -= dt
        if (shieldRef.current > 0) shieldRef.current -= dt

        const powerUps = powerUpsRef.current
        for (let i = powerUps.length - 1; i >= 0; i--) {
          const p = powerUps[i]
          p.vy += gravity * 0.5
          p.x += p.vx
          p.y += p.vy
          p.life += dt
          if (p.life > 50) {
            p.trail.push({ x: p.x, y: p.y })
            if (p.trail.length > 8) p.trail.shift()
          }
          const growT = Math.min(1, p.life / 400)
          p.r = p.targetR * (0.4 + 0.6 * growT)
          const pulse = 1 + Math.sin(p.life / 80) * 0.15
          const drawR = p.r * pulse

          for (let t = 0; t < p.trail.length; t++) {
            const tp = p.trail[t]
            const tProgress = (t + 1) / p.trail.length
            const tAlpha = tProgress * 0.5
            const tR = drawR * 0.8 * tProgress
            ctx.globalAlpha = tAlpha
            ctx.beginPath()
            ctx.arc(tp.x, tp.y, tR, 0, Math.PI * 2)
            ctx.fillStyle = p.type === "shield" ? "#3498DB" : p.type === "slow" ? "#9B59B6" : p.type === "heart" ? "#E91E63" : "#2ECC71"
            ctx.fill()
          }
          ctx.globalAlpha = 1

          const color = p.type === "shield" ? "#3498DB" : p.type === "slow" ? "#9B59B6" : p.type === "heart" ? "#E91E63" : "#2ECC71"
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, drawR * 1.5)
          grad.addColorStop(0, color)
          grad.addColorStop(0.6, color)
          grad.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.x, p.y, drawR * 1.5, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = "#FFFFFF"
          ctx.font = "bold 14px 'Courier New', monospace"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          const icon = p.type === "shield" ? "🛡" : p.type === "slow" ? "⏱" : p.type === "heart" ? "❤" : p.type === "gun" ? "🔫" : "×2"
          ctx.fillText(icon, p.x, p.y)

          if (p.y > h + p.targetR * 2 || p.x < -p.targetR * 3 || p.x > w + p.targetR * 3) {
            p.alive = false
            continue
          }

          const pHitX = catDrawX
          const pHitY = catDrawY
          const pHitW = CAT_W
          const pHitH = CAT_H
          if (p.x > pHitX - drawR && p.x < pHitX + pHitW + drawR &&
              p.y > pHitY - drawR && p.y < pHitY + pHitH + drawR) {
            spawnExplosion(p.x, p.y, 20, color)
            spawnExplosion(p.x, p.y, 10, "#FFFFFF")
            if (p.type === "shield") {
              shieldRef.current = 10000
            } else if (p.type === "slow") {
              slowMoRef.current = 3000
            } else if (p.type === "heart") {
              if (livesRef.current >= MAX_LIVES) {
                gunPointsRef.current += 4
                spawnFloatingText(p.x, p.y - 30, "+4 🔫 GUN!", "#FFD700", 22)
              } else {
                livesRef.current = Math.min(MAX_LIVES, livesRef.current + 1)
                setDisplayLives(livesRef.current)
                gunPointsRef.current += 4
                spawnFloatingText(p.x, p.y - 30, "+4 🔫 GUN!", "#FFD700", 22)
              }
            } else if (p.type === "double") {
              doublePointsRef.current = 8000
              gunPointsRef.current += 1
            } else if (p.type === "gun") {
              gunPointsRef.current += 4
              spawnFloatingText(p.x, p.y - 30, "+4 🔫 GUN!", "#FFD700", 22)
            } else {
              gunPointsRef.current += 1
            }
            if (gunPointsRef.current >= 8) {
              gunRef.current = 8000 + (gunLevelRef.current - 1) * 2000
              gunPointsRef.current = 0
              gunBarRef.current = 0
              spawnFloatingText(p.x, p.y - 50, "🔫 GUN ACTIVATED!", "#FFD700", 26)
            }
            comboRef.current++
            displayComboRef.current = comboRef.current
            setDisplayCombo(comboRef.current)
            if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
            scoreRef.current += 5
            setDisplayScore(scoreRef.current)
            if (!muteRef.current) playSound(audioCtxRef.current, "combo")
            p.alive = false
            continue
          }
        }

        lastPowerUpRef.current += dt
        const powerUpInterval = Math.max(3000, POWER_UP_BASE_INTERVAL - Math.floor(prevTierRef.current / 4) * 500)
        if (lastPowerUpRef.current >= powerUpInterval) {
          lastPowerUpRef.current = 0
          spawnPowerUp(w, h)
        }
      }

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        if (!p.alive) continue
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.life += 1
        const alpha = 1 - p.life / p.maxLife
        if (alpha <= 0) {
          p.alive = false
          continue
        }
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.globalAlpha = 1
      }

      if (stateRef.current === "playing") {
        ctx.font = "bold 18px Poppins, sans-serif"
        ctx.fillStyle = "#F39C12"
        ctx.textAlign = "left"
        ctx.fillText(`${lang.game_score}: ${scoreRef.current}`, 16, 32)

        ctx.textAlign = "right"
        for (let i = 0; i < MAX_LIVES; i++) {
          const hx = w - 16 - (MAX_LIVES - 1 - i) * 24
          const alive = i < livesRef.current
          drawHeart(ctx, hx - 9, 24, alive)
        }

        if (comboRef.current >= 2) {
          ctx.textAlign = "center"
          const comboText = `x${comboRef.current} COMBO`
          const cx = w / 2
          const cy = 120
          const pulse = 1 + Math.sin(time / 100) * 0.08
          ctx.save()
          ctx.translate(cx, cy)
          ctx.scale(pulse, pulse)
          ctx.font = "bold 22px 'Courier New', monospace"
          const textWidth = ctx.measureText(comboText).width
          const padX = 14
          const padY = 8
          const boxW = textWidth + padX * 2
          const boxH = 30 + padY
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
          ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH)
          ctx.strokeStyle = comboRef.current >= 10 ? "#FF00FF" : comboRef.current >= 5 ? "#FFD700" : "#00FF00"
          ctx.lineWidth = 2
          ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH)
          ctx.fillStyle = comboRef.current >= 10 ? "#FF00FF" : comboRef.current >= 5 ? "#FFD700" : "#00FF00"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(comboText, 0, 0)
          ctx.restore()
        }

        if (slowMoRef.current > 0 || doublePointsRef.current > 0 || shieldRef.current > 0 || gunRef.current > 0) {
          let pIdx = 0
          const drawPowerUp = (label: string, color: string, remaining: number) => {
            const px = w / 2 - 80 + pIdx * 65
            const py = 160
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
            ctx.fillRect(px - 25, py - 12, 50, 24)
            ctx.strokeStyle = color
            ctx.lineWidth = 1.5
            ctx.strokeRect(px - 25, py - 12, 50, 24)
            ctx.fillStyle = color
            ctx.font = "bold 11px 'Courier New', monospace"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(`${label} ${Math.ceil(remaining / 1000)}s`, px, py)
            pIdx++
          }
          if (slowMoRef.current > 0) drawPowerUp("⏱ SLOW", "#9B59B6", slowMoRef.current)
          if (doublePointsRef.current > 0) drawPowerUp("×2 POINTS", "#2ECC71", doublePointsRef.current)
          if (shieldRef.current > 0) drawPowerUp("🛡 SHIELD", "#3498DB", shieldRef.current)
          if (gunRef.current > 0) drawPowerUp(`🔫 LV${gunLevelRef.current}`, "#FFD700", gunRef.current)
        }

        ctx.textAlign = "left"
        ctx.font = "bold 14px 'Courier New', monospace"
        ctx.fillStyle = "#FFD700"
        ctx.fillText(`LV ${prevTierRef.current + 1}`, 16, 54)

        const gunBarTotalW = 180
        const gunBarX = (w - gunBarTotalW) / 2
        const gunBarY = h - 40
        const gunBarH = 10
        const pointW = (gunBarTotalW - 16) / 8
        const pointGap = 2
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
        ctx.fillRect(gunBarX, gunBarY, gunBarTotalW, gunBarH + 4)
        for (let i = 0; i < 8; i++) {
          const px = gunBarX + 4 + i * (pointW + pointGap)
          const filled = i < gunPointsRef.current
          ctx.fillStyle = filled ? "#FFD700" : "rgba(255, 215, 0, 0.2)"
          ctx.fillRect(px, gunBarY + 2, pointW, gunBarH)
          ctx.strokeStyle = "#FFD700"
          ctx.lineWidth = 1
          ctx.strokeRect(px, gunBarY + 2, pointW, gunBarH)
        }
        ctx.font = "bold 10px 'Courier New', monospace"
        ctx.fillStyle = "#FFFFFF"
        ctx.textAlign = "center"
        if (gunRef.current > 0) {
          ctx.fillText(`🔫 LV${gunLevelRef.current} — ${Math.ceil(gunRef.current / 1000)}s`, w / 2, gunBarY - 4)
        } else {
          ctx.fillText(`🔫 ${gunPointsRef.current}/8  LV${gunLevelRef.current}`, w / 2, gunBarY - 4)
        }

        const diffBarX = 16
        const diffBarY = 80
        const diffBarW = 100
        const diffBarH = 6
        const nextThreshold = (() => {
          let t = 10
          let g = 10
          while (meteorCountRef.current >= t) { g = Math.min(g + 10, 60); t += g }
          return t
        })()
        const prevThreshold = (() => {
          let t = 10
          let g = 10
          while (t + g <= meteorCountRef.current) { g = Math.min(g + 10, 60); t += g }
          return t
        })()
        const diffProgress = nextThreshold > prevThreshold
          ? (meteorCountRef.current - prevThreshold) / (nextThreshold - prevThreshold)
          : 0
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(diffBarX, diffBarY, diffBarW, diffBarH)
        ctx.fillStyle = "#FF4444"
        ctx.fillRect(diffBarX, diffBarY, diffBarW * Math.min(1, diffProgress), diffBarH)
        ctx.strokeStyle = "#FF4444"
        ctx.lineWidth = 1
        ctx.strokeRect(diffBarX, diffBarY, diffBarW, diffBarH)
        ctx.font = "bold 8px 'Courier New', monospace"
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(`DIFF`, diffBarX + diffBarW + 6, diffBarY + 6)
      }

      const floats = floatingTextsRef.current
      for (let i = floats.length - 1; i >= 0; i--) {
        const ft = floats[i]
        ft.life++
        ft.y -= 0.6
        if (ft.life >= ft.maxLife) {
          floats[i] = floats[floats.length - 1]
          floats.pop()
          continue
        }
        const progress = ft.life / ft.maxLife
        const alpha = progress < 0.15 ? progress / 0.15 : 1 - ((progress - 0.15) / 0.85)
        const pulse = 1 + Math.sin(ft.life / 6) * 0.15
        const scale = ft.size > 24 ? pulse * 1.1 : pulse
        ctx.save()
        ctx.translate(ft.x, ft.y)
        ctx.scale(scale, scale)
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.font = `bold ${ft.size}px 'Courier New', monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.strokeStyle = "rgba(0,0,0,0.9)"
        ctx.lineWidth = 4
        ctx.strokeText(ft.text, 0, 0)
        ctx.shadowColor = ft.color
        ctx.shadowBlur = 12
        ctx.fillStyle = ft.color
        ctx.fillText(ft.text, 0, 0)
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
        ctx.restore()
      }

      if (shake > 0) ctx.restore()

      // Compaction: remove dead entities every 30 frames
      if (Math.floor(time / 500) % 2 === 0) {
        meteorsRef.current = meteorsRef.current.filter(m => m.alive)
        bulletsRef.current = bulletsRef.current.filter(b => b.alive)
        particlesRef.current = particlesRef.current.filter(p => p.alive)
        powerUpsRef.current = powerUpsRef.current.filter(p => p.alive)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      stopPixelMusic()
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", onPointerMove)
      canvas.removeEventListener("touchmove", onPointerMove)
      canvas.removeEventListener("touchstart", onPointerMove)
    }
  }, [getDifficulty, spawnMeteor, spawnExplosion, endGame, drawCat, lang, playRandomHitSound, playRandomDodgeSound, spawnPowerUp, spawnFloatingText])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9998] w-screen h-screen overflow-hidden"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
        <button
          onClick={() => {
            const newMuted = !muted
            setMuted(newMuted)
            muteRef.current = newMuted
          }}
          className="w-8 h-8 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center text-sm transition-colors"
          aria-label={muted ? "Unmute SFX" : "Mute SFX"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          onClick={() => {
            const newMuted = !musicMuted
            setMusicMuted(newMuted)
            musicMutedRef.current = newMuted
            if (newMuted) {
              stopPixelMusic()
            } else if (audioCtxRef.current) {
              musicStopFn = startPixelMusic(audioCtxRef.current)
            }
          }}
          className="w-8 h-8 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center text-sm transition-colors"
          aria-label={musicMuted ? "Unmute Music" : "Mute Music"}
        >
          {musicMuted ? "🎵" : "🎶"}
        </button>
        <button
          onClick={() => {
            stopPixelMusic()
            onClose()
          }}
          className="w-8 h-8 rounded-full bg-black/70 text-white hover:bg-red-600 hover:text-white flex items-center justify-center text-sm font-bold transition-colors border border-white/20"
        >
          ✕
        </button>
      </div>

      <button
        onClick={() => {
          stopPixelMusic()
          onClose()
        }}
        className="absolute bottom-3 left-3 z-30 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-sc-primary hover:bg-sc-primary/80 shadow-lg flex items-center gap-1.5 sm:gap-2 transition-colors"
      >
        ← {lang.game_close}
      </button>

      {gameState === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 gap-6">
          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-sc-primary to-sc-accent shadow-lg shadow-sc-primary/40 hover:scale-105 transition-transform active:scale-95"
          >
            🎮 {lang.game_play}
          </button>

          <div className="w-72 max-h-60 overflow-y-auto rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
            {loadingScores ? (
              <div className="p-4 text-center text-sc-muted text-sm">...</div>
            ) : scores.length === 0 ? (
              <div className="p-4 text-center text-sc-muted text-sm">—</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-sc-muted border-b border-white/10">
                    <th className="py-2 px-3 text-left font-medium">#</th>
                    <th className="py-2 px-3 text-left font-medium">{lang.game_name}</th>
                    <th className="py-2 px-3 text-right font-medium">{lang.game_points}</th>
                    <th className="py-2 px-3 text-right font-medium">Combo</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-2 px-3 text-sc-accent font-bold">{i + 1}</td>
                      <td className="py-2 px-3 text-white truncate max-w-[120px]">{s.name}</td>
                      <td className="py-2 px-3 text-right text-sc-primary font-bold">{s.score}</td>
                      <td className="py-2 px-3 text-right text-sc-accent font-bold">x{s.max_combo || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
          <h2 className="text-3xl font-black text-white mb-2">{lang.game_over}</h2>
          <p className="text-xl text-sc-accent font-bold mb-1">
            {lang.game_score}: {displayScore}
          </p>
          <p className="text-sm text-white/70 mb-6 font-mono">
            Max Combo: x{maxComboRef.current}
          </p>
          <div className="flex flex-col items-center gap-3 w-64">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={lang.game_enter_name}
              maxLength={20}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-sc-primary text-center"
            />
            <button
              onClick={saveScore}
              disabled={saving || !playerName.trim()}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-white bg-sc-primary hover:bg-sc-primary/80 transition-colors disabled:opacity-50"
            >
              {saving ? lang.game_saving : lang.game_save}
            </button>
            {saveError && <p className="text-xs text-red-400">{lang.game_error}</p>}
            <button
              onClick={showScoreboard}
              className="text-sm text-sc-muted hover:text-sc-primary transition-colors"
            >
              {lang.game_scoreboard}
            </button>
            <button
              onClick={() => {
                stopPixelMusic()
                onClose()
              }}
              className="mt-2 px-6 py-2 rounded-xl font-medium text-sm text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              ← {lang.game_close}
            </button>
          </div>
        </div>
      )}

      {gameState === "scoreboard" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">🏆 {lang.game_scoreboard}</h2>
          <div className="w-72 max-h-80 overflow-y-auto rounded-xl bg-sc-card/80 border border-white/10">
            {loadingScores ? (
              <div className="p-6 text-center text-sc-muted text-sm">...</div>
            ) : scores.length === 0 ? (
              <div className="p-6 text-center text-sc-muted text-sm">—</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-sc-muted border-b border-white/10">
                    <th className="py-2 px-3 text-left font-medium">#</th>
                    <th className="py-2 px-3 text-left font-medium">{lang.game_name}</th>
                    <th className="py-2 px-3 text-right font-medium">{lang.game_points}</th>
                    <th className="py-2 px-3 text-right font-medium">Combo</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-2 px-3 text-sc-accent font-bold">{i + 1}</td>
                      <td className="py-2 px-3 text-white truncate max-w-[120px]">{s.name}</td>
                      <td className="py-2 px-3 text-right text-sc-primary font-bold">{s.score}</td>
                      <td className="py-2 px-3 text-right text-sc-accent font-bold">x{s.max_combo || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                stopPixelMusic()
                onClose()
              }}
              className="px-6 py-2 rounded-xl font-medium text-sm text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              ← {lang.game_close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
