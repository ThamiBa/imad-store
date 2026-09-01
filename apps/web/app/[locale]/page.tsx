"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, MessageCircle, Sparkles, Mail, ShoppingBag, Star } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

/* ─── Helpers ─────────────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ─── Mock data ──────────────────────── */
const HERO_SLIDES = [
    {
        id: 1,
        img: "/images/hero-1.png",
        video: null,
        badge: "Collection Printemps 2025",
        badgeAr: "مجموعة ربيع 2025",
        badgeEn: "Spring Collection 2025",
        title: "L'Élégance",
        titleAr: "الأناقة",
        titleEn: "Absolute",
        title2: "Absolue",
        title2Ar: "المطلقة",
        title2En: "Elegance",
        sub: "Découvrez l'art du voile de luxe. Des créations exclusives pensées pour sublimer votre allure.",
        subAr: "اكتشفي فن الأزياء الفاخرة. إبداعات حصرية مصممة لتعزيز أناقتك.",
        subEn: "Discover the art of luxury fashion. Exclusive creations designed to sublimate your allure."
    },
    {
        id: 2,
        img: "/images/hero-2.png",
        video: null,
        badge: "Édition Limitée",
        badgeAr: "إصدار محدود",
        badgeEn: "Limited Edition",
        title: "Nuit",
        titleAr: "ليلة",
        titleEn: "Starry",
        title2: "Étoilée",
        title2Ar: "مرصعة بالنجوم",
        title2En: "Night",
        sub: "La beauté dans chaque détail. Broderies main et soie perlée.",
        subAr: "الجمال في كل تفصيلة. تطريز يدوي وحرير مطرز.",
        subEn: "Beauty in every detail. Hand embroidery and pearled silk."
    },
    {
        id: 3,
        img: "/images/cat-abayas.png",
        video: null,
        badge: "Atelier Premium",
        badgeAr: "أتيليه بريميوم",
        badgeEn: "Premium Atelier",
        title: "Artisanat",
        titleAr: "حرفية",
        titleEn: "Exceptional",
        title2: "D'Exception",
        title2Ar: "استثنائية",
        title2En: "Craftsmanship",
        sub: "Tissus nobles et confections royales inspirées de l'Andalousie.",
        subAr: "أقمشة نبيلة وتفاصيل ملكية مستوحاة من الأندلس.",
        subEn: "Noble fabrics and royal tailoring inspired by Andalusia."
    },
];

const CATEGORIES = [
    { slug: "saikan", img: "/images/cat-abayas.png", labelAr: "صيكان" },
    { slug: "abayas", img: "/images/cat-abayas.png", labelAr: "العبايات" },
    { slug: "shailan", img: "/images/hero-1.png", labelAr: "شيلان" },
    { slug: "shoes-women", img: "/images/cat-shoes.png", labelAr: "أحذية نسائية" },
    { slug: "shoes-men", img: "/images/cat-shoes.png", labelAr: "صابو رجالي" },
];

const FEATURED_PRODUCTS = [
    { id: 1, slug: "abaya-soie-ivoire", nameFr: "Abaya Royale Ivoire", nameAr: "عباءة ملكية عاجي", nameEn: "Royal Ivory Abaya", price: 890, compareAt: 1200, img1: "/images/hero-1.png", img2: "/images/cat-abayas.png", colors: ["#F5EDE0", "#1A1A2E"] },
    { id: 2, slug: "souliers-cuir-or", nameFr: "Souliers Cuir Or", nameAr: "حذاء جلد ذهبي", nameEn: "Gold Leather Shoes", price: 560, compareAt: 780, img1: "/images/cat-shoes.png", img2: "/images/hero-1.png", colors: ["#C9A96E", "#F5EDE0"] },
    { id: 3, slug: "abaya-brodee-or", nameFr: "Abaya Brodée Or", nameAr: "عباءة مطرزة بالذهب", nameEn: "Gold Embroidered Abaya", price: 1290, compareAt: 1600, img1: "/images/cat-abayas.png", img2: "/images/hero-2.png", colors: ["#C9A96E", "#F5EDE0"] },
];

const HOT_SELLERS = [
    { id: 10, slug: "abaya-soie-ivoire", nameFr: "Abaya Nuit Velours", nameAr: "مخمل ليلي", nameEn: "Night Velvet Abaya", price: 1450, img: "/images/hero-1.png", tag: "Édition Limitée" },
    { id: 11, slug: "souliers-cuir-or", nameFr: "Souliers Cuir Or", nameAr: "حذاء جلد ذهبي", nameEn: "Gold Leather Shoes", price: 560, img: "/images/cat-shoes.png", tag: "Bestseller" },
    { id: 12, slug: "hijab-premium-noir", nameFr: "Cape Orientale", nameAr: "كاب شرقي", nameEn: "Oriental Cape", price: 1100, img: "/images/hero-2.png", tag: "Nouveau" },
];

const MARQUEE_ITEMS = ["Maison de Haute Couture Modeste", "Livraison Express Offerte dès 800 MAD", "Créations Uniques & Éditions Limitées", "Satisfait ou Remboursé 14 Jours"];

/* ─── Components ─────────────────────────────────────────── */

function HeroSection({ locale }: { locale: string }) {
    const [active, setActive] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
    const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    useEffect(() => {
        const timer = setInterval(() => {
            setActive((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 6000); // Slower, more cinematic transitions
        return () => clearInterval(timer);
    }, []);

    const slide = HERO_SLIDES[active];

    const getText = (s: typeof HERO_SLIDES[0]) => {
        if (locale === "ar") return { badge: s.badgeAr, t1: s.titleAr, t2: s.title2Ar, sub: s.subAr };
        if (locale === "en") return { badge: s.badgeEn, t1: s.titleEn, t2: s.title2En, sub: s.subEn };
        return { badge: s.badge, t1: s.title, t2: s.title2, sub: s.sub };
    };

    const t = getText(slide);

    return (
        <section ref={containerRef} className="relative h-screen min-h-[800px] bg-[#1A1A2E] overflow-hidden flex items-center justify-center">
            {/* Cinematic Image Background with deep zoom scale */}
            <motion.div style={{ y: imgY, scale: 1.05 }} className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <Image src={slide.img} alt={t.t1} fill className="object-cover object-[center_20%] opacity-50" priority />
                        {/* Vignette effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#1A1A2E]/50 to-[#1A1A2E] opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/20 to-[#1A1A2E]/80" />
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Content — Luxury Brand Center */}
            <motion.div style={{ y: textY, opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
                        className="flex flex-col items-center max-w-4xl mx-auto text-center gap-8"
                    >
                        {/* Brand label */}
                        <motion.p variants={fadeUp} className="text-[#C9A96E] text-[10px] md:text-[11px] tracking-[0.5em] uppercase font-medium flex items-center gap-4">
                            <span className="w-8 h-px bg-[#C9A96E]/60" />
                            IMAD MODE — Maroc
                            <span className="w-8 h-px bg-[#C9A96E]/60" />
                        </motion.p>

                        {/* Main headline */}
                        <motion.h1
                            variants={fadeUp}
                            className="text-white leading-[1.3] font-medium max-w-5xl mx-auto"
                            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            dir="rtl"
                        >
                            {locale === "ar" ? (
                                <>
                                    🔥الهمة والأناقة لي كتقلبي عليها... اختاري لي يواتيك وتميزي بإطلالة{" "}
                                    <em className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A96E] via-[#F0D89A] to-[#C9A96E] not-italic font-bold">
                                        كتحمق ✨
                                    </em>
                                </>
                            ) : (
                                <>
                                    Élégance <br />
                                    <em className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A96E] via-[#F0D89A] to-[#C9A96E] italic">
                                        Marocaine
                                    </em>
                                </>
                            )}
                        </motion.h1>

                        {/* Categories */}
                        <motion.p
                            variants={fadeUp}
                            className="text-[#C9A96E] text-[10px] md:text-[12px] tracking-[0.2em] uppercase max-w-sm mb-4"
                        >
                            {locale === "ar" ? "صيكان • عبايات • شيلان • أحذية" : "Saikan · Abayas · Shailan · Chaussures"}
                        </motion.p>

                        {/* CTA */}
                        <motion.div variants={fadeUp}>
                            <Link
                                href={`/${locale}/shop`}
                                className="group inline-flex items-center gap-4 bg-transparent border border-[#C9A96E] text-[#C9A96E] text-[10px] tracking-[0.35em] uppercase px-12 py-5 font-medium transition-all duration-500 hover:bg-[#C9A96E] hover:text-white"
                            >
                                {locale === "ar" ? "اكتشفي المجموعة" : "Explorer la Collection"}
                                <ArrowRight size={13} className={`transition-transform group-hover:translate-x-1 ${locale === "ar" ? "rotate-180" : ""}`} />
                            </Link>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Ultra-minimal slide indicators */}
            <div className="absolute bottom-12 inset-x-0 flex justify-center gap-3">
                {HERO_SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        className="relative group py-2"
                    >
                        <div className={`w-8 h-[2px] transition-all duration-700 ${i === active ? "bg-[#C9A96E]" : "bg-white/20 group-hover:bg-white/40"}`} />
                        {i === active && (
                            <motion.div layoutId="active-nav" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-[#C9A96E] blur-[2px]" />
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}
function MarqueeBar({ locale }: { locale: string }) {
    // Uniform spherical category items
    const BUBBLE_ITEMS = [
        { img: "/images/cat-abayas.png", slug: "saikan", labelAr: "صيكان" },
        { img: "/images/cat-abayas.png", slug: "abayas", labelAr: "العبايات" },
        { img: "/images/hero-1.png", slug: "shailan", labelAr: "شيلان" },
        { img: "/images/cat-shoes.png", slug: "shoes-women", labelAr: "أحذية نسائية" },
        { img: "/images/hero-2.png", slug: "pyjamas", labelAr: "بيجامات" },
        { img: "/images/cat-shoes.png", slug: "shoes-men", labelAr: "صابو رجالي" },
    ];

    const MarqueeBlock = () => (
        <div className="flex gap-6 md:gap-12 items-center px-3 md:px-6">
            {BUBBLE_ITEMS.map((item, i) => (
                <Link
                    key={i}
                    href={`/${locale}/shop?category=${item.slug}`}
                    className="flex flex-col items-center gap-4 group cursor-pointer w-12 md:w-20 flex-shrink-0"
                >
                    {/* Even Smaller Uniform 'Ball' */}
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden relative border-2 border-[#C9A96E]/20 group-hover:border-[#C9A96E] transition-colors duration-500 shadow-xl">
                        <Image
                            src={item.img}
                            alt={item.slug}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                        />
                    </div>
                    {/* The Label */}
                    <span className="text-[#1A1A2E] text-[9px] md:text-[10px] tracking-[0.15em] font-bold text-center" dir="rtl">
                        {item.labelAr}
                    </span>
                </Link>
            ))}
        </div>
    );

    return (
        <div className="bg-[#FDFAF6] py-14 md:py-24 border-b border-[#1A1A2E]/5 overflow-hidden">
            {/* Beautiful Title */}
            <div className="text-center mb-10 md:mb-14">
                <h3 className="text-[#1A1A2E] text-2xl md:text-3xl uppercase tracking-[0.3em] font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {locale === "ar" ? "مجموعاتنا" : locale === "en" ? "Our Collections" : "Nos Collections"}
                </h3>
                <div className="w-16 h-px bg-[#C9A96E]/60 mx-auto mt-6" />
            </div>

            <div className="relative w-full flex whitespace-nowrap" dir="ltr">
                <div
                    className="flex w-max"
                    style={{ animation: "bubble-marquee 35s linear infinite" }}
                >
                    <MarqueeBlock />
                    <MarqueeBlock />
                    <MarqueeBlock />
                    <MarqueeBlock />
                    <MarqueeBlock />
                    <MarqueeBlock />
                </div>
            </div>
            <style>{`
                @keyframes bubble-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-100% / 6)); }
                }
            `}</style>
        </div>
    );
}

function CollectionGallery({ locale }: { locale: string }) {
    return (
        <section className="bg-[#1A1A2E] py-20 md:py-28 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
                    className="flex flex-col items-center text-center mb-14 md:mb-20"
                >
                    <motion.p variants={fadeUp} className="text-[#C9A96E] text-[13px] tracking-[0.4em] uppercase mb-4">
                        {locale === "ar" ? "مجموعاتنا" : "Nos Collections"}
                    </motion.p>
                    <motion.h2 variants={fadeUp}
                        className="text-white font-light"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "0.05em" }}
                    >
                        {locale === "ar" ? "أحدث " : "Nos "}
                        <em className="text-[#C9A96E] italic">{locale === "ar" ? "عروضنا" : "Collections"}</em>
                    </motion.h2>
                    <motion.div variants={fadeUp} className="w-12 h-px bg-[#C9A96E]/40 mx-auto mt-8" />
                </motion.div>

                {/* ── 5-item Bento: 2 big top + 3 equal bottom ── */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4" dir="rtl">

                    {/* Top row — 2 large cards (3 cols each) */}
                    {CATEGORIES.slice(0, 2).map((cat, i) => (
                        <motion.div
                            key={cat.slug}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }}
                            className="col-span-2 md:col-span-3 h-[260px] md:h-[440px] relative group overflow-hidden"
                        >
                            <BentoCard cat={cat} locale={locale} large />
                        </motion.div>
                    ))}

                    {/* Bottom row — 3 equal cards (2 cols each) */}
                    {CATEGORIES.slice(2).map((cat, i) => (
                        <motion.div
                            key={cat.slug}
                            initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.06 * i }}
                            className="col-span-1 md:col-span-2 h-[200px] md:h-[320px] relative group overflow-hidden"
                        >
                            <BentoCard cat={cat} locale={locale} />
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center mt-12 md:mt-16">
                    <Link
                        href={`/${locale}/shop`}
                        className="group inline-flex items-center gap-4 border border-[#C9A96E]/40 text-[#C9A96E] text-[13px] tracking-[0.2em] uppercase px-12 py-4 hover:bg-[#C9A96E] hover:text-white transition-all duration-300"
                    >
                        {locale === "ar" ? "تصفح كامل المجموعة" : "Voir toute la collection"}
                        <span className="w-8 h-px bg-current group-hover:w-12 transition-all duration-300" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function BentoCard({ cat, locale, large }: { cat: typeof CATEGORIES[0]; locale: string; large?: boolean }) {
    return (
        <Link href={`/${locale}/shop?category=${cat.slug}`} className="block w-full h-full relative">
            <Image
                src={cat.img}
                alt={cat.labelAr}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)]"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/90 via-[#1A1A2E]/20 to-transparent" />
            {/* Gold border on hover */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C9A96E]/50 transition-all duration-500 pointer-events-none" />

            <div className="absolute bottom-0 inset-x-0 p-5 md:p-8">
                <h3
                    className="text-white font-light leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: large ? "clamp(1.8rem, 4vw, 2.8rem)" : "clamp(1.3rem, 2.5vw, 2rem)" }}
                    dir="rtl"
                >
                    {cat.labelAr}
                </h3>
                <div className="flex items-center gap-2 mt-3 text-[#C9A96E] text-[11px] md:text-[12px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="w-5 h-px bg-[#C9A96E]" />
                    {locale === "ar" ? "اكتشفي" : "Découvrir"}
                </div>
            </div>
        </Link>
    );
}



function ProductCardRefined({ product, locale }: { product: typeof FEATURED_PRODUCTS[0]; locale: string }) {
    const [hovered, setHovered] = useState(false);
    const { openCart } = useCartStore();

    function getName() {
        if (locale === "ar") return product.nameAr;
        if (locale === "en") return product.nameEn;
        return product.nameFr;
    }

    return (
        <div className="group flex-shrink-0 w-[280px] md:w-[360px]">
            {/* Image Box */}
            <Link href={`/${locale}/products/${product.slug}`}>
                <div
                    className="relative aspect-[3/4] overflow-hidden bg-[#F5EDE0] mb-6"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <Image src={product.img1} alt={getName()} fill className={`object-cover transition-opacity duration-1000 ${hovered ? "opacity-0" : "opacity-100"}`} />
                    <Image src={product.img2} alt={getName()} fill className={`object-cover transition-opacity duration-1000 ${hovered ? "opacity-100" : "opacity-0"}`} />

                    {/* Dark gradient on hover to make text pop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Floating Add to Cart */}
                    <motion.button
                        onClick={(e) => { e.preventDefault(); openCart(); }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-xl text-[#1A1A2E] text-[9px] tracking-[0.25em] uppercase px-8 py-4 font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#1A1A2E] hover:text-white"
                    >
                        {locale === "ar" ? "إضافة" : locale === "en" ? "Quick Add" : "Ajout Rapide"}
                    </motion.button>
                </div>
            </Link>

            {/* Info Box */}
            <div className="flex flex-col items-center text-center">
                <p className="text-[#C9A96E] text-[9px] tracking-[0.3em] uppercase mb-2">Haute Couture</p>
                <h3 className="text-[#1A1A2E] font-light text-2xl mb-3 leading-tight hover:text-[#C9A96E] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {getName()}
                </h3>
                <div className="flex items-center gap-4">
                    {product.compareAt && (
                        <span className="text-[#8B8399] text-[13px] line-through">{product.compareAt.toLocaleString()} MAD</span>
                    )}
                    <span className="text-[#1A1A2E] font-medium text-[15px]">{product.price.toLocaleString()} MAD</span>
                </div>
            </div>
        </div>
    );
}

function FeaturedCarousel({ locale }: { locale: string }) {
    return (
        <section className="py-32 bg-white border-b border-[#C9A96E]/10">
            <div className="max-w-[1600px] mx-auto px-6 overflow-hidden">
                <motion.div
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    className="flex flex-col items-center text-center mb-20"
                >
                    <motion.p variants={fadeUp} className="text-[#8B8399] text-[10px] tracking-[0.35em] uppercase mb-4">
                        {locale === "ar" ? "مختارات مميزة" : locale === "en" ? "Featured Pieces" : "Pièces Vedettes"}
                    </motion.p>
                    <motion.h2 variants={fadeUp} className="text-[#1A1A2E] text-4xl md:text-6xl font-black uppercase tracking-widest flex flex-wrap justify-center items-center gap-x-4">
                        {locale === "ar" ? "توقيع" : locale === "en" ? "OUR" : "NOS"}
                        <em className="text-[#C9A96E] font-serif font-light italic normal-case tracking-normal text-5xl md:text-7xl">
                            {locale === "ar" ? "الدار" : locale === "en" ? "Signatures" : "Signatures"}
                        </em>
                    </motion.h2>
                </motion.div>

                {/* Bleeding scroll carousel */}
                <div className="-mx-6 px-6 md:mx-0 md:px-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {/* Empty spacing for initial scroll padding */}
                        <div className="w-[5vw] shrink-0 hidden md:block" />

                        {FEATURED_PRODUCTS.map((p) => (
                            <div key={p.id} className="snap-center shrink-0 first:pl-6 md:first:pl-0 last:pr-6 md:last:pr-0">
                                <ProductCardRefined product={p} locale={locale} />
                            </div>
                        ))}

                        <div className="w-[5vw] shrink-0 hidden md:block" />
                    </motion.div>
                </div>

                <div className="flex justify-center mt-4">
                    <Link href={`/${locale}/shop`} className="text-[#1A1A2E] text-[10px] tracking-[0.3em] uppercase border-b border-[#1A1A2E] pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-colors">
                        {locale === "ar" ? "اكتشفي المزيد" : locale === "en" ? "View all pieces" : "Voir toutes les pièces"}
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ── HOT SELLERS: Incredible Asymmetric Editorial Layout ── */
function HotSellers({ locale }: { locale: string }) {
    const { openCart } = useCartStore();

    const getName = (p: typeof HOT_SELLERS[0]) => locale === "ar" ? p.nameAr : locale === "en" ? p.nameEn : p.nameFr;

    return (
        <section className="bg-[#1A1A2E] py-32 overflow-hidden border-b border-[#C9A96E]/20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row pb-12 md:items-end justify-between border-b border-white/10 mb-16 gap-8">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}>
                        <motion.p variants={fadeUp} className="text-[#C9A96E] text-[10px] tracking-[0.4em] uppercase mb-4">
                            {locale === "ar" ? "الأكثر مبيعا" : locale === "en" ? "Trending Now" : "Tendance"}
                        </motion.p>
                        <motion.h2 variants={fadeUp} className="text-white text-4xl md:text-6xl font-black uppercase tracking-[0.15em] flex flex-wrap items-center gap-x-4">
                            {locale === "ar" ? "الأكثر" : locale === "en" ? "HOT" : "MEILLEURES"}
                            <em className="text-[#C9A96E] font-serif font-light italic normal-case tracking-normal text-5xl md:text-7xl block md:inline">
                                {locale === "ar" ? "مبيعاً" : locale === "en" ? "Sellers" : "Ventes"}
                            </em>
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                        className="pb-2"
                    >
                        <Link href={`/${locale}/shop`} className="text-white/60 text-xs tracking-widest uppercase hover:text-[#C9A96E] transition-colors flex items-center gap-3 group">
                            {locale === "ar" ? "عرض المجموعة" : locale === "en" ? "Shop All Hot Sellers" : "Voir la Sélection"}
                            <span className="w-12 h-px bg-white/30 group-hover:bg-[#C9A96E] transition-colors" />
                        </Link>
                    </motion.div>
                </div>

                {/* Breathtaking Asymmetric Grid */}
                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 h-auto lg:h-[800px]">

                    {/* Left: Huge Hero Product */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                        className="relative group bg-[#F5EDE0] w-full h-[600px] lg:h-full overflow-hidden"
                    >
                        <Link href={`/${locale}/products/${HOT_SELLERS[0].slug}`} className="absolute inset-0 z-10" />
                        <Image src={HOT_SELLERS[0].img} alt={getName(HOT_SELLERS[0])} fill className="object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />

                        {/* Overlay tags and info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/90 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute top-6 left-6 z-20">
                            <span className="bg-[#C9A96E] text-white text-[9px] tracking-[0.2em] uppercase px-4 py-2">1</span>
                        </div>
                        <div className="absolute top-6 right-6 z-20">
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] tracking-[0.2em] uppercase px-4 py-2">
                                {HOT_SELLERS[0].tag}
                            </span>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 z-20 flex justify-between items-end">
                            <div>
                                <h3 className="text-white text-3xl md:text-5xl font-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    {getName(HOT_SELLERS[0])}
                                </h3>
                                <p className="text-white/60 text-lg">{HOT_SELLERS[0].price.toLocaleString()} MAD</p>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); openCart(); }} className="w-14 h-14 rounded-full bg-white text-[#1A1A2E] flex items-center justify-center hover:bg-[#C9A96E] hover:text-white transition-colors">
                                <ShoppingBag size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                    </motion.div>

                    {/* Right: Stacked Smaller Products */}
                    <div className="grid grid-rows-2 gap-8 h-[800px] lg:h-full">
                        {HOT_SELLERS.slice(1).map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: idx * 0.2 }}
                                className="relative group bg-[#F5EDE0] w-full h-full overflow-hidden"
                            >
                                <Link href={`/${locale}/products/${product.slug}`} className="absolute inset-0 z-10" />
                                <Image src={product.img} alt={getName(product)} fill className="object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/80 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute top-5 left-5 z-20">
                                    <span className="bg-[#C9A96E] text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1.5">{idx + 2}</span>
                                </div>
                                <div className="absolute top-5 right-5 z-20">
                                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1.5">
                                        {product.tag}
                                    </span>
                                </div>

                                <div className="absolute bottom-0 inset-x-0 p-6 z-20 flex justify-between items-end">
                                    <div>
                                        <h3 className="text-white text-2xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            {getName(product)}
                                        </h3>
                                        <p className="text-white/60 text-sm">{product.price.toLocaleString()} MAD</p>
                                    </div>
                                    <button onClick={(e) => { e.preventDefault(); openCart(); }} className="w-10 h-10 rounded-full bg-white text-[#1A1A2E] flex items-center justify-center hover:bg-[#C9A96E] hover:text-white transition-colors">
                                        <ShoppingBag size={15} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function MaisonStory({ locale }: { locale: string }) {
    return (
        <section className="bg-[#FDFAF6] relative overflow-hidden py-32 md:py-48">
            {/* Massive background watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03] overflow-hidden whitespace-nowrap">
                <span className="text-[30vw] font-bold tracking-tighter text-[#1A1A2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    IMAD
                </span>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 md:gap-24 items-center">

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative aspect-[3/4] w-full max-w-md mx-auto md:mr-auto"
                >
                    <Image src="/images/hero-2.png" alt="Maison" fill className="object-cover" />
                    <div className="absolute -inset-4 border border-[#C9A96E]/40 pointer-events-none translate-y-8 translate-x-8" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="flex flex-col relative z-10"
                >
                    <p className="text-[#C9A96E] text-[10px] tracking-[0.4em] uppercase mb-8 flex items-center gap-4">
                        <span className="w-12 h-px bg-[#C9A96E]" />
                        {locale === "ar" ? "قصة الدار" : locale === "en" ? "The Maison" : "L'Atelier"}
                    </p>
                    <h2 className="text-[#1A1A2E] text-4xl md:text-6xl font-black uppercase tracking-[0.1em] leading-tight mb-8">
                        {locale === "ar" ? "فن" : locale === "en" ? "ART OF" : "L'ART DE"} <br />
                        <em className="text-[#C9A96E] font-serif font-light italic normal-case tracking-normal text-5xl md:text-7xl block mt-2">
                            {locale === "ar" ? "الأناقة" : locale === "en" ? "Elegance" : "l'Élégance"}
                        </em>
                    </h2>
                    <p className="text-[#1A1A2E]/60 text-sm md:text-base leading-relaxed mb-6 font-light">
                        {locale === "ar"
                            ? "تجسد كل قطعة من تجميعتنا التوازن المثالي بين الحشمة والرقي. تصاميمنا ليست مجرد أزياء، بل هي قصة تُروى بخيوط من الحرير ولمسات من الذهب."
                            : locale === "en"
                                ? "Every piece in our collection embodies the perfect balance between modesty and sophistication. Our designs are not just fashion, but a story told in silk threads and touches of gold."
                                : "Chaque création incarne l'équilibre parfait entre pudeur et sophistication. Nos designs ne sont pas que de simples vêtements, ils sont une histoire tissée de soie et brodée d'or."}
                    </p>
                    <p className="text-[#1A1A2E]/60 text-sm md:text-base leading-relaxed mb-12 font-light">
                        {locale === "ar"
                            ? "صُنعت في ورشنا بأيدي خبراء، كل تفصيلة تحتفي بالمرأة العصرية."
                            : locale === "en"
                                ? "Crafted in our ateliers by expert hands, every detail celebrates the modern woman."
                                : "Façonné dans nos ateliers par des mains expertes, chaque détail célèbre la femme moderne."}
                    </p>

                    {/* Changed Play Film to Contact Us */}
                    <Link href={`/${locale}/contact`} className="flex items-center gap-4 group self-start">
                        <span className="w-14 h-14 rounded-full border border-[#1A1A2E]/20 flex items-center justify-center group-hover:border-[#C9A96E] transition-colors">
                            <Mail size={16} className="text-[#1A1A2E] group-hover:text-[#C9A96E] transition-colors" />
                        </span>
                        <span className="text-[#1A1A2E] font-medium text-[10px] tracking-[0.3em] uppercase group-hover:text-[#C9A96E] transition-colors">
                            {locale === "ar" ? "تواصل معنا" : locale === "en" ? "Contact Us" : "Contactez-nous"}
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function WhatsAppCTA() {
    const phone = "212660560522";
    return (
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-8 end-8 z-50 flex items-center justify-center group gap-3">
            <div className="bg-white/90 backdrop-blur border border-[#C9A96E] px-5 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block">
                <span className="text-[#1A1A2E] text-[15px] tracking-widest font-bold uppercase whitespace-nowrap">
                    تواصل معنا
                </span>
            </div>
            <div className="relative">
                <span className="absolute inline-flex w-24 h-24 rounded-full bg-[#C9A96E]/30 animate-ping-gold left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <span className="relative w-20 h-20 rounded-full bg-[#1A1A2E] border-2 border-[#C9A96E] flex items-center justify-center shadow-2xl group-hover:bg-[#C9A96E] group-hover:border-white transition-all duration-300">
                    <MessageCircle size={36} className="text-[#C9A96E] group-hover:text-white transition-colors" />
                </span>
            </div>
        </a>
    );
}

/* ── TESTIMONIALS: Famous Brand Style ── */
const TESTIMONIALS = [
    { id: 1, img: "/images/hero-1.png", quoteFr: "La définition absolue du luxe modeste. Les finitions sont d'une perfection déroutante.", quoteAr: "التعريف المطلق للرفاهية المحتشمة. التشطيبات مثالية بشكل مذهل.", quoteEn: "The absolute definition of modest luxury. The finishes are startlingly perfect.", author: "Noor Al-S.", role: "London", tag: "Édition Soie" },
    { id: 2, img: "/images/hero-2.png", quoteFr: "Porter ces pièces, c'est se sentir comme la royauté. Un drapé majestueux et fluide.", quoteAr: "ارتداء هذه القطع يجعلك تشعرين كالملوك. ثنيات مهيبة وانسيابية.", quoteEn: "Wearing these pieces makes you feel like royalty. A majestic drape.", author: "Sophia M.", role: "Paris", tag: "Collection Privée" },
    { id: 3, img: "/images/cat-abayas.png", quoteFr: "L'élégance à l'état pur. L'attention aux détails est digne des plus grandes maisons de couture.", quoteAr: "الأناقة في أنقى صورها. الاهتمام بالتفاصيل يضاهي أكبر دور الأزياء.", quoteEn: "Pure elegance. The attention to detail is worthy of the greatest couture houses.", author: "Leïla K.", role: "Dubai", tag: "Haute Couture" },
];

function Testimonials({ locale }: { locale: string }) {
    const [active, setActive] = useState(0);

    const getQuote = (t: typeof TESTIMONIALS[0]) => {
        if (locale === "ar") return t.quoteAr;
        if (locale === "en") return t.quoteEn;
        return t.quoteFr;
    };

    return (
        <section className="bg-[#1A1A2E] py-32 md:py-48 font-light overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 relative">
                {/* Header */}
                <div className="flex flex-col items-center mb-16 md:mb-32">
                    <p className="flex items-center gap-4 text-[#C9A96E] text-[10px] tracking-[0.4em] uppercase mb-4">
                        <span className="w-12 h-px bg-[#C9A96E]/50" />
                        {locale === "ar" ? "آراء" : locale === "en" ? "Testimonials" : "Témoignages"}
                        <span className="w-12 h-px bg-[#C9A96E]/50" />
                    </p>
                    <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-widest flex flex-wrap justify-center items-center gap-x-4">
                        {locale === "ar" ? "صوت" : locale === "en" ? "CLIENT" : "VOS"}
                        <em className="text-[#C9A96E] font-serif font-light italic normal-case tracking-normal text-5xl md:text-7xl">
                            {locale === "ar" ? "عملائنا" : locale === "en" ? "Voices" : "Mots Précieux"}
                        </em>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 items-center gap-16 md:gap-24 relative z-10">
                    {/* Text Content */}
                    <div className="order-2 md:order-1 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="relative"
                            >
                                <div className="text-[#C9A96E] opacity-10 text-[250px] leading-[0] absolute -top-10 -left-8 md:-left-16 font-serif select-none pointer-events-none">
                                    &quot;
                                </div>
                                <h3 className="text-white text-3xl md:text-5xl lg:text-6xl leading-[1.3] mb-12 relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    {getQuote(TESTIMONIALS[active])}
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-white text-[12px] tracking-[0.25em] uppercase font-bold mb-2">{TESTIMONIALS[active].author}</span>
                                        <span className="text-[#8B8399] text-[10px] tracking-[0.2em] uppercase">{TESTIMONIALS[active].role}</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/20 mx-4" />
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={14} fill="#C9A96E" className="text-[#C9A96E]" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Controls (Ball of Pictures) */}
                        <div className="flex items-center gap-4 mt-20">
                            {TESTIMONIALS.map((t, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setActive(i)}
                                    animate={{
                                        y: [0, i % 2 === 0 ? -8 : 10, 0, i % 2 === 0 ? 6 : -8, 0],
                                        x: [0, i % 3 === 0 ? 6 : -6, 0, i % 3 === 0 ? -5 : 8, 0]
                                    }}
                                    transition={{
                                        duration: 6 + (i * 1.5),
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden transition-all duration-500 shadow-xl border border-white/10 ${i === active ? "scale-[1.25] ring-2 ring-[#C9A96E] ring-offset-2 ring-offset-[#1A1A2E] opacity-100 z-10" : "opacity-40 hover:opacity-80 hover:scale-110 grayscale"}`}
                                >
                                    <Image src={t.img} alt={t.author} fill className="object-cover" />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Image Content */}
                    <div className="order-1 md:order-2 flex justify-end relative h-[500px] md:h-[700px] lg:h-[800px]">
                        <div className="w-full md:w-[85%] h-full relative overflow-hidden bg-[#F5EDE0]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active}
                                    initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                    className="absolute inset-0"
                                >
                                    <Image src={TESTIMONIALS[active].img} alt="Client" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-[#1A1A2E]/10" />

                                    {/* Floating Tag */}
                                    <div className="absolute bottom-10 left-10 lg:-left-6 bg-[#1A1A2E]/80 backdrop-blur-md px-8 py-5 border border-white/10 shadow-2xl">
                                        <span className="text-white text-[10px] tracking-[0.3em] uppercase whitespace-nowrap">
                                            {TESTIMONIALS[active].tag}
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Decorative offset frame */}
                        <div className="absolute bottom-24 -left-8 md:-left-16 w-32 h-32 md:w-64 md:h-64 border border-[#C9A96E]/30 z-20 pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function LuxuryHomePage({ params }: { params: { locale: string } }) {
    const { locale } = params;
    return (
        <div className="bg-[#FDFAF6] min-h-screen">
            <HeroSection locale={locale} />
            <MarqueeBar locale={locale} />
            <CollectionGallery locale={locale} />
            <HotSellers locale={locale} />
            <FeaturedCarousel locale={locale} />
            <Testimonials locale={locale} />
            <MaisonStory locale={locale} />
            <WhatsAppCTA />
        </div>
    );
}
