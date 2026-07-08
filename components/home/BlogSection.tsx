"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react"
import ScrollyFrames from "@/components/ui/scrolly-frames"
import CardModal from "@/components/ui/card-modal"
import type { Lang } from "@/lib/lang"

interface BlogSectionProps {
  lang: Lang
}

const posts = [
  {
    title: "Building Modern Web Apps with Next.js 16",
    excerpt: "Discover the latest features and improvements in Next.js 16 and how they can accelerate your development workflow.",
    date: "Jun 15, 2026",
    author: "Johandri Suarez",
    category: "Development",
    slug: "building-modern-web-apps-nextjs-16",
    image: null,
  },
  {
    title: "The Future of Web Performance",
    excerpt: "Learn about the latest performance optimization techniques and how they impact user experience and SEO rankings.",
    date: "Jun 10, 2026",
    author: "Johandri Suarez",
    category: "Performance",
    slug: "future-of-web-performance",
    image: null,
  },
  {
    title: "Responsive Design Best Practices in 2026",
    excerpt: "A comprehensive guide to creating seamless experiences across all devices with modern CSS and design patterns.",
    date: "Jun 5, 2026",
    author: "Johandri Suarez",
    category: "Design",
    slug: "responsive-design-best-practices-2026",
    image: null,
  },
  {
    title: "Why I Switched from REST to GraphQL",
    excerpt: "A practical comparison of REST and GraphQL APIs, with real examples of when each approach makes sense for your project.",
    date: "May 28, 2026",
    author: "Johandri Suarez",
    category: "Backend",
    slug: "rest-vs-graphql",
    image: null,
  },
  {
    title: "My Journey as a Venezuelan Full Stack Developer",
    excerpt: "Personal insights about working remotely from Venezuela, building international projects, and the lessons learned along the way.",
    date: "May 20, 2026",
    author: "Johandri Suarez",
    category: "Career",
    slug: "venezuelan-developer-journey",
    image: null,
  },
  {
    title: "Getting Started with TypeScript for JavaScript Developers",
    excerpt: "A beginner-friendly guide to TypeScript that covers the basics, common pitfalls, and how to migrate your projects gradually.",
    date: "May 12, 2026",
    author: "Johandri Suarez",
    category: "TypeScript",
    slug: "typescript-for-js-developers",
    image: null,
  },
] as const

export default function BlogSection({ lang }: BlogSectionProps) {
  return (
    <Suspense fallback={null}>
      <BlogSectionInner lang={lang} />
    </Suspense>
  )
}

function BlogSectionInner({ lang }: BlogSectionProps) {
  const searchParams = useSearchParams()
  const locale = searchParams.get("lang") || "es"
  const featuredPost = posts[0]
  const secondaryPosts = posts.slice(1)
  const [openPost, setOpenPost] = useState<number | null>(null)

  return (
    <section id="blog" className="relative">
      <ScrollyFrames
        className="relative min-h-screen flex items-center"
        innerClassName="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        pinSpacing={1200}
        startOffset={80}
        showProgress={true}
      >
        <div className="flex flex-col items-center justify-center w-full text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-mono tracking-[0.3em] uppercase text-sc-primary border border-sc-primary/30 bg-sc-primary/5">
            <BookOpen size={12} />
            {lang.nav_blog}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl">
            {lang.blog_title}
          </h2>
        </div>

        {featuredPost && (
          <article className="flex items-center justify-center w-full">
            <button
              onClick={() => setOpenPost(0)}
              className="group text-left w-full max-w-4xl rounded-2xl bg-sc-card/40 backdrop-blur-md border border-white/10 overflow-hidden hover:border-sc-primary/30 transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="aspect-[21/9] bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 flex items-center justify-center">
                <span className="text-6xl font-black text-white/10">{featuredPost.category[0]}</span>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4 text-xs text-sc-muted">
                  <span className="px-2 py-1 rounded-full bg-sc-primary/10 text-sc-primary text-xs font-medium">
                    {lang.blog_featured_label}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {featuredPost.author}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-3 group-hover:text-sc-primary transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="text-sc-muted leading-relaxed mb-5 line-clamp-2">
                  {featuredPost.excerpt}
                </p>
                <div className="inline-flex items-center gap-1 text-sm text-sc-primary font-medium">
                  {lang.blog_read_more}
                  <ArrowRight size={14} />
                </div>
              </div>
            </button>
          </article>
        )}

        <div className="flex flex-col items-center justify-center w-full">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-sc-primary/90">
            {lang.blog_more_articles}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
            {secondaryPosts.map((post, idx) => (
              <button
                key={post.slug}
                onClick={() => setOpenPost(idx + 1)}
                className="group text-left flex gap-4 p-4 rounded-xl bg-sc-card/30 backdrop-blur-md border border-white/10 hover:border-sc-primary/30 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-20 h-20 shrink-0 rounded-lg bg-gradient-to-br from-sc-primary/20 to-sc-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-black text-white/20">{post.category[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 text-xs text-sc-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-sc-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-sc-muted leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <a
            href={`/blog?lang=${locale}`}
            className="mt-8 inline-flex items-center gap-2 text-sm text-sc-primary font-medium hover:gap-3 transition-all"
          >
            {lang.blog_view_all}
            <ArrowRight size={14} />
          </a>
        </div>

      </ScrollyFrames>

      {posts.map((post, idx) => (
        <CardModal
          key={post.slug}
          isOpen={openPost === idx}
          onClose={() => setOpenPost(null)}
          title={post.title}
        >
          <div className="flex items-center gap-4 mb-4 text-xs text-sc-muted">
            <span className="px-2 py-1 rounded-full bg-sc-primary/10 text-sc-primary text-xs font-medium">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} />
              {post.author}
            </span>
          </div>
          <p className="text-sc-muted leading-relaxed">
            {post.excerpt}
          </p>
        </CardModal>
      ))}
    </section>
  )
}
