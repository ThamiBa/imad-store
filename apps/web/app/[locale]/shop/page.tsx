"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

/* ── Mock data ─────────────────────────────────────────────── */
const ALL_PRODUCTS = [
    { id: 1, slug: "abaya-soie-ivoire", nameFr: "Abaya Royale", nameAr: "عباية ملكية", nameEn: "Royal Abaya", price: 890, compareAt: 1200, category: "abayas", img1: "/images/hero-1.png", img2: "/images/cat-abayas.png", colors: [{ hex: "#F5EDE0", label: "كريم" }, { hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: 2, slug: "abaya-brodee-or", nameFr: "Abaya Brodée Or", nameAr: "عباية مطرزة ذهب", nameEn: "Gold Embroidered Abaya", price: 1290, compareAt: 1600, category: "abayas", img1: "/images/cat-abayas.png", img2: "/images/hero-2.png", colors: [{ hex: "#C9A96E", label: "ذهبي" }, { hex: "#F5EDE0", label: "كريم" }] },
    { id: 3, slug: "shailan-premium", nameFr: "Shailan Premium", nameAr: "شيلان فاخر", nameEn: "Premium Shailan", price: 650, compareAt: 850, category: "shailan", img1: "/images/hero-2.png", img2: "/images/hero-1.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: 4, slug: "shailan-soie", nameFr: "Shailan Soie", nameAr: "شيلان حرير", nameEn: "Silk Shailan", price: 490, compareAt: null, category: "shailan", img1: "/images/cat-abayas.png", img2: "/images/hero-2.png", colors: [{ hex: "#F5EDE0", label: "كريم" }, { hex: "#FFFFFF", label: "أبيض" }] },
    { id: 5, slug: "saikan-classique", nameFr: "Saïkan Classique", nameAr: "صيكان كلاسيك", nameEn: "Classic Saikan", price: 750, compareAt: 950, category: "saikan", img1: "/images/hero-1.png", img2: "/images/cat-abayas.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: 6, slug: "saikan-dore", nameFr: "Saïkan Doré", nameAr: "صيكان ذهبي", nameEn: "Gold Saikan", price: 920, compareAt: null, category: "saikan", img1: "/images/hero-2.png", img2: "/images/hero-1.png", colors: [{ hex: "#C9A96E", label: "ذهبي" }, { hex: "#F5EDE0", label: "كريم" }] },
    { id: 7, slug: "chaussures-femme-sport", nameFr: "Chaussures Femme Sport", nameAr: "أحذية رياضية", nameEn: "Sports Women Shoes", price: 420, compareAt: 600, category: "shoes-women", img1: "/images/cat-shoes.png", img2: "/images/hero-1.png", colors: [{ hex: "#FFFFFF", label: "أبيض" }, { hex: "#1A1A2E", label: "كحلي" }] },
    { id: 8, slug: "chaussures-femme-classic", nameFr: "Chaussures Femme Classiques", nameAr: "أحذية كلاسيكية", nameEn: "Classic Women Shoes", price: 560, compareAt: 780, category: "shoes-women", img1: "/images/cat-shoes.png", img2: "/images/hero-2.png", colors: [{ hex: "#C9A96E", label: "ذهبي" }, { hex: "#F5EDE0", label: "كريم" }] },
    { id: 9, slug: "pyjama-luxe", nameFr: "Pyjama Luxe", nameAr: "بيجامة فاخرة", nameEn: "Luxury Pyjama", price: 380, compareAt: 520, category: "pyjamas", img1: "/images/hero-1.png", img2: "/images/cat-abayas.png", colors: [{ hex: "#F5EDE0", label: "كريم" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: 10, slug: "pyjama-satin", nameFr: "Pyjama Satin", nameAr: "بيجامة ساتان", nameEn: "Satin Pyjama", price: 450, compareAt: null, category: "pyjamas", img1: "/images/hero-2.png", img2: "/images/hero-1.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: 11, slug: "sabo-cuir", nameFr: "Sabo Cuir Homme", nameAr: "صابو جلد رجالي", nameEn: "Men Leather Sabo", price: 350, compareAt: 490, category: "shoes-men", img1: "/images/cat-shoes.png", img2: "/images/hero-2.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: 12, slug: "sabo-velours", nameFr: "Sabo Velours Homme", nameAr: "صابو مخمل رجالي", nameEn: "Men Velvet Sabo", price: 290, compareAt: null, category: "shoes-men", img1: "/images/cat-shoes.png", img2: "/images/hero-1.png", colors: [{ hex: "#C9A96E", label: "ذهبي" }, { hex: "#F5EDE0", label: "كريم" }] },
];

const CATEGORIES = [
    { slug: "all", labelAr: "الكل" },
    { slug: "saikan", labelAr: "صيكان" },
    { slug: "abayas", labelAr: "العبايات" },
    { slug: "shailan", labelAr: "شيلان" },
    { slug: "shoes-women", labelAr: "أحذية نسائية" },
    { slug: "pyjamas", labelAr: "بيجامات" },
    { slug: "shoes-men", labelAr: "صابو رجالي" },
];

/* ── Luxury Product Card ────────────────────────────────────── */
function LuxCard({ p, locale, i }: { p: typeof ALL_PRODUCTS[0]; locale: string; i: number }) {
    const [hovered, setHovered] = useState(false);
    const [wished, setWished] = useState(false);
    const [activeCol, setActiveCol] = useState(0);
    const [added, setAdded] = useState(false);

    const name = locale === "ar" ? p.nameAr : locale === "en" ? p.nameEn : p.nameFr;
    const discount = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : null;

    // Arabic category label
    const catLabel = CATEGORIES.find(c => c.slug === p.category)?.labelAr ?? p.category;

    // Add to cart handler
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const { addItem } = useCartStore.getState();
        // Build minimal Product + Variant matching the store interface
        const mockProduct = {
            id: String(p.id),
            slug: p.slug,
            nameFr: p.nameFr,
            nameAr: p.nameAr,
            nameEn: p.nameEn,
            price: p.price,
            images: [p.img1, p.img2],
            category: p.category,
        } as unknown as Parameters<typeof addItem>[0];
        const mockVariant = {
            id: `${p.slug}-default`,
            colorNameFr: "Défaut",
            colorNameAr: "افتراضي",
            colorNameEn: "Default",
            size: "TU",
            stock: 99,
        } as Parameters<typeof addItem>[1];
        addItem(mockProduct, mockVariant, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group"
        >
            <Link href={`/${locale}/products/${p.slug}`} className="block">
                {/* Image area */}
                <div
                    className="relative aspect-[3/4] bg-[#F5EDE0] overflow-hidden mb-0"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    {/* Primary image */}
                    <Image
                        src={p.img1}
                        alt={name}
                        fill
                        className={`object-cover transition-all duration-700 ${hovered ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
                    />
                    {/* Hover image */}
                    <Image
                        src={p.img2}
                        alt={`${name} view 2`}
                        fill
                        className={`object-cover transition-all duration-700 absolute inset-0 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                    />

                    {/* Dark vignette on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/50 via-transparent to-transparent transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`} />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                        {discount && (
                            <span className="bg-[#1A1A2E] text-[#C9A96E] text-[8px] tracking-[0.22em] uppercase px-3 py-1.5 font-medium">
                                -{discount}%
                            </span>
                        )}
                        {i < 2 && (
                            <span className="bg-[#C9A96E] text-white text-[8px] tracking-[0.22em] uppercase px-3 py-1.5">
                                {locale === "ar" ? "جديد" : "Nouveau"}
                            </span>
                        )}
                    </div>

                    {/* Wishlist */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }}
                        className={`absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center transition-all duration-300 ${hovered ? "opacity-100" : "opacity-0"} ${wished ? "bg-[#C9A96E]" : "bg-white/90 backdrop-blur"}`}
                    >
                        <Heart
                            size={14}
                            strokeWidth={wished ? 0 : 1.5}
                            fill={wished ? "white" : "none"}
                            className={wished ? "text-white" : "text-[#1A1A2E]"}
                        />
                    </button>

                    {/* Slide-up Quick Add */}
                    <button
                        onClick={handleAddToCart}
                        className={`absolute bottom-0 inset-x-0 z-10 text-white text-[12px] tracking-[0.2em] uppercase py-4 flex items-center justify-center gap-2 transition-all duration-500 ease-out ${hovered ? "translate-y-0" : "translate-y-full"} ${added ? "bg-[#C9A96E]" : "bg-[#1A1A2E] hover:bg-[#C9A96E]"}`}
                    >
                        <ShoppingBag size={16} strokeWidth={1.5} />
                        {added ? (locale === "ar" ? "✓ تمت الإضافة" : "✓ Ajouté") : (locale === "ar" ? "إضافة للسلة" : "Ajout Rapide")}
                    </button>
                </div>

                {/* Info */}
                <div className="pt-5 pb-4 px-0.5">
                    {/* Category — Arabic label */}
                    <p className="text-[11px] tracking-[0.2em] uppercase text-[#C9A96E] font-medium mb-3" dir="rtl">
                        {catLabel}
                    </p>

                    {/* Name */}
                    <h3
                        className="text-[#1A1A2E] text-xl leading-tight group-hover:text-[#C9A96E] transition-colors duration-300 mb-4"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
                        dir="rtl"
                    >
                        {name}
                    </h3>

                    {/* Color swatches row */}
                    <div className="flex items-center gap-1.5 mb-4">
                        {p.colors.map((c, ci) => (
                            <button
                                key={ci}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveCol(ci); }}
                                title={c.label}
                                className="w-3.5 h-3.5 rounded-full border transition-all duration-200"
                                style={{
                                    background: c.hex,
                                    borderColor: ci === activeCol ? "#C9A96E" : "rgba(201,169,110,0.3)",
                                    transform: ci === activeCol ? "scale(1.3)" : "scale(1)",
                                    boxShadow: ci === activeCol ? "0 0 0 2px white, 0 0 0 3px #C9A96E" : "none",
                                }}
                            />
                        ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3">
                        <span className="text-[#1A1A2E] text-base font-semibold tracking-wide">
                            {p.price.toLocaleString()} MAD
                        </span>
                        {p.compareAt && (
                            <span className="text-[#8B8399] text-sm line-through">
                                {p.compareAt.toLocaleString()} MAD
                            </span>
                        )}
                    </div>
                </div>

                {/* Gold separator */}
                <div className="h-px bg-[#C9A96E]/15 group-hover:bg-[#C9A96E]/50 transition-colors duration-500" />
            </Link>
        </motion.div>
    );
}

/* ── Page ───────────────────────────────────────────────────── */
function ShopContent({ locale }: { locale: string }) {
    const searchParams = useSearchParams();
    const urlCat = searchParams.get("category");

    // Map URL slug to display category name
    const slugToCategory: Record<string, string> = {
        saikan: "saikan",
        abayas: "abayas",
        shailan: "shailan",
        "shoes-women": "shoes-women",
        pyjamas: "pyjamas",
        "shoes-men": "shoes-men",
    };
    const initialCat = urlCat ? (slugToCategory[urlCat.toLowerCase()] ?? "all") : "all";

    const [activeCategory, setActiveCategory] = useState(initialCat);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const cat = searchParams.get("category");
        setActiveCategory(cat ? (slugToCategory[cat.toLowerCase()] ?? "all") : "all");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const filtered = activeCategory === "all"
        ? ALL_PRODUCTS
        : ALL_PRODUCTS.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-[#FDFAF6]">

            {/* ── Editorial hero banner ── */}
            <div className="relative w-full h-[340px] md:h-[420px] bg-[#1A1A2E] overflow-hidden flex items-end">
                <Image src="/images/hero-2.png" alt="Collection" fill className="object-cover opacity-30" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
                    <nav className="flex items-center gap-2 text-[9px] tracking-widest uppercase text-white/40 mb-5">
                        <Link href={`/${locale}`} className="hover:text-[#C9A96E] transition-colors">
                            {locale === "ar" ? "الرئيسية" : "Accueil"}
                        </Link>
                        <span>/</span>
                        <span className="text-[#C9A96E]">{locale === "ar" ? "المتجر" : "Boutique"}</span>
                    </nav>
                    <h1
                        className="text-white text-5xl md:text-7xl font-light leading-none"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        {locale === "ar" ? "المجموعة الكاملة" : "La Collection"}
                    </h1>
                    <p className="text-white/50 text-sm tracking-widest mt-3">
                        {locale === "ar" ? `${ALL_PRODUCTS.length} قطعة حصرية` : `${ALL_PRODUCTS.length} pièces exclusives`}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* ── Category filters + controls ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">

                    {/* Category pills */}
                    <div className="flex items-center gap-2 flex-wrap" dir="rtl">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => setActiveCategory(cat.slug)}
                                className={`text-[12px] tracking-[0.12em] px-6 py-3 border transition-all duration-300 ${activeCategory === cat.slug
                                    ? "bg-[#1A1A2E] text-[#C9A96E] border-[#1A1A2E]"
                                    : "bg-transparent text-[#1A1A2E]/60 border-[#C9A96E]/25 hover:border-[#C9A96E] hover:text-[#1A1A2E]"
                                    }`}
                            >
                                {cat.labelAr}
                            </button>
                        ))}
                    </div>

                    {/* Sort + filter controls */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#1A1A2E] border border-[#C9A96E]/30 px-6 py-3 hover:bg-[#C9A96E] hover:text-white hover:border-[#C9A96E] transition-all"
                        >
                            <SlidersHorizontal size={15} />
                            {locale === "ar" ? "تصفية" : "Filtres"}
                        </button>
                        <button className="flex items-center gap-6 text-[11px] tracking-widest uppercase text-[#1A1A2E]/70 border border-[#C9A96E]/20 px-6 py-3 min-w-[180px] justify-between">
                            {locale === "ar" ? "الأحدث أولاً" : "Nouveautés"}
                            <ChevronDown size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Product grid ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-14" dir="rtl"
                    >
                        {filtered.map((p, i) => (
                            <LuxCard key={p.id} p={p} locale={locale} i={i} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center py-24 gap-6 text-center">
                        <ShoppingBag size={64} strokeWidth={0.8} className="text-[#C9A96E]/30" />
                        <p className="text-[#8B8399] tracking-widest text-sm uppercase">
                            {locale === "ar" ? "لا توجد منتجات" : "Aucun produit"}
                        </p>
                    </div>
                )}

                {/* ── Pagination ── */}
                <div className="mt-24 flex items-center justify-center gap-2">
                    {[1, 2, 3].map((n) => (
                        <button
                            key={n}
                            className={`w-10 h-10 text-sm border transition-all duration-200 ${n === 1 ? "bg-[#1A1A2E] border-[#1A1A2E] text-[#C9A96E]" : "border-[#C9A96E]/25 text-[#1A1A2E]/60 hover:border-[#C9A96E] hover:text-[#1A1A2E]"}`}
                        >
                            {n}
                        </button>
                    ))}
                    <span className="px-2 text-[#8B8399] text-sm">…</span>
                    <button className="w-10 h-10 text-sm border border-[#C9A96E]/25 text-[#1A1A2E]/60 hover:border-[#C9A96E] transition-all">8</button>
                </div>
            </div>
        </div>
    );
}

export default function ShopPage({ params }: { params: { locale: string } }) {
    return (
        <Suspense fallback={
            <div className="min-h-[85vh] flex items-center justify-center bg-[#FDFAF6]">
                <p className="text-xs tracking-[0.2em] text-[#C9A96E] uppercase animate-pulse">
                    Loading…
                </p>
            </div>
        }>
            <ShopContent locale={params.locale} />
        </Suspense>
    );
}
