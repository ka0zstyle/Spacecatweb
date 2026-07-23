# 📋 Auditoría y Hoja de Ruta — SpaceCatWeb (Next.js 16 / Tailwind v4 / Neon + Supabase + Resend + Telegram)

> **Stack real verificado en disco** (`package.json`, `AGENTS.md`, `next.config.ts`):
> Next.js **16.2.10** + React **19.2.4** + TypeScript **5** + Tailwind CSS **4** + GSAP + Resend + `@neondatabase/serverless` + `@supabase/supabase-js` + Playwright.
> **No existe** en el proyecto: Prisma, NextAuth, Cloudinary, React Hook Form, Zod, Shadcn/ui, ni rutas de tienda/carrito/orden. Cualquier hallazgo sobre esas librerías se omite por inexistente.
>
> **No se ha aplicado ningún cambio.** Este documento es solo una lista de tareas pendientes derivada de una auditoría estática.

---

## 🚨 Severidad Alta (Prioridad Inmediata & Seguridad)

- [ ] **[Seguridad / PII] — `app/api/contact/route.ts:85-97`**: El handler `GET` está **completamente abierto** y devuelve hasta 50 mensajes de contacto con nombre, email, país, WhatsApp, IP y contenido del mensaje a **cualquier visitante anónimo**. Es un endpoint público de leak de base de datos de leads.
  - *Causa*: El método `GET` se exportó para "verificar" si había mensajes, pero no tiene ninguna verificación de auth/CSRF/origen. Cualquier `curl /api/contact` exfil tra toda la base.
  - *Refactor propuesto*:
    ```typescript
    // app/api/contact/route.ts
    import { NextResponse, type NextRequest } from "next/server"
    import { Resend } from "resend"
    import sql from "@/lib/db"
    import { z } from "@/lib/validation" // ver item de Zod más abajo

    const resend = new Resend(process.env.RESEND_API_KEY)
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN // token largo, solo server-side

    const ContactSchema = z.object({
      name: z.string().min(1).max(100).trim(),
      email: z.string().email().max(255).trim(),
      country: z.string().min(2).max(50).trim(),
      whatsapp: z.string().min(9).max(20).trim().optional().nullable(),
      message: z.string().min(1).max(2000).trim(),
    })

    export async function POST(request: NextRequest) {
      const json = await request.json().catch(() => null)
      const parsed = ContactSchema.safeParse(json)
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 })
      }
      const { name, email, country, whatsapp, message } = parsed.data
      // …insertar con placeholders, escapar message en HTML, etc.
    }

    export async function GET(request: NextRequest) {
      // Sólo accesible para el admin con un token bearer
      const auth = request.headers.get("authorization")
      if (auth !== `Bearer ${ADMIN_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const rows = await sql`SELECT id, name, email, country, created_at
                             FROM contact_messages ORDER BY created_at DESC LIMIT 50`
      return NextResponse.json(rows)
    }
    ```

- [ ] **[Seguridad / Validación] — `app/api/contact/route.ts:62-77`**: El endpoint acepta **cualquier payload** sin validación, sin límite de tamaño, sin sanitización. El `message` se interpola **crudo** en una plantilla HTML que se envía por email (`<p>${message}</p>` en `route.ts:49`), abriendo vectores de **email-injection / XSS en cliente de correo**.
  - *Causa*: No hay parser (Zod/RHF/Valibot). El `await request.json()` en `route.ts:64` además **no** tiene `.catch(() => null)` como el resto de rutas, así que un body inválido crashea sin respuesta útil.
  - *Refactor propuesto*:
    ```typescript
    function escapeHtml(s: string): string {
      return s.replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
      )
    }

    const safeMessage = escapeHtml(parsed.data.message)
    await resend.emails.send({
      from: "SpaceCatWeb <no-reply@spacecatweb.com>", // dominio verificado, no resend.dev
      to: "spacecatweb@gmail.com",
      subject: `Nuevo mensaje de ${escapeHtml(parsed.data.name)}`,
      html: `<h2>Nuevo mensaje</h2>
             <p><strong>Nombre:</strong> ${escapeHtml(parsed.data.name)}</p>
             <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
             <p><strong>Mensaje:</strong></p>
             <pre>${safeMessage}</pre>`,
      replyTo: parsed.data.email,
    })
    ```

- [ ] **[Seguridad / Abuso de relay] — `app/api/contact/route.ts:34-53`**: `from: "SpaceCatWeb <onboarding@resend.dev>"` usa el dominio sandbox de Resend, lo que **(a)**将被 marca como spam, **(b)** permite a cualquier atacante usar tu endpoint como **open relay** simplemente poniendo la dirección de la víctima en el campo `email`.
  - *Causa*: No se ha verificado un dominio propio en Resend y no se valida que `email` no pertenezca a tu propio dominio.
  - *Solución*:
    1. Verificar `spacecatweb.com` en Resend y enviar desde `no-reply@spacecatweb.com`.
    2. Rechazar `email` que coincida con tu propio dominio (`@spacecatweb.com`) antes de enviar.

- [ ] **[Async / Confiabilidad] — `app/api/telegram/route.ts:8`**: `const pendingReplies = new Map<string, ...>()` vive en el **scope del módulo**. En serverless/edge (Vercel, Netlify, Cloudflare) **se reinicia en cada cold start y no se comparte entre instancias**, por lo que el flujo de "presionar botón `reply:` → escribir respuesta" **falla silenciosamente** en producción. Los comandos manuales `/r` siguen funcionando porque hacen lookup en BD, pero el flujo UX inline-keyboard no.
  - *Causa*: Estado en memoria mutable compartida entre invocaciones. Patrón no válido para serverless.
  - *Refactor propuesto*:
    ```typescript
    // Reemplazar el Map por una tabla persistente en Neon:
    // CREATE TABLE pending_replies (
    //   chat_id     TEXT PRIMARY KEY,
    //   short_id    TEXT NOT NULL,
    //   name        TEXT NOT NULL,
    //   created_at  TIMESTAMPTZ DEFAULT NOW()
    // );

    // app/api/telegram/route.ts (POST, callback "reply:")
    await sql`
      INSERT INTO pending_replies (chat_id, short_id, name)
      VALUES (${fromChatId}, ${shortId}, ${name})
      ON CONFLICT (chat_id) DO UPDATE SET short_id = EXCLUDED.short_id, name = EXCLUDED.name
    `

    // en el branch de mensaje normal:
    const [row] = await sql`DELETE FROM pending_replies WHERE chat_id = ${fromChatId} RETURNING short_id`
    const shortId = row?.short_id ?? null
    ```

- [ ] **[Seguridad / IP spoofing] — `app/api/chat/session/route.ts:4-12`** y `app/api/contact/route.ts:55-60`**: Se confía ciegamente en los headers `x-forwarded-for`, `x-real-ip`, `x-vercel-forwarded-for`. Un atacante puede falsificar cualquiera de ellos y, peor, en `app/api/chat/session/route.ts:17-39` el **`visitorId` del cuerpo es el único token de acceso** a la sesión — quien lo conozca puede leer/escribir cualquier chat. Un cliente malicioso puede simplemente inventar `visitorId`s ajenos.
  - *Causa*: Autenticación por "yo digo quién soy". No hay sesión firmada ni cookie httpOnly ni token.
  - *Solución*:
    1. Generar `visitorId` server-side y devolverlo en una cookie `httpOnly; secure; sameSite=strict`.
    2. En la API, leerlo de la cookie (no del body).
    3. Normalizar el IP solo del primer hop de `x-forwarded-for` y verificar que el despliegue añade un proxy de confianza (Vercel/Cloudflare). No leer `x-real-ip` a ciegas.

- [ ] **[Seguridad / Headers] — `middleware.ts`** y `next.config.ts`**: No hay **ningún header de seguridad** en toda la app: sin `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. El middleware solo fuerza HTTPS en producción y excluye `/api`.
  - *Causa*: `middleware.ts:17-19` excluye explícitamente `/api` y no añade headers en ningún path.
  - *Refactor propuesto*:
    ```typescript
    // middleware.ts
    import { NextResponse } from "next/server"
    import type { NextRequest } from "next/server"

    const securityHeaders = {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
      "Content-Security-Policy":
        "default-src 'self'; img-src 'self' data: https:; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "script-src 'self' 'unsafe-inline' https://api.telegram.org; " +
        "connect-src 'self' https://api.telegram.org; " +
        "frame-ancestors 'none'",
    }

    export function middleware(request: NextRequest) {
      const response = NextResponse.next()
      for (const [k, v] of Object.entries(securityHeaders)) response.headers.set(k, v)
      if (process.env.NODE_ENV !== "development") {
        const proto = request.headers.get("x-forwarded-proto")
        if (proto === "http") {
          const url = request.nextUrl
          url.protocol = "https:"
          return NextResponse.redirect(url, 301)
        }
      }
      return response
    }

    export const config = {
      matcher: "/((?!_next/static|_next/image|favicon.ico).*)", // quitar la exclusión de /api
    }
    ```

- [ ] **[Seguridad / Abuso] — Todas las rutas `app/api/**`**: **No hay rate limit en ningún endpoint**. `app/api/scores/route.ts:20-42` acepta cualquier número de POST; `app/api/contact/route.ts:62-83` puede ser inundado de leads basura; `app/api/chat/session/route.ts:14-62` puede crear sesiones infinitas; el webhook de Telegram reenvía cada actualización a tu BD.
  - *Causa*: Ausencia total de rate limiting.
  - *Solución*: Rate limit por IP en `middleware.ts` o en cada route handler (Upstash Ratelimit / `@vercel/edge-rate-limit`). Mínimo: 5 req/min a `/api/contact`, 30 req/min a `/api/chat/*`, 10 req/min a `/api/scores` POST.

- [ ] **[Async / Manejo de promesas] — `app/api/chat/session/[sessionId]/stream/route.ts:7-15`**: La función `sleep` hace `Promise.reject(new Error("aborted"))` cuando el cliente aborta. En un `while (!request.signal.aborted)` esto se captura en el `try/catch` del loop, **pero** en algunas versiones de Node ese `reject` puede generar un `unhandledRejection` y tumbar el worker.
  - *Causa*: Patrón de cancelación con `reject` en vez de `return` controlado.
  - *Refactor propuesto*:
    ```typescript
    function sleep(ms: number, signal: AbortSignal): Promise<void> {
      return new Promise((resolve) => {
        if (signal.aborted) return resolve()
        const t = setTimeout(resolve, ms)
        signal.addEventListener("abort", () => { clearTimeout(t); resolve() }, { once: true })
      })
    }

    while (!request.signal.aborted) {
      // …DB reads…
      await sleep(POLL_MS, request.signal)
    }
    controller.close()
    ```

- [ ] **[DB / Fail-fast] — `lib/db.ts:3`**: `neon(process.env.DATABASE_URL!)` usa `!` (non-null assertion) y se ejecuta en el **módulo** (carga eager). Si `DATABASE_URL` no está, falla en **request time** con un error críptico, no en startup. Tampoco hay validación de que el `DATABASE_URL` apunte al entorno correcto.
  - *Causa*: Inicialización perezosa implícita sin guard.
  - *Refactor propuesto*:
    ```typescript
    // lib/db.ts
    import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

    function getSql(): NeonQueryFunction<false, false> {
      const url = process.env.DATABASE_URL
      if (!url) throw new Error("DATABASE_URL is not configured")
      return neon(url)
    }

    // Proxy que valida en cada llamada (cuesta 1 lookup por invocación pero fail-fast)
    const sql = new Proxy({} as NeonQueryFunction<false, false>, {
      get: (_, prop) => (Reflect.get(getSql(), prop)),
    })
    export default sql as NeonQueryFunction<false, false>
    ```

---

## ⚠️ Severidad Media (Optimización Next.js, Tailwind v4 & SEO)

- [ ] **[SEO / I18n] — `app/layout.tsx:12`**: `<html lang="es">` está **hardcodeado** y no cambia cuando el usuario navega a `?lang=en`. `components/layout/Shell.tsx:23-25` lo arregla vía `useEffect`, lo que **provoca un flash de idioma incorrecto en el primer paint y un mismatch de hidratación** entre SSR (`es`) y cliente (`en`).
  - *Causa*: El locale vive en `searchParams` (cliente) pero el `<html>` es server-rendered.
  - *Refactor propuesto*:
    ```typescript
    // app/layout.tsx
    export default async function RootLayout({
      children,
      params,
    }: { children: ReactNode; params: Promise<{ lang?: string }> }) {
      const { lang } = await params
      return (
        <html lang={lang === "en" ? "en" : "es"} className="scroll-smooth overflow-x-hidden">
          {/* … */}
        </html>
      )
    }
    ```
    Y mover el control de idioma a path-based (`/en/...`) en vez de query-string.

- [ ] **[SEO / Canonical] — `app/page.tsx:36`, `app/blog/page.tsx:25`, `app/blog/[slug]/page.tsx:37`**: El `canonical` usa **`?lang=en`** como URL canónica. Google desaconseja query params para contenido multilingüe; prefiere paths separados (`/en/`) o `hreflang` con URLs distintas sin query.
  - *Solución*: Mover la internacionalización a segmentos de path `/[lang]/...` o usar `alternates.languages` sin query (lo que implicaría `x-default: /` y `en: /en/...`).

- [ ] **[SEO / Sitemap] — `app/sitemap.ts:7-20`**: `lastModified: new Date()` para **todos** los posts del blog es la hora de build. Cada vez que se redespliega, todos los posts parecen recién modificados. Debe usar la fecha real del post.
  - *Refactor propuesto*:
    ```typescript
    import { posts } from "@/lib/blog-data"
    const blogPages = posts.flatMap((p) => [
      { url: `${baseUrl}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "monthly" as const, priority: 0.7 },
      // …
    ])
    ```
    **Pero antes** hay que migrar `BlogPost.date` de `"Jun 15, 2026"` a ISO 8601 (`new Date().toISOString()`), ver item siguiente.

- [ ] **[SEO / Datos] — `lib/blog-data.ts:13-360`**: El campo `date` es un **string en formato humano** (`"Jun 15, 2026"`) no parseable por `new Date()`. Eso rompe `sitemap.ts`, `generateMetadata.publishedTime` y futuros feeds RSS.
  - *Solución*: Cambiar el tipo a `date: string` con formato ISO (`"2026-06-15"`) o `Date` y formatearlo en la UI con `Intl.DateTimeFormat`.

- [ ] **[SEO / Structured Data] — `app/page.tsx:82-105`**: Solo hay JSON-LD de `WebSite`. **Falta** `Article`/`BlogPosting` en los posts (`app/blog/[slug]/page.tsx`), `Person`/`Organization` consistente, y `BreadcrumbList`. Tampoco hay `openGraph.images` con width/height explícitos.
  - *Refactor propuesto*:
    ```typescript
    // app/blog/[slug]/page.tsx (dentro de generateMetadata o del componente)
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: localized.title,
      description: localized.excerpt,
      datePublished: new Date(post.date).toISOString(),
      author: { "@type": "Person", name: post.author, url: baseUrl },
      publisher: { "@type": "Organization", name: "SpaceCatWeb", url: baseUrl, logo: { "@type": "ImageObject", url: `${baseUrl}/assets/images/spacecatweblogo.png` } },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/blog/${slug}` },
      inLanguage: typedLang,
    }
    // inyectar con <Script id="schema-article" type="application/ld+json" … />
    ```

- [ ] **[Performance / LCP] — `next.config.ts:5`**: `images: { unoptimized: true }` desactiva **completamente** la optimización de imágenes de Next.js (sin `srcset` responsive, sin AVIF/WebP automático, sin `placeholder="blur"`). Combinado con que **ningún componente** del proyecto usa `next/image` (todos son `<img>` planos — `Header.tsx:86-90`, `Footer.tsx:31-35`, `LanguageSplash.tsx:227-238`, `HeroSection.tsx:862-907`, etc.), el LCP del logo `SpaceCatWeb.webp` y del video hero `space.mp4` se paga íntegro en cada dispositivo.
  - *Causa*: Probable workaround para evitar problemas con un dominio, pero sacrifica toda la cadena de optimización.
  - *Refactor propuesto*:
    ```ts
    // next.config.ts
    const nextConfig: NextConfig = {
      images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      },
      // …
    }
    ```
    Y reemplazar `<img src="/assets/images/SpaceCatWeb.webp" />` por:
    ```tsx
    import Image from "next/image"
    <Image src="/assets/images/SpaceCatWeb.webp" alt="SpaceCatWeb" width={210} height={60}
           priority sizes="(min-width: 1024px) 160px, 120px" className="h-10 w-auto" />
    ```

- [ ] **[Performance / Fonts] — `app/layout.tsx:14-19`**: Las fuentes de Google se cargan con un `<link rel="stylesheet">` **render-blocking**, sin `font-display: swap` declarado en el HTML (lo infiere Google pero el CSS aún bloquea). Causa FOUT visible y lasta LCP.
  - *Refactor propuesto*:
    ```tsx
    // app/layout.tsx
    import { Poppins } from "next/font/google"
    const poppins = Poppins({ subsets: ["latin"], weight: ["400","500","600","700","900"], display: "swap", variable: "--font-poppins" })
    // …
    <html lang="es" className={`${poppins.variable} scroll-smooth overflow-x-hidden`}>
      <body className={`${poppins.className} antialiased`}>…</body>
    </html>
    ```
    Y eliminar la etiqueta `<link>` de Google Fonts.

- [ ] **[Performance / LCP] — `components/ui/initial-loader.tsx:9-15`**: Un `setTimeout(1200)` **garantiza 1.2 s de pantalla negra** antes de mostrar el sitio, incluso en cache hit. Lighthouse penaliza LCP y TBT.
  - *Causa*: UX-first que rompe performance-first.
  - *Solución*: Quitar el setTimeout o reducirlo a 200-400 ms, o mostrar la UI por SSR y dejar el loader solo como transición de salida.

- [ ] **[Performance / Video] — `components/ui/global-video-background.tsx:99-109`**: `<video autoPlay loop>` sin `poster`, sin `preload="none"`, sin fallback. Un dispositivo móvil paga los ~5-10 MB de `space.mp4` antes de poder siquiera renderizar texto.
  - *Causa*: Falta de progressive enhancement.
  - *Solución*:
    ```tsx
    <video autoPlay muted loop playsInline preload="metadata" poster="/assets/images/fondowall.webp">
      <source src="/assets/images/space.webm" type="video/webm" />
      <source src="/assets/images/space.mp4" type="video/mp4" />
    </video>
    ```
    Y servir `.webm` + reducir bitrate, o reemplazar por un `<Image>` con animación CSS para `prefers-reduced-motion`.

- [ ] **[Tailwind v4 / Bundle] — `app/globals.css:1050 líneas`**: El archivo contiene **~30 keyframes** (`hero-float-1/2`, `cat-float`, `marquee-left`, `glitchFlicker`, `textGlitch`, `neonFlicker`, `scanline`, `chromaShift`, `dataStream`, `pulseRing`, `floatUpDown`, `hero-scroll-wheel`, `gradientShift`, `colorPulse`, `sparkle-fly-up/down`, `holographicShimmer`, `meowWave`, `loading-bar`, `loading-logo-pulse`, `dot-blink`, `fade-in`, `gradient-shift`, `pulse-glow`, `palpitar`, `marquee-left`, `footer-gradient-shift`, `footer-shine`, `neonPulse`, `constellationPulse`, `gridFade`, `scanLine`, `dataStream`, `pulseRing`, `floatUpDown`). Muchos están duplicados (definidos 2 veces con la misma firma, ej. `hero-float-1` en líneas 126 y 633) o no se referencian en el JSX actual.
  - *Causa*: Iteración sin tree-shaking. El archivo creció sin auditoría.
  - *Solución*: Pasar por `grep "@keyframes" app/globals.css` y comparar contra el JSX real; eliminar los huérfanos. **No declarar la misma animación 2 veces** (CSS toma la última, pero el bundle se infla).

- [ ] **[Tailwind v4 / Tema] — `app/globals.css:26-46`**: Se redefinen `--eclipse`, `--ash`, `--echo` en `:root` cuando ya existen como `--color-sc-surface`, `--color-sc-card`, `--color-sc-muted` en `@theme inline` (líneas 4-24). El `eslint-plugin-tailwindcss` o el DevTools no van a poder mapearlos. Hay **dos fuentes de verdad** para el mismo color.
  - *Refactor propuesto*:
    ```css
    @theme inline {
      --color-sc-primary: #D35400;
      --color-sc-primary-light: #E67E22;
      /* …todos los tokens… */
    }
    /* NO redefinir en :root; usar var(--color-sc-surface) directamente */
    ```

- [ ] **[Tailwind v4 / Plugin] — `app/globals.css:2` + `package.json:23`**: `@import "tw-animate-css"` carga el plugin completo. Hay que verificar que las clases que aporta (`animate-in`, `fade-in`, etc.) se usen realmente; si no, quita la línea y la dependencia.
  - *Solución*: `grep -r "animate-in\\|fade-in-1\\|slide-in-from-" components app`; si 0 hits, remover la importación y la dep.

- [ ] **[Async / Async-await perdido] — `app/api/contact/route.ts:64`**: `await request.json()` sin `.catch(() => null)`. Si el body no es JSON, el endpoint **throw y cae al catch genérico** (`route.ts:80-82`) que solo devuelve 500. El usuario nunca sabe que su body era inválido.
  - *Refactor propuesto*:
    ```typescript
    const raw = await request.json().catch(() => null)
    if (!raw) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    ```

- [ ] **[Async / Race condition] — `components/chat/chat-bubble.tsx:180-214`**: `sendMessage` inserta un mensaje temporal con `id: tmp-${Date.now()}` y, si el POST falla, lo quita y restaura el `input`. Pero el `tempId` puede colisionar si el usuario envía dos mensajes en el mismo milisegundo (poco probable con el guard `sending`, pero el setMessages muta por `id === tempId` — si por cualquier motivo hay dos tempId iguales, se sobrescriben).
  - *Solución*: Usar `crypto.randomUUID()` para el `tempId`, o usar el `createdAt` + un contador local.

- [ ] **[Async / Memory leak] — `components/chat/chat-bubble.tsx:266-303`**: El `useEffect` que abre el `EventSource` se registra cada vez que cambian `open | sessionId | visitorId`. Si se re-renderiza por `messages`, el effect se vuelve a ejecutar y crea un SSE nuevo **sin cerrar el anterior** hasta el cleanup. En condiciones de re-render rápido (muchos mensajes), se acumulan conexiones abiertas.
  - *Causa*: Dependencias del effect demasiado amplias.
  - *Solución*: Extraer `open, sessionId, visitorId` a un ref y depender solo de esos.

- [ ] **[Async / Hidratación] — `components/chat/chat-bubble.tsx:62-77`**: 12 `useState` inicializados con valores neutros. Si el primer render del servidor renderiza este componente, los hooks se ejecutan en cliente y el árbol se vuelve a montar. Con `gameActive` desde `useGame()` y la doble carga (Form inicial + useEffect), **puede haber un flash donde el form se muestra dos veces**.
  - *Solución*: Mover `<ChatBubble />` a `next/dynamic` con `ssr: false` (es 100% cliente), o aceptar y documentar que el `Shell` es client-only (lo cual ya es, pero podría no serlo).

- [ ] **[Async / SSR boundary] — `app/layout.tsx:22-24`**: `<Suspense fallback={null}><Shell>{children}</Shell></Suspense>`. `Shell` es un client component que usa `useSearchParams()`. En Next.js 15+ esto **requiere** un `<Suspense>` boundary — y está bien, **pero** el `fallback={null}` significa que durante la carga inicial (cuando se decide la lang) la página renderiza **vacía**, y el LCP se va a 0.
  - *Solución*: Renderizar un skeleton en el fallback o leer el locale server-side directamente en el layout (ver item de `<html lang>`).

- [ ] **[SEO / Robots] — `app/robots.ts:8`**: `disallow: ["/api/"]` está bien, pero no excluye `/blog` de ningún bot. Si tienes un admin en `/admin/*` en el futuro, recuerda añadirlo.

- [ ] **[Performance / Locale negociation] — `app/page.tsx:82-97`**: El JSON-LD se genera como `WebSite` pero no incluye `potentialAction` (SearchAction) que es el patrón que Google recomienda para activar el `sitelinks searchbox`. Bajo impacto pero mejora CTR.

- [ ] **[Performance / CSS animation cost] — `app/globals.css:1041-1049`**: El `prefers-reduced-motion: reduce` global es **muy agresivo** (`animation-duration: 0.01ms !important; animation-iteration-count: 1 !important`). El hero (que se ejecuta en `useEffect` con GSAP) lo respeta, pero las animaciones CSS declarativas como `animate-fade-in-up` y `animate-marquee-left` quedan inutilizables. Esto es **deseable** para accesibilidad, pero hay que asegurar que cada animación crítica tiene su estado final visible (no `opacity: 0` permanente).
  - *Verificación*: Recorrer las clases `.animate-*` y verificar que tienen un estado `is-visible`/fin de animación que muestre el contenido.

- [ ] **[Performance / Scroll] — 6+ listeners peleándose por `window.scroll`**: En `home` se ejecutan simultáneamente **6 listeners de scroll** + **1 rAF loop a 60 fps** sobre el mismo `window`. Verificado por `grep "addEventListener\\(.scroll."`:
  - `components/ui/scroll-progress.tsx:101` (rAF + ResizeObserver para marcador lateral)
  - `components/layout/Header.tsx:24` (`scrolled` boolean)
  - `components/layout/Header.tsx:47` (rAF para `activeSection`)
  - `components/home/HeroSection.tsx:781` (toggle de clase del header según scroll en hero)
  - `components/home/LaGuairaSection.tsx:30` (parallax de la galería)
  - `components/ui/scroll-to-top.tsx:12` (visibilidad del botón)
  - `components/ui/global-video-background.tsx:42` (rAF continuo que **siempre** lee `getElementById("home")` y aplica `filter` inline al `<video>` 60 veces/segundo)
  - *Causa*: Cada componente se suscribe a scroll de forma aislada sin coordinación. El navegador paga 6 cálculos de layout por frame + el rAF global.
  - *Síntomas*: jank perceptible, scroll "se atasca" en zonas, scroll hijack inconsistente entre secciones.
  - *Refactor propuesto*:
    ```typescript
    // hooks/useScrollPosition.ts (custom hook compartido, 1 único listener + fan-out)
    "use client"
    import { useEffect, useRef, useState } from "react"

    type ScrollSnapshot = { scrollY: number; vh: number; vhRatio: number; direction: "up" | "down" }
    const subs = new Set<(s: ScrollSnapshot) => void>()
    let ticking = false
    let lastY = 0

    function ensureListener() {
      if (typeof window === "undefined") return
      window.addEventListener("scroll", () => {
        if (ticking) return
        ticking = true
        requestAnimationFrame(() => {
          const y = window.scrollY
          const snap: ScrollSnapshot = {
            scrollY: y,
            vh: window.innerHeight,
            vhRatio: y / Math.max(1, window.innerHeight),
            direction: y > lastY ? "down" : y < lastY ? "up" : "down",
          }
          lastY = y
          subs.forEach((fn) => fn(snap))
          ticking = false
        })
      }, { passive: true })
    }

    export function useScrollPosition<T>(selector: (s: ScrollSnapshot) => T): T {
      const [value, setValue] = useState<T>(() => selector({ scrollY: 0, vh: 0, vhRatio: 0, direction: "down" }))
      const selRef = useRef(selector); selRef.current = selector
      useEffect(() => {
        ensureListener()
        const fn = (s: ScrollSnapshot) => {
          const v = selRef.current(s)
          setValue((prev) => (Object.is(prev, v) ? prev : v))
        }
        subs.add(fn)
        return () => { subs.delete(fn) }
      }, [])
      return value
    }
    ```
    Reemplazar los 6 listeners por `const scrolled = useScrollPosition(s => s.scrollY > 50)`, `const activeSection = useScrollPosition(s => computeActive(s))`, etc.

- [ ] **[Performance / Scroll] — 6 secciones con `pin: true` suman ~10.800 px pinned en home**: `AboutSection.tsx:24`, `PaymentSection.tsx:18`, `ServicesSection.tsx:43`, `PortfolioSection.tsx:41`, `PricingSection.tsx:44`, `BlogSection.tsx:88` usan `<ScrollyFrames>` con `pinSpacing: 1800` por defecto. Multiplicado: **6 × 1800 = 10.800 px de scroll pinneado solo en la home**.
  - *Causa*: `ScrollyFrames` siempre activa `pin: true` y `scrub: 0.5` en desktop, sin importar el contexto ni el contenido.
  - *Síntomas*: scroll "se queda" en zonas, no avanza, salta al final de la sección al terminar el pin. `ScrollProgress` parpadea porque el cálculo `top = el.getBoundingClientRect().top + window.scrollY` se distorsiona con la altura artificial de las secciones pinneadas.
  - *Refactor propuesto*:
    ```typescript
    // components/ui/scrolly-frames.tsx — props de control
    interface ScrollyFramesProps {
      pinSpacing?: number      // default 1800 → 900
      pin?: boolean            // nuevo, opt-out
      sectionId?: string       // nuevo, para que ScrollProgress apunte al top real
      crossfade?: number
    }
    export default function ScrollyFrames({
      pinSpacing = 900,        // ← cambiado
      pin = true,              // ← nuevo
      sectionId,               // ← nuevo
      crossfade = 0.35,
      …
    }) {
      return (
        <div ref={rootRef} id={sectionId} className={className}>
          {/* pasar `pin` al scrollTrigger */}
        </div>
      )
    }
    ```
    Y en `BlogSection` y `PaymentSection` (las menos scrolly-friendly) pasar `pin={false}` para que se rendericen como flujo normal con crossfade por `IntersectionObserver`.

- [ ] **[Performance / LCP] — `GlobalVideoBackground` corre el rAF siempre, no solo cuando el hero está visible**: `components/ui/global-video-background.tsx:42-89` ejecuta `requestAnimationFrame` continuo, lee `getElementById("home")` cada frame, y aplica `filter` inline al `<video>` 60 veces/segundo aunque el usuario esté en `pricing` o `contact`.
  - *Causa*: El rAF nunca se pausa. No hay `IntersectionObserver` sobre la sección hero.
  - *Síntomas*: Consumo de CPU constante en background tabs, jank perceptible al volver al top después de scrollear mucho, batería drenada en laptops.
  - *Refactor propuesto*:
    ```typescript
    useEffect(() => {
      const video = videoRef.current; if (!video) return
      const hero = document.getElementById("home"); if (!hero) return
      let raf = 0, running = false
      const start = () => { if (running) return; running = true; raf = requestAnimationFrame(tick) }
      const stop = () => { running = false; cancelAnimationFrame(raf) }
      const io = new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop(), { rootMargin: "200px" })
      io.observe(hero)
      return () => { io.disconnect(); stop() }
    }, [])
    ```

- [ ] **[Performance / UX] — Scrollytelling desactivado en móvil sin progressive enhancement**: `components/ui/scrolly-frames.tsx:47-54` y `155-170` aplican un fallback de stack vertical plano en `≤767px` (sin crossfade, sin scroll-driven). Funcional pero **móvil se siente muerto** frente al hero animado del desktop.
  - *Causa*: Decisión consciente para evitar problemas táctiles con `pin: true`, pero el fallback va demasiado lejos.
  - *Solución*: Reemplazar el fallback móvil por animaciones con `IntersectionObserver` (fade-in-up, scale-on-enter) que respeten `prefers-reduced-motion`. Móvil se siente vivo sin tocar el `pin`.

- [ ] **[Performance / A11y] — `prefers-reduced-motion` solo se respeta en `ScrollyFrames` y `GlobalVideoBackground`**: Los 6 listeners de scroll, el `HeroSection` GSAP, las animaciones CSS de `globals.css` y todos los componentes con `useState`-driven animation se ejecutan independientemente de la preferencia. Un usuario con motion-reduce sigue sufriendo jank y animaciones invasivas.
  - *Causa*: Solo `scrolly-frames.tsx:78-89` y `global-video-background.tsx:20-28` consultan la media query.
  - *Refactor propuesto*: Crear `hooks/useReducedMotion()` con `useSyncExternalStore` y consultarlo en cada componente con animación. Opcionalmente, un `<MotionProvider>` que envuelva y desactive animaciones globalmente.

- [ ] **[Performance / Bug visual] — Marcador de `ScrollProgress` parpadea con secciones pinneadas**: `components/ui/scroll-progress.tsx:43-53` calcula la posición de cada marcador con `top = el.getBoundingClientRect().top + window.scrollY`. Cuando una sección está pinneada por `ScrollyFrames`, su `boundingClientRect().top` cambia con cada frame de scroll (es la gracia del `pin: true`), así que el marcador se mueve junto con el contenido en vez de quedar fijo en su posición lógica de la página.
  - *Causa*: El cálculo no distingue entre altura real y altura virtual de un contenedor pinneado.
  - *Refactor propuesto*: Exponer `sectionId` desde cada `<ScrollyFrames>` (ver item anterior) y calcular `top` con `el.offsetTop` una sola vez al montar, no en cada scroll. O usar `ScrollTrigger.getById(id)?.start` si se le asigna un id al trigger.

---

## 💡 Severidad Baja (Clean Code & Mantenimiento)

- [ ] **[Clean code / ESM vs CJS] — `lib/lang/index.ts:5-6`**: Usa `require("./en").en` y `require("./es").es` en un módulo TS que el resto del proyecto trata como ESM (con `"type": "module"` implícito y `moduleResolution: bundler`). El `import type` de la línea 1 **se borra en runtime**, así que el `require` se ejecuta, lo cual puede fallar en producción estricto o inflar el bundle con un polyfill CommonJS.
  - *Refactor propuesto*:
    ```typescript
    // lib/lang/index.ts
    import { en } from "./en"
    import { es } from "./es"
    import type { en as En } from "./en"
    export type Lang = typeof En
    export const languages: Record<string, Lang> = { en, es }
    export function getLang(locale: string): Lang { return languages[locale] ?? languages.es }
    ```

- [ ] **[Clean code / Server-Component innecesario] — `components/layout/MainContent.tsx:1-3`**: Marcado `"use client"` y solo hace `<main>{children}</main>` con un style inline. No usa hooks, eventos ni estado. **Debería ser Server Component** (sin `"use client"`).
  - *Solución*: Quitar `"use client"` y la importación de `type ReactNode` (cambiar por `ReactNode` global).

- [ ] **[Clean code / "use client" masivo] — `components/home/AboutSection.tsx`, `BlogSection.tsx`, `GratitudeSection.tsx`, `PaymentSection.tsx`, `PricingSection.tsx`, `ServicesSection.tsx`**: Marcan `"use client"` sin usar hooks. Cada uno infla el bundle de cliente. Auditar y dejar solo los que realmente lo necesitan (los que tienen `useState`, `useEffect`, `onClick`, o imports de client components).
  - *Acción*: `grep -L "useState\\|useEffect\\|useRef\\|useMemo\\|onClick\\|onChange" components/home/*.tsx` y quitar `"use client"` de esos.

- [ ] **[Clean code / Server-only "use client"] — `components/layout/Footer.tsx:1-2`**: No tiene `"use client"`, no usa hooks, importa un type y `lucide-react` (que es client-safe). **Correcto**. Pero `components/ui/button.tsx:1` SÍ tiene `"use client"` y es solo un `forwardRef<HTMLButtonElement>`. Server Components no pueden pasar `ref` a un Client Component sin declararlo como tal, así que está bien, pero si solo lo usas sin `ref`, podrías removerlo.

- [ ] **[Clean code / Código muerto] — `lib/supabase.ts:1-6`**: Define y exporta `supabase`, pero **ningún archivo lo importa** (verificado por `grep -r "lib/supabase\\|from \"@supabase/supabase-js\""`). El cliente Supabase no se usa en el código actual (la app usa `@neondatabase/serverless`). Sin embargo, `supabase/schema.sql` y `supabase/neon-schema.sql` son archivos de migración para dos backends distintos.
  - *Decisión a tomar*: ¿Migras a Supabase o sigues con Neon? Si te quedas con Neon:
    1. Borra `lib/supabase.ts`.
    2. Borra `supabase/schema.sql` (es el de Supabase, con `gen_random_uuid()` UUID).
    3. Conserva `supabase/neon-schema.sql` y renómbralo a `db/schema.sql` o `supabase/schema.sql` (es donde está el `SERIAL` para Neon).
  - Si migras a Supabase, mueve `lib/db.ts` a `lib/supabase-server.ts` con la service-role key y elimina el import de `@neondatabase/serverless`.

- [ ] **[Clean code / Refactor sugerido] — `app/api/contact/route.ts:34-53, 55-60, 10-32`**: Las tres funciones (`sendEmail`, `sendToTelegram`, `saveMessage`) hacen cosas muy diferentes. Extráelas a `lib/contact-channels.ts` para que `route.ts` solo orqueste.
  ```typescript
  // lib/contact-channels.ts
  export async function deliverContact(payload: ContactPayload): Promise<void> {
    const results = await Promise.allSettled([
      saveToDb(payload),
      sendResendEmail(payload),
      sendTelegramMessage(payload),
    ])
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error(`[contact] channel ${i} failed:`, r.reason)
    })
  }
  ```

- [ ] **[Clean code / Validación] — **Falta una capa de validación en todo el proyecto** (no hay Zod, no hay Valibot, no hay RHF)**. Las validaciones en cliente (`components/chat/chat-bubble.tsx:363-383`, `components/home/ContactSection.tsx:26-44`) son **regex inline** y no se replican en el servidor. Cualquier discrepancia es un vector de bypass.
  - *Plan*:
    1. Instalar `zod` (~14 KB gzip) en el servidor.
    2. Crear `lib/validation/contact.ts`, `lib/validation/chat.ts`, `lib/validation/score.ts` con un schema por endpoint.
    3. Reusar los mismos schemas en el cliente (Zod no requiere RHF; se puede usar con `useState`).
    4. En el servidor, `safeParse` y devolver 400 con detalle.

- [ ] **[Clean code / useGame inutilizado] — `app/providers.tsx:21-28, 54-60`**: Define `GameProvider` + `useGame` y se usa en `Shell.tsx:29`, `Header.tsx:17`, `HeroSection.tsx:16`, `chat-bubble.tsx:62`. Pero el estado del juego (`gameActive`) en realidad se gestiona **dentro** de `CatGame.tsx` y `HeroSection.tsx` mediante un set/get local (`setGameActive(true)`) que se propaga solo hacia abajo. Es un mini-bus global sobre un useState.
  - *Sugerencia*: Para algo tan simple, usa un `zustand` store de 1 KB, o extrae `gameActive` a un `useReducer` con acciones. Más predecible y testeable.

- [ ] **[Clean code / Duplicación] — `components/home/BlogSection.tsx` vs `app/blog/page.tsx`**: Ambos renderizan el listado de posts. La estructura del card y el featured-first es idéntico. Extrae a `components/blog/PostCard.tsx` y reusa.
  ```tsx
  // components/blog/PostCard.tsx
  export function PostCard({ post, locale, variant }: { post: BlogPost; locale: "es"|"en"; variant: "featured"|"compact" }) { … }
  ```

- [ ] **[Clean code / Hardcoded IP] — `next.config.ts:10`**: `allowedDevOrigins: ["http://192.168.0.197:3000", "192.168.0.197"]` deja tu IP de LAN **commiteada**. Mover a variable de entorno.
  ```ts
  allowedDevOrigins: (process.env.DEV_ORIGINS ?? "").split(",").filter(Boolean),
  ```

- [ ] **[Clean code / Locale duplicado] — `app/page.tsx:18-71` y `app/blog/page.tsx:9-43`**: La función `generateMetadata` replica la misma lógica de `isEn = locale === "en"`. Extrae a `lib/metadata.ts`:
  ```typescript
  // lib/metadata.ts
  export async function buildMetadata({ locale, title, description, path }: { … }): Promise<Metadata> { … }
  ```

- [ ] **[Clean code / Scroll sin cleanup] — `components/layout/Header.tsx:42-53`**: `rafId` se declara con `let rafId = 0` y se cancela en cleanup. Bien. Pero `requestAnimationFrame` se llama dentro de `onScroll` con el id que se acaba de cancelar. Hay un off-by-one sutil: si llega un scroll mientras hay un RAF pendiente, se cancela y se reagenda, pero el primer RAF se ejecuta antes de que llegue el siguiente scroll. No es bug, pero `useState` con throttle sería más legible.

- [ ] **[Clean code / Magic numbers] — `app/api/scores/route.ts:4`**: `MAX_SCORE_PER_SECOND = 50` es razonable pero está como constante mágica. Mover a un archivo de configuración y documentar.
  ```typescript
  // lib/game-config.ts
  export const GAME = { MAX_SCORE_PER_SECOND: 50, MIN_ELAPSED_S: 1, MAX_NAME_LEN: 20 } as const
  ```

- [ ] **[Clean code / Componentes UI infrautilizados] — `components/ui/spinner.tsx` y `components/ui/under-construction.tsx`**: `Spinner` está bien hecho pero `chat-bubble.tsx:440, 493` reimplementa un spinner inline con `border-2 border-sc-primary/30 border-t-sc-primary rounded-full animate-spin`. Reemplazar por `<Spinner size="md" />`. `UnderConstruction` no se renderiza en producción (¿o sí?).

- [ ] **[Clean code / Tests E2E duplicados] — `e2e/`**: `chat-test.spec.ts`, `chat-bubble.spec.ts`, `smoke.spec.ts`, `centering.spec.ts`. Los nombres sugieren solapamiento. Auditar y consolidar para no pagar el coste de mantener 4 specs.

- [ ] **[Clean code / Console logs en producción] — `app/api/chat/session/[sessionId]/messages/route.ts:55-57`**: `console.log("[Telegram notify] Notificación enviada correctamente")` se ejecuta en cada mensaje. Mover a logger condicional (`process.env.NODE_ENV !== "production"`) o a un servicio de telemetría.

- [ ] **[Clean code / Inline styles vs Tailwind] — `components/ui/global-video-background.tsx:78-80` y muchos otros**: `video.style.filter = ...` se hace en cada `requestAnimationFrame` (60 fps). Esto fuerza un style recalculation constante. Mejor usar CSS custom properties y dejar que la GPU componga.
  ```typescript
  wrap.style.setProperty("--blur", `${currentBlur}px`)
  // CSS: filter: blur(var(--blur)) brightness(var(--brightness))
  ```

- [ ] **[Clean code / Tipos] — `lib/chat-sound.ts:7` y `components/game/CatGame.tsx:8`**: `(window as unknown as { webkitAudioContext: typeof AudioContext })` y `(window as any).webkitAudioContext`. Centralizar el type en `lib/dom-audio.ts`.

- [ ] **[Clean code / Markdown parser] — `app/blog/[slug]/page.tsx:56-147`**: `renderMarkdown` está inline. Si se va a usar para más contenido (notas, MDX), extrae a `lib/markdown.ts` o migra a MDX (`@next/mdx`) para tener highlighting de código, tablas, imágenes nativas, etc. El `language` extraído de los ` ``` ` (línea 96) **nunca se usa**.

- [ ] **[Clean code / Data del sitemap] — `app/sitemap.ts:2`**: `import { posts } from "@/lib/blog-data"`. Si los posts vienen de una BD en el futuro, este sitemap se rompe. Usa `generateSitemap` con async/await desde la fuente real.

- [ ] **[Clean code / `next.config.ts:7-9`]**: `turbopack: { root: process.cwd() }` es el default. Se puede omitir.

- [ ] **[Clean code / `app/blog/[slug]/page.tsx:119-120`]**: `key={`li-${elements.length}-${listItems.length}`}` puede colisionar si dos `<li>` se renderizan en la misma iteración de `elements.length` y `listItems.length` idénticos. Es improbable con posts de blog, pero `crypto.randomUUID()` o un contador monotónico es más seguro.

- [ ] **[Clean code / CSS en línea en lugar de Tailwind] — `components/layout/LanguageSplash.tsx:208-225, 280-310`**: Más de 30 `style={{...}}` inline que duplican clases Tailwind. Convertir a `className` para que el JIT de Tailwind v4 los pueda purgar si quedan inactivos.

- [ ] **[Clean code / Sin `aria-live`] — `components/chat/chat-bubble.tsx:490-532`**: El contenedor de mensajes no tiene `aria-live="polite"`, así que un usuario con lector de pantalla no se entera de los mensajes nuevos del admin.
  ```tsx
  <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite">
  ```

- [ ] **[Clean code / Sin fallback si Telegram falla] — `app/api/chat/session/[sessionId]/messages/route.ts:39-62`**: `notifyTelegram` se llama **después** de insertar el mensaje en BD y de devolver el response. Si Telegram está caído, el usuario ve su mensaje enviado correctamente, pero el admin no se entera. Considera encolar (Upstash Redis / pg-boss) y reintentar.

- [ ] **[Clean code / Server Actions ausentes] — `app/home/ContactSection.tsx:26-44` y los demás formularios**: El proyecto no usa **Server Actions**, solo fetch a API routes. Para un formulario de contacto, una Server Action con `revalidatePath` sería más idiomático en Next.js 16 y eliminaría un round-trip.
  ```tsx
  // app/actions/contact.ts
  "use server"
  export async function submitContact(formData: FormData) {
    const parsed = ContactSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { ok: false, error: "Invalid" }
    // …mismas llamadas…
    return { ok: true }
  }
  ```

- [ ] **[Clean code / Tests E2E sin fixtures] — `e2e/chat-test.spec.ts` y compañía**: Verificar que los tests usan `data-testid` o selectores semánticos, no `text=` que se rompe con cualquier i18n change.

- [ ] **[Clean code / Falta archivo `favicon.ico`]** — sí existe en `app/favicon.ico` y `public/favicon.ico`, pero Next.js 16 prefiere el de `app/`. El de `public/` es redundante (se sirve dos veces).

---

## 📌 Anexo — Verificaciones finales recomendadas

- [ ] `pnpm lint` o `npm run lint` debe pasar limpio. Hoy no se ha ejecutado.
- [ ] `pnpm build` o `npm run build` debe completar sin warnings de Next.js 16 (`deprecation`, `missing-suspense`, etc.).
- [ ] Lighthouse en `https://spacecatweb.com` debería alcanzar Performance ≥ 90, A11y ≥ 95, SEO ≥ 95, Best Practices ≥ 95 después de aplicar los items de **Severidad Media**.
- [ ] `npx next telemetry status` para confirmar opt-in/out antes de CI.
- [ ] Configurar CSP en modo `report-only` durante 1 semana antes de hacer enforce, para detectar regresiones de terceros (Telegram widgets, Resend iframes, etc.).
- [ ] Auditar `node_modules` con `npm audit --omit=dev` y `pnpm audit` antes de cada release.
- [ ] Mover el `console.log("[Telegram notify] …")` y el `console.error` de cada `catch` a un logger central (`pino` o `consola`) con redacción de PII.

---

> **Nota de auditoría**: este informe se generó a partir de una lectura estática del código en `C:\Users\kaoz-\Desktop\spacecatweb` (commit/working tree al momento de la auditoría). No se han ejecutado pruebas dinámicas. Antes de aplicar cada cambio, valida con `pnpm dev` que el comportamiento SSR/CSR sigue siendo el esperado, especialmente los items marcados con `[Async / Hidratación]`.
