"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface PolicySection {
  title: string
  content: string
}

interface PolicyLang {
  policy_title: string
  policy_subtitle: string
  policy_accept: string
  policy_decline: string
  policy_privacy: PolicySection[]
  policy_cookies: PolicySection[]
  policy_data: PolicySection[]
  policy_contact_title: string
  policy_contact: string
  section_privacy_title: string
  section_cookies_title: string
  section_data_title: string
}

const policyES: PolicyLang = {
  policy_title: "Política de Privacidad y Cookies",
  policy_subtitle: "Antes de continuar, te invitamos a revisar cómo manejamos tus datos.",
  policy_accept: "Aceptar",
  policy_decline: "Rechazar Cookies No Esenciales",
  policy_privacy: [
    { title: "Información que Recopilamos", content: "Recopilamos la información que nos proporcionas voluntariamente a través de formularios de contacto y chat. Esto incluye nombre, correo electrónico, país y número de WhatsApp. También recopilamos datos de navegación anónimos mediante cookies para mejorar tu experiencia." },
    { title: "Uso de la Información", content: "Utilizamos tus datos únicamente para responder a tus consultas, brindar nuestros servicios y mejorar la funcionalidad del sitio. No compartimos tu información personal con terceros sin tu consentimiento explícito." },
  ],
  policy_cookies: [
    { title: "Cookies Esenciales", content: "Necesarias para el funcionamiento básico del sitio. No requieren consentimiento." },
    { title: "Cookies de Rendimiento", content: "Nos ayudan a entender cómo los usuarios interactúan con el sitio, permitiéndonos mejorar su funcionamiento." },
    { title: "Cookies de Terceros", content: "Utilizamos herramientas como Google Analytics para análisis de tráfico. Estas cookies pueden ser gestionadas por terceros." },
  ],
  policy_data: [
    { title: "Almacenamiento", content: "Tus datos se almacenan de forma segura y solo se conservan durante el tiempo necesario para cumplir con los fines descritos en esta política." },
    { title: "Tus Derechos", content: "Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Para ejercer estos derechos, contáctanos a través de nuestro formulario." },
    { title: "Cookies", content: "Puedes configurar tu navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie. Sin embargo, algunas funciones del sitio pueden no funcionar correctamente." },
  ],
  policy_contact_title: "Contacto",
  policy_contact: "Si tienes preguntas sobre esta política, contáctanos a través del formulario en nuestro sitio web.",
  section_privacy_title: "Privacidad",
  section_cookies_title: "Cookies",
  section_data_title: "Tus Datos",
}

const policyEN: PolicyLang = {
  policy_title: "Privacy & Cookie Policy",
  policy_subtitle: "Before you continue, please review how we handle your data.",
  policy_accept: "Accept",
  policy_decline: "Decline Non-Essential Cookies",
  policy_privacy: [
    { title: "Information We Collect", content: "We collect information you voluntarily provide through contact forms and chat, including name, email, country, and WhatsApp number. We also collect anonymous browsing data via cookies to improve your experience." },
    { title: "Use of Information", content: "We use your data solely to respond to inquiries, provide our services, and improve site functionality. We do not share your personal information with third parties without explicit consent." },
  ],
  policy_cookies: [
    { title: "Essential Cookies", content: "Required for basic site functionality. No consent required." },
    { title: "Performance Cookies", content: "Help us understand how users interact with the site, enabling us to improve its functionality." },
    { title: "Third-Party Cookies", content: "We use tools like Google Analytics for traffic analysis. These cookies may be managed by third parties." },
  ],
  policy_data: [
    { title: "Storage", content: "Your data is stored securely and retained only as long as necessary to fulfill the purposes described in this policy." },
    { title: "Your Rights", content: "You have the right to access, rectify, or delete your personal data at any time. To exercise these rights, contact us through our form." },
    { title: "Cookies", content: "You can configure your browser to reject all cookies or to indicate when a cookie is being sent. However, some site features may not function properly." },
  ],
  policy_contact_title: "Contact",
  policy_contact: "If you have questions about this policy, contact us through the form on our website.",
  section_privacy_title: "Privacy",
  section_cookies_title: "Cookies",
  section_data_title: "Your Data",
}

function PolicyModal({
  policyLang,
  onAccept,
  onChangeLanguage,
}: {
  policyLang: PolicyLang
  onAccept: () => void
  onChangeLanguage?: () => void
}) {
  const sections = [
    { title: policyLang.section_privacy_title, icon: "🛡️", content: policyLang.policy_privacy },
    { title: policyLang.section_cookies_title, icon: "🍪", content: policyLang.policy_cookies },
    { title: policyLang.section_data_title, icon: "🔐", content: policyLang.policy_data },
  ]

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl mx-auto">
        <div className="p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">{policyLang.policy_title}</h2>
          <p className="text-sc-muted text-xs sm:text-sm mb-5 sm:mb-6">{policyLang.policy_subtitle}</p>
          <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
            {sections.map((section) => (
              <details key={section.title} className="group bg-white/5 rounded-xl overflow-hidden border border-white/5">
                <summary className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer text-white text-sm sm:text-base font-medium hover:bg-white/5 transition-colors">
                  <span className="text-base sm:text-lg shrink-0">{section.icon}</span>
                  <span>{section.title}</span>
                  <span className="ml-auto text-sc-muted group-open:rotate-180 transition-transform shrink-0">▼</span>
                </summary>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-white/5">
                  {section.content.map((item: PolicySection) => (
                    <div key={item.title} className="mt-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-sc-primary mb-1">{item.title}</h4>
                      <p className="text-xs text-sc-muted leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
          <div className="p-3 sm:p-4 bg-sc-primary/5 rounded-xl border border-sc-primary/10 mb-5 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-white mb-1">{policyLang.policy_contact_title}</h3>
            <p className="text-xs text-sc-muted">{policyLang.policy_contact}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onAccept}
              className="flex-1 py-3 px-5 sm:px-6 bg-sc-primary text-white rounded-xl text-sm sm:text-base font-medium hover:bg-sc-primary/80 transition-colors active:scale-[0.98]"
            >
              {policyLang.policy_accept}
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-3 px-5 sm:px-6 bg-white/5 text-sc-muted rounded-xl text-sm sm:text-base font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              {policyLang.policy_decline}
            </button>
          </div>
          {onChangeLanguage && (
            <div className="mt-4 text-center">
              <button
                onClick={onChangeLanguage}
                className="text-xs text-sc-muted hover:text-white underline transition-colors"
              >
                Cambiar idioma / Change language
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LanguageSplash() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(true)
  const [showPolicy, setShowPolicy] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)

  useEffect(() => {
    const hasVisited = localStorage.getItem("uwf_lang_selected")
    const hasLangParam = searchParams?.get("lang")
    if (hasVisited || hasLangParam) {
      setShow(false)
      return
    }
    const detected = navigator.language?.startsWith("es") ? "es" : "en"
    setSelectedLang(detected)
    setShowPolicy(true)
  }, [searchParams])

  const selectLanguage = (lang: string) => {
    setSelectedLang(lang)
    setShowPolicy(true)
  }

  const handleChangeLanguage = () => {
    setShowPolicy(false)
    setSelectedLang(null)
  }

  const handlePolicyAccept = () => {
    try {
      localStorage.setItem("uwf_lang_selected", "true")
      document.cookie = `uwf_lang=${selectedLang}; path=/; max-age=2592000`
    } catch (_) {}
    const qs = selectedLang === "en" ? "?lang=en" : "/"
    window.location.href = qs
  }

  const langStrings = {
    splash_slogan: "Explora el Universo de la Innovación Digital",
    splash_title: "Bienvenido a SpaceCatWeb",
    splash_subtitle: "Selecciona tu idioma preferido",
    splash_english: "English",
    splash_spanish: "Español",
  }

  if (!show) return null

  if (showPolicy && selectedLang) {
    const policyLang = selectedLang === "en" ? policyEN : policyES
    return <PolicyModal policyLang={policyLang} onAccept={handlePolicyAccept} onChangeLanguage={handleChangeLanguage} />
  }

  return (
    <div
      id="language-splash"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-3 sm:p-6"
      style={{
        background: "linear-gradient(-45deg, #ff6b35, #f7931e, #fdc830, #f37335, #e67e22, #d35400, #f39c12, #ff8c42)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 12s ease infinite, colorPulse 8s ease-in-out infinite",
      }}
    >
      <div
        className="text-center w-full max-w-lg mx-auto"
        style={{
          animation: "fadeInUp 0.8s ease",
          background: "rgba(255,255,255,0.95)",
          padding: "clamp(30px, 5vw, 60px) clamp(20px, 4vw, 50px)",
          borderRadius: "30px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(211,84,0,0.2)",
        }}
      >
        <img
          src="/assets/images/SpaceCatWeb.webp"
          alt="SpaceCatWeb"
          className="block mx-auto mb-6 sm:mb-8"
          style={{
            width: "clamp(180px, 40vw, 280px)",
            maxWidth: "80vw",
            height: "auto",
            filter: "drop-shadow(0 10px 30px rgba(211,84,0,0.3))",
            animation: "pulse-glow-logo 2s ease-in-out infinite",
          }}
        />

        <h2
          className="font-bold"
          style={{
            fontSize: "clamp(1rem, 3.5vw, 1.8rem)",
            color: "#2a2a2a",
            marginBottom: "clamp(8px, 2vw, 15px)",
            fontFamily: "'Poppins', sans-serif",
            lineHeight: 1.4,
            padding: "0 4px",
            wordBreak: "break-word",
          }}
        >
          {langStrings.splash_slogan}
        </h2>

        <h3
          className="font-bold"
          style={{
            fontSize: "clamp(1.1rem, 4vw, 2rem)",
            color: "#2a2a2a",
            marginBottom: "clamp(6px, 1.5vw, 10px)",
            fontFamily: "'Poppins', sans-serif",
            wordBreak: "break-word",
          }}
        >
          {langStrings.splash_title}
        </h3>

        <p
          style={{
            fontSize: "clamp(0.8rem, 2vw, 1.1rem)",
            color: "#666",
            marginBottom: "clamp(25px, 5vw, 50px)",
            fontFamily: "'Poppins', sans-serif",
            padding: "0 4px",
          }}
        >
          {langStrings.splash_subtitle}
        </p>

        <div
          className="flex flex-wrap justify-center"
          style={{ gap: "clamp(12px, 3vw, 30px)" }}
        >
          <button
            onClick={() => selectLanguage("en")}
            className="language-option"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "clamp(18px, 3vw, 30px) clamp(20px, 4vw, 40px)",
              background: "linear-gradient(135deg, rgba(211,84,0,0.1), rgba(211,84,0,0.05))",
              border: "2px solid rgba(211,84,0,0.3)",
              borderRadius: "20px",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              minWidth: "clamp(120px, 30vw, 160px)",
              flex: "1 1 auto",
              transition: "all 0.3s ease",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(211,84,0,0.2), rgba(211,84,0,0.1))"
              e.currentTarget.style.borderColor = "#E67E22"
              e.currentTarget.style.transform = "translateY(-5px)"
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(211,84,0,0.4)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(211,84,0,0.1), rgba(211,84,0,0.05))"
              e.currentTarget.style.borderColor = "rgba(211,84,0,0.3)"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <img
              src="/assets/images/flag-us.webp"
              alt="English"
              style={{
                width: "clamp(42px, 8vw, 64px)",
                height: "clamp(42px, 8vw, 64px)",
                borderRadius: "50%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                objectFit: "cover",
                aspectRatio: "1/1",
                marginBottom: "clamp(8px, 2vw, 15px)",
              }}
            />
            <span
              style={{
                fontSize: "clamp(0.9rem, 2.5vw, 1.3rem)",
                fontWeight: 600,
                color: "#2a2a2a",
                fontFamily: "'Poppins', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {langStrings.splash_english}
            </span>
          </button>

          <button
            onClick={() => selectLanguage("es")}
            className="language-option"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "clamp(18px, 3vw, 30px) clamp(20px, 4vw, 40px)",
              background: "linear-gradient(135deg, rgba(211,84,0,0.1), rgba(211,84,0,0.05))",
              border: "2px solid rgba(211,84,0,0.3)",
              borderRadius: "20px",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              minWidth: "clamp(120px, 30vw, 160px)",
              flex: "1 1 auto",
              transition: "all 0.3s ease",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(211,84,0,0.2), rgba(211,84,0,0.1))"
              e.currentTarget.style.borderColor = "#E67E22"
              e.currentTarget.style.transform = "translateY(-5px)"
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(211,84,0,0.4)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(211,84,0,0.1), rgba(211,84,0,0.05))"
              e.currentTarget.style.borderColor = "rgba(211,84,0,0.3)"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <img
              src="/assets/images/flag-es.webp"
              alt="Español"
              style={{
                width: "clamp(42px, 8vw, 64px)",
                height: "clamp(42px, 8vw, 64px)",
                borderRadius: "50%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                objectFit: "cover",
                aspectRatio: "1/1",
                marginBottom: "clamp(8px, 2vw, 15px)",
              }}
            />
            <span
              style={{
                fontSize: "clamp(0.9rem, 2.5vw, 1.3rem)",
                fontWeight: 600,
                color: "#2a2a2a",
                fontFamily: "'Poppins', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {langStrings.splash_spanish}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
