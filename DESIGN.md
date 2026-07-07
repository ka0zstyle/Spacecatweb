---
name: SpaceCatWeb
description: Web agency brand site — cosmic, warm, professional
colors:
  primary: "#D35400"
  primary-light: "#E67E22"
  primary-dark: "#A04000"
  accent: "#F39C12"
  dark: "#1a1a1a"
  surface: "#2d2d2d"
  card: "#3a3a3a"
  muted: "#b8b8b8"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0.2em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-light}"
    textColor: "#ffffff"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input-default:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm} {spacing.md}"
---

# Design System: SpaceCatWeb

## 1. Overview

**Creative North Star: "The Cosmic Workshop"**

SpaceCatWeb's design lives at the intersection of deep space and warm firelight. A dark, infinite backdrop (near-black) punctuated by a glowing orange star — the brand's signature naranja. The feel is exploratory but grounded, playful but precise. Like a mission control room designed by a cat. This system explicitly rejects the generic AI landing page aesthetic: no cream backgrounds, no Fraunces/Inter font stacks, no gradient text decoration, no glassmorphism as default, no numbered section markers as scaffolding.

**Key Characteristics:**
- Dark and warm: near-black backgrounds with orange accents, not cool blues
- One signature moment: the hero (video + cat + canvas dissolve) carries the brand's ambition
- Typography carries weight: bold display faces, intentional contrast
- Motion is purposeful: loaded entrance sequence, scroll-triggered reveals, hover feedback
- Cards are varied, not an identical grid

## 2. Colors

A warm-dark palette anchored by a burnt orange primary. The background is near-black, surfaces step up through dark grays, and the accent pops at key interaction points.

### Primary
- **Naranja** (#D35400): The brand color. Used for primary buttons, active nav, key accents, and the hero signature. Not used as a decorative wash.
- **Naranja Claro** (#E67E22): Hover state for buttons and interactive elements.
- **Naranja Oscuro** (#A04000): Depressed / active state, deeper sections.

### Accent
- **Gold Spark** (#F39C12): Secondary accent for portfolio highlights, pricing badges, and small decorative touches. Always used sparingly.

### Neutral
- **Void** (#1a1a1a): The default background. Near-black with warmth.
- **Eclipse** (#2d2d2d): Surface background for sections, cards, and raised containers.
- **Ash** (#3a3a3a): Card and elevated surface backgrounds. Subtle distinction from Eclipse.
- **Echo** (#b8b8b8): Muted text, secondary information, placeholder content.
- **White** (#ffffff): Primary text and headings.

### Named Rules
**The Ember Rule.** The naranja primary is used on ≤15% of any given screen. Its warmth is the point; dilution kills the metaphor.

## 3. Typography

**Display Font:** Poppins (900 weight, system-ui, sans-serif fallback)
**Body Font:** Poppins (400 weight, system-ui, sans-serif fallback)

**Character:** Bold, geometric, slightly compressed. Poppins at 900 weight delivers the confident, modern feel the agency needs. Single-family system with dramatic weight contrast between display (900) and body (400).

### Hierarchy
- **Display** (900, `clamp(2.5rem, 7vw, 4.5rem)`, 1.0, -0.03em): Hero titles (SPACE / CAT / WEB). Used only there — the density is deliberate.
- **Headline** (700, `clamp(1.75rem, 4vw, 3rem)`, 1.15): Section headings. Bold but not shouting.
- **Title** (600, `clamp(1.125rem, 2.5vw, 1.5rem)`, 1.3): Card titles, feature headings.
- **Body** (400, `1rem`, 1.7): Paragraphs. Max line length 65–75ch.
- **Label** (500, `0.875rem`, 0.2em uppercase): Eyebrow labels, section kickers, nav items.

### Named Rules
**The Single-Family Rule.** Poppins in all roles. The weight contrast (900 → 400) provides hierarchy without a second typeface. If a second face is ever added, it must contrast on personality axis (e.g. serif), not similarity.

## 4. Elevation

The system uses tonal layering for depth, not shadows. Backgrounds step from Void (deepest) → Eclipse → Ash (shallowest) to create hierarchy. Shadows are limited to interactive feedback: buttons and hovered cards get a subtle orange-tinted glow (`0 0 20px rgba(211, 84, 0, 0.3)`).

### Shadow Vocabulary
- **Interactive glow** (`0 0 20px rgba(211,84,0,0.3)`): Hover state on primary buttons and elevated cards.
- **Modal shadow** (`0 25px 50px rgba(0,0,0,0.4)`): Full-screen overlays, chat panel.

## 5. Components

### Buttons
- **Shape:** Gently rounded (12px radius)
- **Primary:** Naranja (`#D35400`) background, white text, 12px 24px padding. Hover shifts to Naranja Claro (`#E67E22`) with a subtle glow. Active depresses to Naranja Oscuro (`#A04000`).
- **Ghost / Secondary:** Transparent background, white/`#b8b8b8` text, white border at 10% opacity on hover. Used in nav and secondary CTAs.

### Cards
- **Corner Style:** Moderately rounded (12-16px radius)
- **Background:** Ash (`#3a3a3a`) at 50% opacity, with 5% white border
- **Internal Padding:** 24px
- **Shadow Strategy:** No resting shadow. On hover, subtle orange glow and `-translateY(1px)` lift.

### Navigation
- **Style:** Fixed top bar, transparent at rest, dark blur backdrop on scroll
- **Typography:** Label style (14px, 0.2em tracking, medium weight)
- **States:** Default muted (`#b8b8b8`), hover white, active Naranja with underline indicator
- **Mobile:** Slide-in drawer from right, full-height, Ash background

### Inputs
- **Style:** Subtle inset stroke (white at 10% opacity), near-transparent background
- **Radius:** 8px
- **Focus:** Border shifts to Naranja, subtle glow
- **Error:** Red border, inline error message below

### Hero Section (Signature Component)
- **Layout:** Full viewport, video background with dark overlay, canvas overlay for pixel-dissolve effect
- **Elements:** "Web Design." subtitle fades in, SPACE/CAT/WEB split characters animate with 3D rotation + stagger, cat image enters with elastic bounce and continuous float + mouse repulsion
- **Scroll indicator:** Mouse icon with wheel animation at bottom
- **Motion:** Orchestrated 5-second entrance sequence (canvas dissolve → text fade → cat elastic → front text stagger → scroll indicator)

## 6. Do's and Don'ts

### Do:
- **Do** use the naranja primary sparingly (≤15% of screen) — its rarity is the point
- **Do** use tonal layering (Void → Eclipse → Ash) for depth instead of shadows
- **Do** vary card content — avoid identical icon + heading + text grids
- **Do** make motion intentional: one well-orchestrated entrance beats scattered micro-animations
- **Do** respect `prefers-reduced-motion` with static alternatives
- **Do** use `text-wrap: balance` on headings to prevent widows
- **Do** use semantic HTML and proper heading hierarchy

### Don't:
- **Don't** use gradient text (`background-clip: text` with gradient) — decorative, never meaningful
- **Don't** use glassmorphism (backdrop blur) as a default surface treatment
- **Don't** use numbered section markers (01 / 02 / 03) unless the content is actually sequential
- **Don't** use tiny uppercase tracked labels above every section heading — one deliberate kicker is voice, repeating it as section grammar is AI scaffolding
- **Don't** use `border-radius` larger than 16px on cards (12-16px max) — over-rounding is an AI tell
- **Don't** pair `border: 1px` with `box-shadow` with blur ≥16px on the same element (ghost-card pattern)
- **Don't** use cream/sand/beige backgrounds — the dark Void background is the brand
- **Don't** use Fraunces, Inter, Playfair Display, Cormorant, or DM Sans — training-data defaults
- **Don't** use bounce or elastic easing for UI transitions (ease-out-quart/quint/expo only)
- **Don't** use `transition: all` — list explicit properties
- **Don't** put gray text on colored backgrounds — use a shade of that color or transparency
- **Don't** create identical card grids — each card should have distinct content and structure
