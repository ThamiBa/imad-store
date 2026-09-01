"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, RotateCcw, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

/* ─── Mock data ───────────────────────────────────────────────── */
const MOCK_PRODUCT = {
    id: "prod_1",
    slug: "abaya-soie-ivoire",
    nameFr: "Abaya Soie Ivoire — Édition Limitée",
    nameAr: "عباءة حرير عاجي — إصدار محدود",
    nameEn: "Ivory Silk Abaya — Limited Edition",
    price: 890,
    compareAt: 1200,
    sku: "IS-AB-01-IVR",
    category: "Abayas",
    descFr: "Tissée à la main dans nos ateliers de Marrakech, cette abaya en soie pure incarne l'élégance modeste à son apogée. Ses broderies dorées appliquées à la main capturent la lumière avec grâce, tandis que le tombé fluide épouse chaque silhouette.",
    descAr: "منسوجة يدويًا في ورشاتنا بمراكش، تجسد هذه العباءة الحريرية قمة الأناقة المحتشمة. تلتقط تطريزاتها الذهبية المطبقة يدويًا الضوءَ برشاقة، بينما يتدلى القماش الانسيابي ليلائم كل جسد.",
    descEn: "Hand-woven in our Marrakech atelier, this pure silk abaya embodies modest elegance at its peak. Its hand-applied golden embroideries capture light with grace, while the fluid drape flatters every silhouette.",
    images: ["/images/hero-1.png", "/images/cat-abayas.png", "/images/hero-2.png"],
    colors: [
        { hex: "#F5EDE0", labelFr: "Ivoire", labelAr: "عاجي", labelEn: "Ivory" },
        { hex: "#1A1A2E", labelFr: "Nuit", labelAr: "أزرق ليلي", labelEn: "Midnight" },
        { hex: "#C9A96E", labelFr: "Or", labelAr: "ذهبي", labelEn: "Gold" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    variants: [
        { id: "v1", color: "#F5EDE0", size: "XS", instock: true },
        { id: "v2", color: "#F5EDE0", size: "S", instock: true },
        { id: "v3", color: "#F5EDE0", size: "M", instock: true },
        { id: "v4", color: "#F5EDE0", size: "L", instock: false },
        { id: "v5", color: "#1A1A2E", size: "S", instock: true },
        { id: "v6", color: "#1A1A2E", size: "M", instock: true },
        { id: "v7", color: "#C9A96E", size: "S", instock: true },
    ],
};

export default function ProductDetailPage({ params }: { params: { locale: string; slug: string } }) {
    const { locale } = params;
    const product = MOCK_PRODUCT;

    const [imgIdx, setImgIdx] = useState(0);
    const [activeColor, setActiveColor] = useState(product.colors[0].hex);
    const [activeSize, setActiveSize] = useState<string | null>(null);
    const [qty, setQty] = useState(1);
    const [wished, setWished] = useState(false);
    const [addedAnim, setAddedAnim] = useState(false);
    const { addItem, openCart } = useCartStore();

    const name = locale === "ar" ? product.nameAr : locale === "en" ? product.nameEn : product.nameFr;
    const desc = locale === "ar" ? product.descAr : locale === "en" ? product.descEn : product.descFr;
    const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : null;

    const sizesForColor = product.variants
        .filter(v => v.color === activeColor)
        .map(v => ({ size: v.size, instock: v.instock }));

    const handleAddToCart = () => {
        if (!activeSize) return;
        const variant = product.variants.find(v => v.color === activeColor && v.size === activeSize);
        if (!variant) return;
        const colorInfo = product.colors.find(c => c.hex === activeColor)!;
        addItem({
            id: product.id, slug: product.slug,
            nameFr: product.nameFr, nameAr: product.nameAr, nameEn: product.nameEn,
            price: product.price, images: product.images,
            descriptionFr: "", descriptionAr: "", descriptionEn: "", status: "active",
            category: { id: "", slug: "", nameFr: "", nameAr: "", nameEn: "" },
            variants: [],
        }, {
            id: variant.id,
            color: activeColor,
            colorNameFr: colorInfo.labelFr, colorNameAr: colorInfo.labelAr, colorNameEn: colorInfo.labelEn,
            size: variant.size,
            stock: 10, sku: product.sku,
        }, qty);
        setAddedAnim(true);
        setTimeout(() => setAddedAnim(false), 1800);
        openCart();
    };

    /* ── labels ── */
    const L = {
        breadHome: locale === "ar" ? "الرئيسية" : "Accueil",
        breadCat: locale === "ar" ? "عبايات" : "Abayas",
        color: locale === "ar" ? "اللون" : locale === "en" ? "Color" : "Couleur",
        size: locale === "ar" ? "المقاس" : locale === "en" ? "Size" : "Taille",
        guide: locale === "ar" ? "دليل المقاسات" : locale === "en" ? "Size guide" : "Guide tailles",
        addCart: locale === "ar" ? "أضف إلى السلة" : locale === "en" ? "Add to Bag" : "Ajouter au Panier",
        added: locale === "ar" ? "تمت الإضافة ✓" : locale === "en" ? "Added ✓" : "Ajouté ✓",
        noSize: locale === "ar" ? "اختر مقاساً أولاً" : locale === "en" ? "Choose a size" : "Choisissez une taille",
        ref: locale === "ar" ? "المرجع" : locale === "en" ? "Ref" : "Réf.",
        returns: locale === "ar" ? "إرجاع مجاني خلال 14 يوم" : locale === "en" ? "Free returns within 14 days" : "Retours gratuits sous 14 jours",
        delivery: locale === "ar" ? "توصيل مجاني في المغرب" : locale === "en" ? "Free delivery in Morocco" : "Livraison offerte au Maroc",
        secure: locale === "ar" ? "دفع آمن ومضمون" : locale === "en" ? "Secure payment" : "Paiement sécurisé",
    };

    return (
        <div className="min-h-screen bg-[#FDFAF6]">

            {/* ── Breadcrumb ── */}
            <div className="pt-32 pb-0 max-w-[1600px] mx-auto px-10">
                <nav className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#8B8399] font-medium">
                    <Link href={`/${locale}`} className="hover:text-[#C9A96E] transition-colors">{L.breadHome}</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/${locale}/shop?category=abayas`} className="hover:text-[#C9A96E] transition-colors">{L.breadCat}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#C9A96E] truncate max-w-[200px]">{name}</span>
                </nav>
            </div>

            {/* ════════════ MAIN TWO-COLUMN LAYOUT ════════════ */}
            <div className="max-w-[1600px] mx-auto px-8 md:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[1.3fr_480px] gap-16 lg:gap-24 items-start">

                {/* ── LEFT: Image stack ── */}
                <div className="relative">

                    {/* Main image */}
                    <div className="relative aspect-[4/5] bg-[#F5EDE0] overflow-hidden w-full">
                        <AnimatePresence mode="wait">
                            <motion.div key={imgIdx} className="absolute inset-0"
                                initial={{ opacity: 0, scale: 1.04 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}>
                                <Image src={product.images[imgIdx]} alt={name} fill className="object-cover" priority />
                            </motion.div>
                        </AnimatePresence>

                        {/* Badges */}
                        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10 pointer-events-none">
                            {discount && (
                                <span className="bg-[#1A1A2E] text-[#C9A96E] text-[8px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
                                    -{discount}%
                                </span>
                            )}
                            <span className="bg-[#C9A96E] text-white text-[8px] tracking-[0.2em] uppercase px-3 py-1.5">
                                {locale === "ar" ? "إصدار محدود" : "Édition limitée"}
                            </span>
                        </div>

                        {/* Prev / Next arrows */}
                        {product.images.length > 1 && (
                            <>
                                <button onClick={() => setImgIdx(i => (i - 1 + product.images.length) % product.images.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur flex items-center justify-center hover:bg-[#C9A96E] hover:text-white transition-all group">
                                    <ChevronLeft size={18} strokeWidth={1.5} />
                                </button>
                                <button onClick={() => setImgIdx(i => (i + 1) % product.images.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur flex items-center justify-center hover:bg-[#C9A96E] hover:text-white transition-all">
                                    <ChevronRight size={18} strokeWidth={1.5} />
                                </button>
                            </>
                        )}

                        {/* Wishlist */}
                        <button onClick={() => setWished(!wished)}
                            className={`absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center transition-all duration-300 ${wished ? "bg-[#C9A96E]" : "bg-white/85 backdrop-blur hover:bg-[#C9A96E]"}`}>
                            <Heart size={15} strokeWidth={wished ? 0 : 1.5} fill={wished ? "white" : "none"} className="text-white" />
                        </button>

                        {/* Dot indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {product.images.map((_, i) => (
                                <button key={i} onClick={() => setImgIdx(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-[#C9A96E] w-5" : "bg-white/60"}`} />
                            ))}
                        </div>
                    </div>

                    {/* Thumbnails strip */}
                    <div className="flex gap-3 mt-4">
                        {product.images.map((src, i) => (
                            <button key={i} onClick={() => setImgIdx(i)}
                                className={`relative w-20 h-24 bg-[#F5EDE0] overflow-hidden shrink-0 border-2 transition-all ${i === imgIdx ? "border-[#C9A96E]" : "border-transparent hover:border-[#C9A96E]/40"}`}>
                                <Image src={src} alt={`view ${i + 1}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: Info panel — sticky ── */}
                <div className="lg:sticky lg:top-32 flex flex-col gap-6">

                    {/* Category + stars */}
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] font-medium">{product.category}</p>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={11} className="text-[#C9A96E]" fill="#C9A96E" />
                            ))}
                            <span className="text-[10px] text-[#8B8399] ml-1">(48)</span>
                        </div>
                    </div>

                    {/* Name */}
                    <h1 className="text-[#1A1A2E] text-3xl md:text-4xl font-light leading-snug"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {name}
                    </h1>

                    {/* Price */}
                    <div className="flex items-end gap-4">
                        <span className="text-3xl font-light text-[#1A1A2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {product.price.toLocaleString()} MAD
                        </span>
                        {product.compareAt && (
                            <span className="text-base text-[#8B8399] line-through pb-0.5">
                                {product.compareAt.toLocaleString()} MAD
                            </span>
                        )}
                    </div>

                    <hr className="border-[#C9A96E]/15" />

                    {/* Color selector */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] tracking-[0.25em] uppercase text-[#1A1A2E]/60 font-medium">{L.color}</p>
                            <span className="text-xs text-[#C9A96E]">
                                {product.colors.find(c => c.hex === activeColor)?.[`label${locale === "ar" ? "Ar" : locale === "en" ? "En" : "Fr"}` as "labelFr"]}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {product.colors.map((c) => (
                                <button key={c.hex} onClick={() => { setActiveColor(c.hex); setActiveSize(null); }}
                                    className="w-8 h-8 rounded-full border-2 transition-all duration-200"
                                    style={{
                                        background: c.hex,
                                        borderColor: c.hex === activeColor ? "#C9A96E" : "rgba(201,169,110,0.2)",
                                        boxShadow: c.hex === activeColor ? "0 0 0 3px white, 0 0 0 5px #C9A96E" : "none",
                                        transform: c.hex === activeColor ? "scale(1.15)" : "scale(1)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size selector */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] tracking-[0.25em] uppercase text-[#1A1A2E]/60 font-medium">{L.size}</p>
                            <button className="text-[9px] tracking-widest uppercase text-[#C9A96E] underline underline-offset-2 hover:opacity-70 transition-opacity">
                                {L.guide}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sizesForColor.map(({ size, instock }) => (
                                <button
                                    key={size}
                                    disabled={!instock}
                                    onClick={() => setActiveSize(size)}
                                    className={`w-14 h-11 text-xs tracking-widest border transition-all duration-200 ${!instock ? "border-[#C9A96E]/10 text-[#1A1A2E]/20 cursor-not-allowed line-through" :
                                        activeSize === size ? "bg-[#1A1A2E] border-[#1A1A2E] text-[#C9A96E]" :
                                            "border-[#C9A96E]/30 text-[#1A1A2E]/70 hover:border-[#C9A96E] hover:text-[#1A1A2E]"
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Qty + Add */}
                    <div className="flex gap-3">
                        <div className="flex items-center border border-[#C9A96E]/30 divide-x divide-[#C9A96E]/25 shrink-0">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3.5 text-[#1A1A2E]/60 hover:text-[#C9A96E] transition-colors"><Minus size={13} /></button>
                            <span className="px-5 py-3.5 text-sm font-medium text-[#1A1A2E]">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="px-4 py-3.5 text-[#1A1A2E]/60 hover:text-[#C9A96E] transition-colors"><Plus size={13} /></button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={!activeSize}
                            className={`flex-1 flex items-center justify-center gap-3 text-[10px] tracking-[0.25em] uppercase font-medium transition-all duration-500 py-3.5 ${!activeSize ? "bg-[#1A1A2E]/20 text-white cursor-not-allowed" :
                                addedAnim ? "bg-[#C9A96E] text-white" :
                                    "bg-[#1A1A2E] text-white hover:bg-[#C9A96E]"
                                }`}
                        >
                            <ShoppingBag size={15} strokeWidth={1.5} />
                            {!activeSize ? L.noSize : addedAnim ? L.added : L.addCart}
                        </button>
                    </div>

                    <p className="text-[9px] tracking-widest text-[#8B8399] text-center">
                        {L.ref}: <span className="text-[#1A1A2E]">{product.sku}</span>
                    </p>

                    <hr className="border-[#C9A96E]/15" />

                    {/* Description */}
                    <p className="text-[#1A1A2E]/70 text-sm leading-relaxed">{desc}</p>

                    {/* Perks */}
                    <div className="flex flex-col gap-3 bg-white border border-[#C9A96E]/15 px-6 py-5">
                        {[
                            { icon: <Truck size={15} strokeWidth={1.5} />, text: L.delivery },
                            { icon: <RotateCcw size={15} strokeWidth={1.5} />, text: L.returns },
                            { icon: <ShieldCheck size={15} strokeWidth={1.5} />, text: L.secure },
                        ].map((p, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs text-[#1A1A2E]/70">
                                <span className="text-[#C9A96E] shrink-0">{p.icon}</span>
                                {p.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
