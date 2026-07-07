import type { Metadata } from "next"
import { getLang } from "@/lib/lang"
import Script from "next/script"
import HeroSection from "@/components/home/HeroSection"
import PaymentSection from "@/components/home/PaymentSection"
import AboutSection from "@/components/home/AboutSection"
import ServicesSection from "@/components/home/ServicesSection"
import PortfolioSection from "@/components/home/PortfolioSection"
import PricingSection from "@/components/home/PricingSection"
import BlogSection from "@/components/home/BlogSection"
import LaGuairaSection from "@/components/home/LaGuairaSection"
import ContactSection from "@/components/home/ContactSection"
import UnderConstruction from "@/components/ui/under-construction"

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
    title: isEn
      ? "SpaceCatWeb — Web Development & Digital Solutions"
      : "SpaceCatWeb — Desarrollo Web & Soluciones Digitales",
    description: isEn
      ? "SpaceCatWeb offers professional web development, SEO optimization, e-commerce solutions, and digital marketing."
      : "SpaceCatWeb ofrece desarrollo web profesional, optimización SEO, soluciones de comercio electrónico y marketing digital.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: isEn ? `${baseUrl}/?lang=en` : baseUrl,
      languages: {
        "x-default": baseUrl,
        es: baseUrl,
        en: `${baseUrl}/?lang=en`,
      },
    },
    openGraph: {
      title: isEn
        ? "SpaceCatWeb — Web Development & Digital Solutions"
        : "SpaceCatWeb — Desarrollo Web & Soluciones Digitales",
      description: isEn
        ? "Professional web development, SEO, e-commerce, and digital marketing."
        : "Desarrollo web profesional, SEO, e-commerce y marketing digital.",
      url: isEn ? `${baseUrl}/?lang=en` : baseUrl,
      siteName: "SpaceCatWeb",
      locale: isEn ? "en_US" : "es_ES",
      type: "website",
      images: [
        {
          url: "/assets/images/SpaceCatWeb.webp",
          width: 1200,
          height: 630,
          alt: "SpaceCatWeb",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "SpaceCatWeb",
      description: isEn
        ? "Professional web development, SEO, e-commerce, and digital marketing."
        : "Desarrollo web profesional, SEO, e-commerce y marketing digital.",
      images: ["/assets/images/SpaceCatWeb.webp"],
    },
    robots: { index: true, follow: true },
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>
}) {
  const params = await searchParams
  const locale = params?.lang ?? "es"
  const lang = getLang(locale)

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SpaceCatWeb",
    url: baseUrl,
    description:
      locale === "en"
        ? "Professional web development, SEO, e-commerce, and digital marketing."
        : "Desarrollo web profesional, SEO, e-commerce y marketing digital.",
    inLanguage: locale === "en" ? "en" : "es",
    author: {
      "@type": "Organization",
      name: "SpaceCatWeb",
      url: baseUrl,
    },
  }

  return (
    <>
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HeroSection lang={lang} />
      <PaymentSection lang={lang} />
      <AboutSection lang={lang} />
      <ServicesSection lang={lang} />
      <PortfolioSection lang={lang} />
      <PricingSection lang={lang} />
      <BlogSection lang={lang} />
      <LaGuairaSection lang={lang} />
      <ContactSection lang={lang} />
      <UnderConstruction lang={lang} />
    </>
  )
}
