export interface BlogPost {
  slug: string
  date: string
  author: string
  category: { es: string; en: string }
  title: { es: string; en: string }
  excerpt: { es: string; en: string }
  content: { es: string; en: string }
  image: string | null
}

export const posts: BlogPost[] = [
  {
    slug: "building-modern-web-apps-nextjs-16",
    date: "Jun 15, 2026",
    author: "Johandri Suarez",
    category: { es: "Desarrollo", en: "Development" },
    title: {
      es: "Construyendo Apps Web Modernas con Next.js 16",
      en: "Building Modern Web Apps with Next.js 16",
    },
    excerpt: {
      es: "Descubre las ultimas funciones y mejoras en Next.js 16 y como pueden acelerar tu flujo de trabajo de desarrollo.",
      en: "Discover the latest features and improvements in Next.js 16 and how they can accelerate your development workflow.",
    },
    content: {
      es: `Next.js 16 trae consigo una serie de mejoras significativas que cambian la forma en que construimos aplicaciones web. Desde la compilacion con Turbopack hasta las Server Components mejoradas, cada funcion esta disenada para mejorar la experiencia del desarrollador y el rendimiento del usuario final.

## Turbopack: Velocidad sin Compromisos

El compilador Turbopack ahora es el predeterminado en Next.js 16. Esto significa compilaciones hasta 10x mas rápidas en comparacion con Webpack. En mi experiencia personal, los tiempos de hot reload pasaron de varios segundos a menos de 200ms, lo que permite un flujo de trabajo mucho mas fluido.

## Server Components por Defecto

Las Server Components ahora son el comportamiento por defecto para todos los componentes. Esto reduce drasticamente el JavaScript que se envia al cliente, mejorando los tiempos de carga y el SEO. Solo necesitas agregar "use client" cuando necesites interactividad del lado del cliente.

## Funciones Avanzadas

- **Partial Prerendering**: Permite mezclar contenido estatico y dinamico en la misma pagina
- **Server Actions mejorados**: Formularios mas simples sin necesidad de API routes separadas
- **Metadata API mejorada**: Control mas granular sobre el SEO de cada pagina

## Conclusión

Next.js 16 representa un salto generacional en el desarrollo web. Si ainda no lo has probado, ahora es el momento perfecto para migrar tu proyecto.`,
      en: `Next.js 16 brings a series of significant improvements that change the way we build web applications. From Turbopack compilation to enhanced Server Components, every feature is designed to improve the developer experience and end-user performance.

## Turbopack: Speed Without Compromise

The Turbopack compiler is now the default in Next.js 16. This means up to 10x faster compilations compared to Webpack. In my personal experience, hot reload times dropped from several seconds to under 200ms, allowing for a much smoother workflow.

## Server Components by Default

Server Components are now the default behavior for all components. This drastically reduces the JavaScript sent to the client, improving load times and SEO. You only need to add "use client" when you need client-side interactivity.

## Advanced Features

- **Partial Prerendering**: Mix static and dynamic content on the same page
- **Improved Server Actions**: Simpler forms without needing separate API routes
- **Enhanced Metadata API**: More granular control over each page's SEO

## Conclusion

Next.js 16 represents a generational leap in web development. If you haven't tried it yet, now is the perfect time to migrate your project.`,
    },
    image: null,
  },
  {
    slug: "future-of-web-performance",
    date: "Jun 10, 2026",
    author: "Johandri Suarez",
    category: { es: "Rendimiento", en: "Performance" },
    title: {
      es: "El Futuro del Rendimiento Web",
      en: "The Future of Web Performance",
    },
    excerpt: {
      es: "Aprende sobre las ultimas tecnicas de optimizacion de rendimiento y como impactan la experiencia del usuario y el posicionamiento SEO.",
      en: "Learn about the latest performance optimization techniques and how they impact user experience and SEO rankings.",
    },
    content: {
      es: `El rendimiento web ya no es opcional. Con Google usando Core Web Vitals como factor de ranking, cada milisegundo cuenta. En este articulo, exploro las tecnicas mas avanzadas para crear sitios ultrarapidos.

## Core Web Vitals en 2026

Los metricas de Google han evolucionado. Ahora incluyen:
- **LCP (Largest Contentful Paint)**: Debe ser menor a 2.5 segundos
- **INP (Interaction to Next Paint)**: Reemplaza a FID, mide la reactividad general
- **CLS (Cumulative Layout Shift)**: Debe ser menor a 0.1

## Tecnicas Avanzadas

### 1. Preloading Inteligente
No pre-cargues todo. Usa la API de Speculation Rules para pre-cargar solo las paginas que el usuario probablemente visitara.

### 2. Imagenes Next-Gen
WebP y AVIF son essenciales. Usa el componente Image de Next.js para servir automaticamente el formato optimizado.

### 3. JavaScript Diferido
Carga el JavaScript no critico despues de que la pagina sea interactiva. Usa dynamic() de Next.js para lograr esto facilmente.

## El Impacto Real

Un sitio que carga en 1 segundo tiene 3x mas conversiones que uno que carga en 5 segundos. La inversion en rendimiento siempre se traduce en resultados.`,
      en: `Web performance is no longer optional. With Google using Core Web Vitals as a ranking factor, every millisecond counts. In this article, I explore the most advanced techniques for creating ultra-fast sites.

## Core Web Vitals in 2026

Google's metrics have evolved. They now include:
- **LCP (Largest Contentful Paint)**: Must be under 2.5 seconds
- **INP (Interaction to Next Paint)**: Replaces FID, measures overall responsiveness
- **CLS (Cumulative Layout Shift)**: Must be under 0.1

## Advanced Techniques

### 1. Smart Preloading
Don't pre-load everything. Use the Speculation Rules API to preload only pages the user is likely to visit.

### 2. Next-Gen Images
WebP and AVIF are essential. Use Next.js's Image component to automatically serve the optimized format.

### 3. Deferred JavaScript
Load non-critical JavaScript after the page becomes interactive. Use Next.js's dynamic() to achieve this easily.

## Real Impact

A site that loads in 1 second has 3x more conversions than one that loads in 5 seconds. Investment in performance always translates to results.`,
    },
    image: null,
  },
  {
    slug: "responsive-design-best-practices-2026",
    date: "Jun 5, 2026",
    author: "Johandri Suarez",
    category: { es: "Diseno", en: "Design" },
    title: {
      es: "Mejores Practicas de Diseno Responsivo en 2026",
      en: "Responsive Design Best Practices in 2026",
    },
    excerpt: {
      es: "Una guia completa para crear experiencias fluidas en todos los dispositivos con CSS moderno y patrones de diseno.",
      en: "A comprehensive guide to creating seamless experiences across all devices with modern CSS and design patterns.",
    },
    content: {
      es: `El diseno responsivo ha evolucionado mucho desde los primeros layouts de 12 columnas. Hoy en dia, tenemos herramientas poderosas que hacen que crear experiencias fluidas sea mas facil que nunca.

## Container Queries: El Juego Cambia

Las Container Queries finalmente son soportadas por todos los navegadores principales. Esto permite que los componentes se adapten al tamaño de su contenedor, no al de la ventana. Es un cambio de paradigma fundamental.

## CSS Nesting Nativo

Ya no necesitas Sass para anidar estilos. CSS ahora soporta nativamente el nesting, making your stylesheets much mas legibles y mantenibles.

## Patrones Modernos

### Sidebar Responsivo
Usa grid con \`grid-template-columns: auto 1fr\` y oculta el sidebar en movil con \`@media (width < 768px)\`.

### Tarjetas Flexibles
 \`container-type: inline-size\` en el contenedor y \`cqw\` en las propiedades de las tarjetas para que se adapten automaticamente.

### Tipografia Fluida
Usa \`clamp()\` para crear tamanos de fuente que se escalan fluidamente entre movil y desktop.

## Herramientas Recomendadas

- Tailwind CSS v4 con sus nuevas utilidades de container queries
- Figma con dev mode para inspeccionar diseños
- Chrome DevTools con la nueva vista de layout responsivo`,
      en: `Responsive design has evolved greatly since the early 12-column layouts. Today, we have powerful tools that make creating fluid experiences easier than ever.

## Container Queries: The Game Changer

Container Queries are finally supported by all major browsers. This allows components to adapt to their container's size, not the window's. It's a fundamental paradigm shift.

## Native CSS Nesting

You no longer need Sass for nesting styles. CSS now natively supports nesting, making your stylesheets much more readable and maintainable.

## Modern Patterns

### Responsive Sidebar
Use grid with \`grid-template-columns: auto 1fr\` and hide the sidebar on mobile with \`@media (width < 768px)\`.

### Flexible Cards
Use \`container-type: inline-size\` on the container and \`cqw\` in card properties so they adapt automatically.

### Fluid Typography
Use \`clamp()\` to create font sizes that scale fluidly between mobile and desktop.

## Recommended Tools

- Tailwind CSS v4 with its new container query utilities
- Figma with dev mode for inspecting designs
- Chrome DevTools with the new responsive layout view`,
    },
    image: null,
  },
  {
    slug: "rest-vs-graphql",
    date: "May 28, 2026",
    author: "Johandri Suarez",
    category: { es: "Backend", en: "Backend" },
    title: {
      es: "Por que Passe de REST a GraphQL",
      en: "Why I Switched from REST to GraphQL",
    },
    excerpt: {
      es: "Una comparacion practica de APIs REST y GraphQL, con ejemplos reales de cuando cada enfoque tiene sentido para tu proyecto.",
      en: "A practical comparison of REST and GraphQL APIs, with real examples of when each approach makes sense for your project.",
    },
    content: {
      es: `Despues de anos trabajando con REST, decidi experimentar con GraphQL en un proyecto real. Aqui comparto mis hallazgos honestos.

## El Problema con REST

REST funciona bien para APIs simples, pero conforme tu aplicacion crece, empiezas a enfrentar problemas:
- **Over-fetching**: Obtienes mas datos de los que necesitas
- **Under-fetching**: Necesitas multiples peticiones para obtener toda la informacion
- **Versioning**: Mantener /api/v1, /api/v2 se vuelve un infierno

## La Solucion GraphQL

GraphQL resuelve estos problemas con un esquema tipado y un lenguaje de consultas:
- El cliente pide exactamente lo que necesita
- Una sola peticion obtiene todos los datos relacionados
- Sin versioning, solo campos deprecados

## Cuando Usar Cada Uno

### Usa REST cuando:
- Tu API es simple y estatica
- Tienes caching HTTP implicito
- El equipo es nuevo en APIs

### Usa GraphQL cuando:
- Tu aplicacion tiene relaciones complejas de datos
- Multiples clientes necesitan diferentes estructuras de datos
- Quieres un developer experience superior

## Mi Experiencia

En mi proyecto, GraphQL redujo el numero de peticiones HTTP en un 60% y mejoro significativamente la experiencia de desarrollo. El schema como contrato entre frontend y backend es revolucionario.`,
      en: `After years working with REST, I decided to experiment with GraphQL in a real project. Here I share my honest findings.

## The Problem with REST

REST works well for simple APIs, but as your application grows, you start facing problems:
- **Over-fetching**: You get more data than you need
- **Under-fetching**: You need multiple requests to get all the information
- **Versioning**: Maintaining /api/v1, /api/v2 becomes a nightmare

## The GraphQL Solution

GraphQL solves these problems with a typed schema and a query language:
- The client asks for exactly what it needs
- A single request gets all related data
- No versioning, only deprecated fields

## When to Use Each

### Use REST when:
- Your API is simple and static
- You have implicit HTTP caching
- The team is new to APIs

### Use GraphQL when:
- Your application has complex data relationships
- Multiple clients need different data structures
- You want a superior developer experience

## My Experience

In my project, GraphQL reduced HTTP requests by 60% and significantly improved the development experience. The schema as a contract between frontend and backend is revolutionary.`,
    },
    image: null,
  },
  {
    slug: "venezuelan-developer-journey",
    date: "May 20, 2026",
    author: "Johandri Suarez",
    category: { es: "Carrera", en: "Career" },
    title: {
      es: "Mi Camino como Desarrollador Full Stack Venezolano",
      en: "My Journey as a Venezuelan Full Stack Developer",
    },
    excerpt: {
      es: "Perspectivas personales sobre trabajar remotamente desde Venezuela, construir proyectos internacionales y las lecciones aprendidas en el camino.",
      en: "Personal insights about working remotely from Venezuela, building international projects, and the lessons learned along the way.",
    },
    content: {
      es: `Ser desarrollador en Venezuela tiene sus desafios unicos, pero tambien oportunidades que no se encuentran en otro lugar. Esta es mi historia.

## El Contexto

Venezuela ha pasado por momentos economicos dificiles, pero la comunidad de tecnologia ha seguido creciendo. Muchos desarrolladores venezolanos trabajan para empresas internacionales, y eso nos ha dado una perspectiva unica.

## Trabajando Remotamente

Lo que mas me ha ensenado el trabajo remoto es:
- **Disciplina**: Sin un jefe mirando tu pantalla, tu productividad depende de ti
- **Comunicacion**: En un equipo remoto, documentar todo es vital
- **Adaptabilidad**: Los husos horarios y culturas diferentes te enseñan flexibilidad

## Proyectos Internacionales

He tenido la oportunidad de trabajar con clientes de:
- Estados Unidos
- Europa
- Latinoamerica

Cada mercado tiene sus propias expectativas y desafios tecnicos.

## Lecciones Aprendidas

1. **Invierte en tu educacion**: Los cursos y certificaciones abren puertas
2. **Construye un portafolio fuerte**: Muestra lo que puedes hacer
3. **No tengas miedo de cobrar en dolares**: Tu trabajo tiene valor global
4. **La comunidad lo es todo**: Conecta con otros desarrolladores

## El Futuro

Venezuela tiene un potencial enorme en tecnologia. Estoy convencido de que la proxima gran empresa tech de Latinoamerica podria venir de aqui.`,
      en: `Being a developer in Venezuela has its unique challenges, but also opportunities you won't find elsewhere. This is my story.

## The Context

Venezuela has gone through difficult economic times, but the technology community has continued to grow. Many Venezuelan developers work for international companies, giving us a unique perspective.

## Working Remotely

What remote work has taught me most:
- **Discipline**: Without a boss watching your screen, your productivity depends on you
- **Communication**: In a remote team, documenting everything is vital
- **Adaptability**: Different time zones and cultures teach you flexibility

## International Projects

I've had the opportunity to work with clients from:
- United States
- Europe
- Latin America

Each market has its own expectations and technical challenges.

## Lessons Learned

1. **Invest in your education**: Courses and certifications open doors
2. **Build a strong portfolio**: Show what you can do
3. **Don't be afraid to charge in dollars**: Your work has global value
4. **Community is everything**: Connect with other developers

## The Future

Venezuela has enormous potential in technology. I'm convinced that the next big tech company from Latin America could come from here.`,
    },
    image: null,
  },
  {
    slug: "typescript-for-js-developers",
    date: "May 12, 2026",
    author: "Johandri Suarez",
    category: { es: "TypeScript", en: "TypeScript" },
    title: {
      es: "TypeScript para Desarrolladores JavaScript",
      en: "TypeScript for JavaScript Developers",
    },
    excerpt: {
      es: "Una guia principiante amigable sobre TypeScript que cubre lo basico, errores comunes y como migrar tus proyectos gradualmente.",
      en: "A beginner-friendly guide to TypeScript that covers the basics, common pitfalls, and how to migrate your projects gradually.",
    },
    content: {
      es: `Si sabes JavaScript, ya estas a medio camino de aprender TypeScript. En esta guia, te muestro como dar el siguiente paso sin sentirte abrumado.

## Que es TypeScript?

TypeScript es JavaScript con tipos. Agrega un sistema de tipos estatico que se ejecuta en tiempo de compilacion, lo que significa que tu codigo sigue siendo JavaScript en el navegador.

## Por Que Usarlo?

- **Deteccion temprana de errores**: Encuentra bugs antes de que lleguen a produccion
- **Mejor IDE**: Autocompletado, navegacion y refactorizacion precisas
- **Documentacion viva**: Los tipos documentan tu codigo automaticamente
- **Escalabilidad**: Facilita el trabajo en equipo y proyectos grandes

## Conceptos Basicos

### Tipos Primitivos
\`\`\`typescript
let nombre: string = "Johandri"
let edad: number = 31
let activo: boolean = true
\`\`\`

### Interfaces
\`\`\`typescript
interface Desarrollador {
  nombre: string
  lenguajes: string[]
  experiencia?: number
}
\`\`\`

### Genericos
\`\`\`typescript
function obtenerPrimero<T>(arr: T[]): T {
  return arr[0]
}
\`\`\`

## Migracion Gradual

1. Renombra tus archivos .js a .ts
2. Agrega tipos solo donde sea necesario
3. Usa \`any\` temporalmente (pero no lo dejes permanente)
4. Incrementa la estrictitud gradualmente

## Conclusión

TypeScript no es perfecto, pero sus beneficios superan con creces la curva de aprendizaje. Una vez que lo adoptes, no querras volver a JavaScript puro.`,
      en: `If you know JavaScript, you're already halfway to learning TypeScript. In this guide, I show you how to take the next step without feeling overwhelmed.

## What is TypeScript?

TypeScript is JavaScript with types. It adds a static type system that runs at compile time, meaning your code is still JavaScript in the browser.

## Why Use It?

- **Early error detection**: Find bugs before they reach production
- **Better IDE**: Accurate autocompletion, navigation, and refactoring
- **Living documentation**: Types document your code automatically
- **Scalability**: Facilitates teamwork and large projects

## Basic Concepts

### Primitive Types
\`\`\`typescript
let name: string = "Johandri"
let age: number = 31
let active: boolean = true
\`\`\`

### Interfaces
\`\`\`typescript
interface Developer {
  name: string
  languages: string[]
  experience?: number
}
\`\`\`

### Generics
\`\`\`typescript
function getFirst<T>(arr: T[]): T {
  return arr[0]
}
\`\`\`

## Gradual Migration

1. Rename your .js files to .ts
2. Add types only where needed
3. Use \`any\` temporarily (but don't leave it permanent)
4. Increase strictness gradually

## Conclusion

TypeScript isn't perfect, but its benefits far outweigh the learning curve. Once you adopt it, you won't want to go back to plain JavaScript.`,
    },
    image: null,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getLocalePost(post: BlogPost, lang: "es" | "en") {
  return {
    ...post,
    title: post.title[lang],
    excerpt: post.excerpt[lang],
    content: post.content[lang],
    category: post.category[lang],
  }
}
