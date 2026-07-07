import { Mail, Phone, ChevronUp } from "lucide-react"
import type { Lang } from "@/lib/lang"

interface FooterProps {
  lang: Lang
}

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const socialLinks = [
  { icon: InstagramIcon, href: "https://www.instagram.com/spacecatweb", label: "Instagram" },
  { icon: Mail, href: "mailto:suarezjohandri@gmail.com", label: "Email" },
  { icon: Phone, href: "tel:+584243529962", label: "Phone" },
]

export default function Footer({ lang }: FooterProps) {
  return (
    <footer className="relative overflow-hidden">
      <div className="footer-bg-motion footer-shine-layer absolute inset-0" />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="lg:col-span-2">
              <img
                src="/assets/images/SpaceCatWeb.webp"
                alt="SpaceCatWeb"
                className="h-10 w-auto"
              />
              <p className="mt-4 text-sm text-sc-muted leading-relaxed max-w-md">
                {lang.footer_description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {lang.footer_quick_links}
              </h4>
              <ul className="space-y-2.5">
                {["home", "about", "services", "portfolio", "pricing", "contact"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item === "home" ? "home" : item}`}
                        className="text-sm text-sc-muted hover:text-sc-primary transition-colors duration-200"
                      >
                        {lang[`nav_${item}` as keyof typeof lang] as string}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {lang.footer_follow_us}
              </h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-sc-muted hover:bg-sc-primary hover:text-white transition-colors duration-200 hover:-translate-y-0.5"
                      aria-label={social.label}
                    >
                      <Icon size={16} />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-sc-muted">
              &copy; {new Date().getFullYear()} SpaceCatWeb. {lang.footer_rights}
            </p>
            <a
              href="#home"
              className="flex items-center gap-2 text-xs text-sc-muted hover:text-sc-primary transition-colors"
            >
              <ChevronUp size={14} />
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
