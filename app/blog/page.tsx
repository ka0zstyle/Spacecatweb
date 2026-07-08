import type { Metadata } from "next"
import Link from "next/link"
import { getLang } from "@/lib/lang"
import { posts, getLocalePost } from "@/lib/blog-data"
import { Calendar, User, ArrowRight, BookOpen, ArrowLeft } from "lucide-react"

const baseUrl = "https://spacecatweb.com"

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const locale = params?.lang ?? "es"
  const isEn = locale === "en"

  return {
    title: isEn ? "Blog — SpaceCatWeb" : "Blog — SpaceCatWeb",
    description: isEn
      ? "Articles about web development, design, and technology."
      : "Artículos sobre desarrollo web, diseño y tecnología.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: isEn ? `${baseUrl}/blog?lang=en` : `${baseUrl}/blog`,
      languages: {
        "x-default": `${baseUrl}/blog`,
        es: `${baseUrl}/blog`,
        en: `${baseUrl}/blog?lang=en`,
      },
    },
    openGraph: {
      title: "Blog — SpaceCatWeb",
      description: isEn
        ? "Articles about web development, design, and technology."
        : "Artículos sobre desarrollo web, diseño y tecnología.",
      url: isEn ? `${baseUrl}/blog?lang=en` : `${baseUrl}/blog`,
      siteName: "SpaceCatWeb",
      locale: isEn ? "en_US" : "es_ES",
      type: "website",
    },
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>
}) {
  const params = await searchParams
  const locale = params?.lang ?? "es"
  const lang = getLang(locale)
  const typedLang = locale === "en" ? "en" : "es"

  const localizedPosts = posts.map((p) => getLocalePost(p, typedLang))
  const featured = localizedPosts[0]
  const rest = localizedPosts.slice(1)

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <Link
          href={`/?lang=${locale}`}
          className="inline-flex items-center gap-2 text-sm text-sc-muted hover:text-sc-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          {lang.blog_back_home}
        </Link>

        <div className="mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            <BookOpen size={12} />
            {lang.nav_blog}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            {lang.blog_page_title}
          </h1>
          <p className="text-sc-muted text-lg max-w-2xl">
            {lang.blog_page_description}
          </p>
        </div>

        {featured && (
          <Link
            href={`/blog/${featured.slug}?lang=${locale}`}
            className="group block rounded-2xl bg-sc-card/40 backdrop-blur-md border border-white/10 overflow-hidden hover:border-sc-primary/30 transition-all hover:-translate-y-1 mb-12"
          >
            <div className="aspect-video sm:aspect-[21/9] bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 flex items-center justify-center">
              <span className="text-4xl sm:text-6xl font-black text-white/10">{featured.category[0]}</span>
            </div>
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-sc-muted">
                <span className="px-2 py-1 rounded-full bg-sc-primary/10 text-sc-primary text-xs font-medium">
                  {lang.blog_featured_label}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {featured.date}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {featured.author}
                </span>
                <span className="px-2 py-1 rounded-full bg-white/5 text-white/60 text-xs">
                  {featured.category}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 group-hover:text-sc-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-sc-muted leading-relaxed mb-5 line-clamp-2">
                {featured.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-sc-primary font-medium">
                {lang.blog_read_more}
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        )}

        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-white">
          {lang.blog_more_articles}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}?lang=${locale}`}
              className="group flex flex-col p-5 rounded-xl bg-sc-card/30 backdrop-blur-md border border-white/10 hover:border-sc-primary/30 transition-all hover:-translate-y-0.5"
            >
              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 flex items-center justify-center mb-4">
                <span className="text-3xl font-black text-white/20">{post.category[0]}</span>
              </div>
              <div className="flex items-center gap-3 mb-2 text-xs text-sc-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {post.date}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                  {post.category}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-sc-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-sc-muted leading-relaxed line-clamp-3 flex-1">
                {post.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-sc-primary font-medium">
                {lang.blog_read_more}
                <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
