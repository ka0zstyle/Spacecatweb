export interface PortfolioProject {
  slug: string
  url: string
  title: { es: string; en: string }
  description: { es: string; en: string }
  category: { es: string; en: string }
  tech: string[]
  features: { es: string[]; en: string[] }
  images: string[]
}

export const projects: PortfolioProject[] = [
  {
    slug: "meepleland",
    url: "https://meepleland.cl",
    title: {
      es: "MeepleLand — Tienda TCG y Juegos de Mesa",
      en: "MeepleLand — TCG & Board Game Store",
    },
    description: {
      es: "Tienda online de cartas coleccionables y juegos de mesa en Chile. Incluye catalogo de productos, carrito de compras, sistema de categorias y integracion con redes sociales.",
      en: "Online store for collectible cards and board games in Chile. Features product catalog, shopping cart, category system, and social media integration.",
    },
    category: { es: "E-Commerce", en: "E-Commerce" },
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    features: {
      es: [
        "Catalogo de 500+ productos con busqueda y filtros",
        "Carrito de compras persistente",
        "Categorias: Juegos de Mesa, Pokemon, Accesorios",
        "Diseno responsivo mobile-first",
        "Integracion con TikTok, Facebook, Instagram",
        "SEO optimizado para Chile",
      ],
      en: [
        "Product catalog with 500+ items, search and filters",
        "Persistent shopping cart",
        "Categories: Board Games, Pokemon, Accessories",
        "Responsive mobile-first design",
        "TikTok, Facebook, Instagram integration",
        "SEO optimized for Chile",
      ],
    },
    images: ["/assets/proyects/meeple1.webp", "/assets/proyects/meeple2.webp"],
  },
  {
    slug: "nanosoluciones",
    url: "https://nano.pe",
    title: {
      es: "Nano Soluciones — Plataforma de Servicios Integrales",
      en: "Nano Soluciones — Integrated Services Platform",
    },
    description: {
      es: "Plataforma web para empresa de construccion y consultoria en Peru. Servicios de climatizacion, seguridad, electricidad, herreria y mas. Incluye tienda, cotizaciones y panel de servicios.",
      en: "Web platform for a construction and consulting company in Peru. Services include HVAC, security, electricity, metalwork and more. Features store, quotes, and service panel.",
    },
    category: { es: "Portal Corporativo", en: "Corporate Portal" },
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Cloudinary"],
    features: {
      es: [
        "Multiples categorias de servicios con detalle",
        "Sistema de cotizaciones integrado",
        "Tienda de productos destacados",
        "Galeria de proyectos con 500+ completados",
        "Integracion con WhatsApp y redes sociales",
        "Diseno responsive profesional",
      ],
      en: [
        "Multiple service categories with details",
        "Integrated quote system",
        "Featured products store",
        "Project gallery with 500+ completed",
        "WhatsApp and social media integration",
        "Professional responsive design",
      ],
    },
    images: ["/assets/proyects/nano1.webp", "/assets/proyects/nano2.webp"],
  },
  {
    slug: "galpoven",
    url: "https://galpoven.cl",
    title: {
      es: "Galpoven — Portal de Galpones Industriales",
      en: "Galpoven — Industrial Warehouse Portal",
    },
    description: {
      es: "Portal web corporativo para empresa de construccion de galpones industriales en Chile. Incluye galeria de obras, formulario de cotizacion, FAQ, testimonios de clientes y SEO avanzado.",
      en: "Corporate web portal for industrial warehouse construction company in Chile. Features project gallery, quote form, FAQ, client testimonials, and advanced SEO.",
    },
    category: { es: "Portal Corporativo", en: "Corporate Portal" },
    tech: ["Next.js", "PHP", "Tailwind CSS", "MySQL"],
    features: {
      es: [
        "Galeria de proyectos con fotos y ubicaciones",
        "Formulario de cotizacion con calculo de dimensiones",
        "Seccion de testimonios de clientes verificados",
        "FAQ interactiva con acordeon",
        "Mapa de ubicacion y datos de contacto",
        "SEO local optimizado para Chile",
      ],
      en: [
        "Project gallery with photos and locations",
        "Quote form with dimension calculator",
        "Verified client testimonials section",
        "Interactive FAQ accordion",
        "Location map and contact details",
        "Local SEO optimized for Chile",
      ],
    },
    images: ["/assets/proyects/Galpoven1.webp", "/assets/proyects/galpoven2.webp", "/assets/proyects/galpoven3.webp"],
  },
]

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getLocaleProject(project: PortfolioProject, lang: "es" | "en") {
  return {
    ...project,
    title: project.title[lang],
    description: project.description[lang],
    category: project.category[lang],
    features: project.features[lang],
  }
}
