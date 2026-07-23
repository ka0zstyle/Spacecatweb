import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import Script from "next/script"
import { notFound } from "next/navigation"
import { getLang } from "@/lib/lang"
import { posts, getPostBySlug, getLocalePost, formatPostDate } from "@/lib/blog-data"
import { Calendar, User, ArrowLeft, BookOpen } from "lucide-react"

const baseUrl = "https://spacecatweb.com"

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ lang?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const locale = sp?.lang ?? "es"
  const isEn = locale === "en"

  const post = getPostBySlug(slug)
  if (!post) return {}

  const localized = getLocalePost(post, isEn ? "en" : "es")

  return {
    title: `${localized.title} — SpaceCatWeb`,
    description: localized.excerpt,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: isEn ? `${baseUrl}/blog/${slug}?lang=en` : `${baseUrl}/blog/${slug}`,
      languages: {
        "x-default": `${baseUrl}/blog/${slug}`,
        es: `${baseUrl}/blog/${slug}`,
        en: `${baseUrl}/blog/${slug}?lang=en`,
      },
    },
    openGraph: {
      title: localized.title,
      description: localized.excerpt,
      url: isEn ? `${baseUrl}/blog/${slug}?lang=en` : `${baseUrl}/blog/${slug}`,
      siteName: "SpaceCatWeb",
      locale: isEn ? "en_US" : "es_ES",
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: localized.title,
      description: localized.excerpt,
    },
  }
}

function renderMarkdown(content: string) {
  const lines = content.split("\n")
  const elements: ReactNode[] = []
  let inList = false
  let listItems: ReactNode[] = []
  let inCode = false
  let codeLines: string[] = []
  let codeLang = ""

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 text-sc-muted">
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${elements.length}`} className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 overflow-x-auto">
          <code className="text-sm text-white/80 font-mono">{codeLines.join("\n")}</code>
        </pre>
      )
      codeLines = []
      inCode = false
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        flushCode()
      } else {
        flushList()
        inCode = true
        codeLang = line.slice(3)
      }
      continue
    }

    if (inCode) {
      codeLines.push(line)
      continue
    }

    if (line.startsWith("### ")) {
      flushList()
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-lg font-semibold text-white mt-6 mb-3">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith("## ")) {
      flushList()
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-xl font-bold text-white mt-8 mb-4">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith("- ")) {
      inList = true
      const text = line.slice(2)
      listItems.push(
        <li key={`li-${elements.length}-${listItems.length}`}>{text}</li>
      )
    } else if (/^\d+\./.test(line)) {
      inList = true
      const text = line.replace(/^\d+\.\s*/, "")
      listItems.push(
        <li key={`oli-${elements.length}-${listItems.length}`}>{text}</li>
      )
    } else if (line.trim() === "") {
      flushList()
    } else {
      flushList()
      elements.push(
        <p key={`p-${elements.length}`} className="text-sc-muted leading-relaxed mb-4">
          {line}
        </p>
      )
    }
  }

  flushList()
  flushCode()
  return elements
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ lang?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const locale = sp?.lang ?? "es"
  const lang = getLang(locale)
  const typedLang = locale === "en" ? "en" : "es"

  const post = getPostBySlug(slug)
  if (!post) notFound()

  const localized = getLocalePost(post, typedLang)

  const otherPosts = posts
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => getLocalePost(p, typedLang))

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: localized.title,
    description: localized.excerpt,
    datePublished: new Date(post.date).toISOString(),
    author: { "@type": "Person", name: post.author, url: baseUrl },
    publisher: {
      "@type": "Organization",
      name: "SpaceCatWeb",
      url: baseUrl,
      logo: { "@type": "ImageObject", url: `${baseUrl}/assets/images/spacecatweblogo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`,
    },
    inLanguage: typedLang,
  }

  return (
    <div className="min-h-screen">
      <Script
        id={`schema-article-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <Link
          href={`/blog?lang=${locale}`}
          className="inline-flex items-center gap-2 text-sm text-sc-muted hover:text-sc-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          {lang.blog_back}
        </Link>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-sc-muted">
            <span className="px-2 py-1 rounded-full bg-sc-primary/10 text-sc-primary text-xs font-medium">
              {localized.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatPostDate(post.date, typedLang)}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} />
              {post.author}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {localized.title}
          </h1>
          <p className="text-lg text-sc-muted leading-relaxed">
            {localized.excerpt}
          </p>
        </header>

        <div className="aspect-[21/9] bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 rounded-2xl flex items-center justify-center mb-10">
          <span className="text-6xl font-black text-white/10">{localized.category[0]}</span>
        </div>

        <div className="prose-custom">
          {renderMarkdown(localized.content)}
        </div>

        {otherPosts.length > 0 && (
          <footer className="mt-16 pt-10 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-6">{lang.blog_related}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherPosts.map((op) => (
                <Link
                  key={op.slug}
                  href={`/blog/${op.slug}?lang=${locale}`}
                  className="group p-4 rounded-xl bg-sc-card/30 border border-white/10 hover:border-sc-primary/30 transition-all"
                >
                  <div className="w-full h-16 rounded-lg bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 flex items-center justify-center mb-3">
                    <span className="text-xl font-black text-white/20">{op.category[0]}</span>
                  </div>
                  <p className="text-xs text-sc-muted mb-1">{formatPostDate(op.date, typedLang)}</p>
                  <h4 className="text-sm font-semibold text-white group-hover:text-sc-primary transition-colors line-clamp-2">
                    {op.title}
                  </h4>
                </Link>
              ))}
            </div>
          </footer>
        )}
      </article>
    </div>
  )
}
