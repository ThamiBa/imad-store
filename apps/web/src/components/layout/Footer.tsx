"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer({ locale }: { locale: string }) {
    const isAr = locale === "ar";

    const t = {
        rights: isAr ? "جميع الحقوق محفوظة" : "All rights reserved",
        terms: isAr ? "الشروط والأحكام" : "Terms",
        privacy: isAr ? "سياسة الخصوصية" : "Privacy",
        contact: isAr ? "اتصل بنا" : "Contact",
        delivery: "توصيل لجميع أنحاء المغرب — الدفع عند الاستلام",
    };

    return (
        <footer dir="rtl" className="bg-[#FDFAF6] text-[#1A1A2E] border-t border-[#C9A96E]/20">

            {/* ── Animated delivery ticker ── */}
            <div className="bg-[#1A1A2E] overflow-hidden py-4">
                <div className="relative flex overflow-hidden">
                    <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
                        className="flex items-center gap-20 whitespace-nowrap"
                    >
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="flex items-center gap-4 text-[16px] md:text-[18px] font-bold tracking-[0.06em] text-[#C9A96E]">
                                🚚 {t.delivery}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── Main footer body ── */}
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-16">

                {/* ── Col 1: Logo ── */}
                <div className="flex flex-col items-start md:items-center gap-6">
                    <Link href={`/${locale}`} className="flex flex-col items-center group">
                        <span
                            className="text-5xl font-light tracking-[0.2em] text-[#1A1A2E] group-hover:text-[#C9A96E] transition-colors duration-300"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            IMAD
                        </span>
                        <span className="text-[11px] tracking-[0.9em] text-[#C9A96E] uppercase font-semibold mt-1">
                            Mode
                        </span>
                    </Link>
                    <div className="w-10 h-px bg-[#C9A96E]/40" />
                    <p className="text-[14px] tracking-[0.05em] text-[#1A1A2E]/50 text-center leading-relaxed">
                        {isAr ? "أزياء مغربية فاخرة" : "Mode Marocaine de Luxe"}
                    </p>
                </div>

                {/* ── Col 2: Navigation ── */}
                <div className="flex flex-col items-start md:items-center">
                    <p className="text-[15px] tracking-[0.3em] uppercase text-[#C9A96E] font-semibold mb-8">
                        {isAr ? "روابط" : "Navigation"}
                    </p>
                    <div className="flex flex-col items-start md:items-center gap-5">
                        {[
                            { label: isAr ? "الرئيسية" : "Accueil", href: `/${locale}` },
                            { label: isAr ? "المتجر" : "Boutique", href: `/${locale}/shop` },
                            { label: t.contact, href: `/${locale}/contact` },
                            { label: t.terms, href: "#" },
                            { label: t.privacy, href: "#" },
                        ].map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="text-[14px] tracking-[0.08em] text-[#1A1A2E]/60 hover:text-[#C9A96E] transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Col 3: Social icons — BRAND COLORS ── */}
                <div className="flex flex-col items-start md:items-center">
                    <p className="text-[15px] tracking-[0.3em] uppercase text-[#C9A96E] font-semibold mb-8">
                        {isAr ? "تواصل معنا" : "Réseaux"}
                    </p>
                    <div className="flex flex-col gap-5">

                        {/* WhatsApp — green icon */}
                        <a href="https://wa.me/212660560522" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 group">
                            <svg width="28" height="28" viewBox="0 0 24 24" className="shrink-0">
                                <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path fill="#25D366" d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.121 1.524 5.855L.057 23.882l6.174-1.618A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.168-1.4l-.371-.22-3.833 1.005 1.025-3.733-.243-.384A9.958 9.958 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                            </svg>
                            <span className="text-[14px] tracking-[0.08em] text-[#25D366] font-medium">WhatsApp</span>
                        </a>

                        {/* Instagram — gradient icon */}
                        <a href="https://www.instagram.com/imad.mode?igsi=em85MTVmanRpa29p" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 group">
                            <svg width="28" height="28" viewBox="0 0 24 24" className="shrink-0">
                                <defs>
                                    <radialGradient id="igGrad" cx="30%" cy="107%" r="150%">
                                        <stop offset="0%" stopColor="#fdf497" />
                                        <stop offset="5%" stopColor="#fdf497" />
                                        <stop offset="45%" stopColor="#fd5949" />
                                        <stop offset="60%" stopColor="#d6249f" />
                                        <stop offset="90%" stopColor="#285AEB" />
                                    </radialGradient>
                                </defs>
                                <path fill="url(#igGrad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                            </svg>
                            <span className="text-[14px] tracking-[0.08em] text-[#E1306C] font-medium">Instagram</span>
                        </a>

                        {/* Facebook — blue icon */}
                        <a href="https://www.facebook.com/share/1Lwh3Akcuo/" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 group">
                            <svg width="28" height="28" viewBox="0 0 24 24" className="shrink-0">
                                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="text-[14px] tracking-[0.08em] text-[#1877F2] font-medium">Facebook</span>
                        </a>

                        {/* TikTok — black icon */}
                        <a href="https://www.tiktok.com/@imad_mode?_r=1&_t=ZS-99NC3oV9y44" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 group">
                            <svg width="28" height="28" viewBox="0 0 24 24" className="shrink-0">
                                <path fill="#010101" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                            </svg>
                            <span className="text-[14px] tracking-[0.08em] text-[#010101] font-medium">TikTok</span>
                        </a>

                        {/* Google Maps — colored pin */}
                        <a href="https://maps.app.goo.gl/SrttcX2rKiUH7FWD7" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 group">
                            <svg width="28" height="28" viewBox="0 0 24 24" className="shrink-0">
                                <path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle fill="white" cx="12" cy="9" r="2.5" />
                            </svg>
                            <span className="text-[14px] tracking-[0.08em] text-[#EA4335] font-medium">Google Maps</span>
                        </a>

                    </div>
                </div>
            </div>

            {/* ── Bottom strip ── */}
            <div className="border-t border-[#C9A96E]/15 py-6 text-center text-[12px] tracking-[0.2em] text-[#1A1A2E]/40">
                © {new Date().getFullYear()} IMAD Mode — {t.rights}
            </div>
        </footer>
    );
}
