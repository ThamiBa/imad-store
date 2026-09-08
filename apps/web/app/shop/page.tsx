"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, Heart, Search } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { ProductVariant } from "@/lib/api";

/* ── Product interface ─────────────────────────────────────── */
interface ShopProduct {
    id: string;
    slug: string;
    nameFr: string;
    nameAr: string;
    nameEn: string;
    price: number;
    compareAt: number | null;
    category: string;
    img1: string;
    img2: string;
    colors: { hex: string; label: string }[];
}

/* ── Mock data ─────────────────────────────────────────────── */
const ALL_PRODUCTS: ShopProduct[] = [
    { id: "1", slug: "abaya-soie-ivoire", nameFr: "Abaya Royale", nameAr: "عباية ملكية", nameEn: "Royal Abaya", price: 890, compareAt: 1200, category: "abayas", img1: "/images/hero-1.png", img2: "/images/cat-abayas.png", colors: [{ hex: "#F5EDE0", label: "كريم" }, { hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: "2", slug: "abaya-brodee-or", nameFr: "Abaya Brodée Or", nameAr: "عباية مطرزة ذهب", nameEn: "Gold Embroidered Abaya", price: 1290, compareAt: 1600, category: "abayas", img1: "/images/cat-abayas.png", img2: "/images/hero-2.png", colors: [{ hex: "#C9A96E", label: "ذهب" }, { hex: "#F5EDE0", label: "كريم" }] },
    { id: "3", slug: "shailan-premium", nameFr: "Shailan Premium", nameAr: "شيلان فاخر", nameEn: "Premium Shailan", price: 650, compareAt: 850, category: "shailan", img1: "/images/hero-2.png", img2: "/images/hero-1.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهب" }] },
    { id: "4", slug: "shailan-soie", nameFr: "Shailan Soie", nameAr: "شيلان حرير", nameEn: "Silk Shailan", price: 490, compareAt: null, category: "shailan", img1: "/images/cat-abayas.png", img2: "/images/hero-2.png", colors: [{ hex: "#F5EDE0", label: "كريم" }, { hex: "#FFFFFF", label: "أبيض" }] },
    { id: "5", slug: "saikan-classique", nameFr: "Saïkan Classique", nameAr: "صيكان كلاسيك", nameEn: "Classic Saikan", price: 750, compareAt: 950, category: "saikan", img1: "/images/cat-abayas.png", img2: "/images/hero-1.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهب" }] },
    { id: "6", slug: "saikan-dore", nameFr: "Saïkan Doré", nameAr: "صيكان ذهبي", nameEn: "Gold Saikan", price: 920, compareAt: null, category: "saikan", img1: "/images/cat-abayas.png", img2: "/images/hero-2.png", colors: [{ hex: "#C9A96E", label: "ذهب" }, { hex: "#F5EDE0", label: "كريم" }] },
    { id: "7", slug: "chaussures-femme-sport", nameFr: "Chaussures Femme Sport", nameAr: "أحذية رياضية", nameEn: "Sports Women Shoes", price: 420, compareAt: 600, category: "shoes-women", img1: "/images/cat-shoes.png", img2: "/images/hero-1.png", colors: [{ hex: "#FFFFFF", label: "أبيض" }, { hex: "#1A1A2E", label: "كحلي" }] },
    { id: "8", slug: "chaussures-femme-classic", nameFr: "Chaussures Femme Classiques", nameAr: "أحذية كلاسيكية", nameEn: "Classic Women Shoes", price: 560, compareAt: 780, category: "shoes-women", img1: "/images/cat-shoes.png", img2: "/images/hero-2.png", colors: [{ hex: "#FFFFFF", label: "أبيض" }, { hex: "#C9A96E", label: "ذهبي" }] },
    { id: "9", slug: "pyjama-luxe", nameFr: "Pyjama Luxe", nameAr: "بيجامة فاخرة", nameEn: "Luxury Pyjama", price: 380, compareAt: 520, category: "pyjamas", img1: "/images/hero-1.png", img2: "/images/cat-abayas.png", colors: [{ hex: "#F5EDE0", label: "كريم" }, { hex: "#C9A96E", label: "ذهب" }] },
    { id: "10", slug: "pyjama-satin", nameFr: "Pyjama Satin", nameAr: "بيجامة ساتان", nameEn: "Satin Pyjama", price: 450, compareAt: null, category: "pyjamas", img1: "/images/hero-2.png", img2: "/images/hero-1.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#F5EDE0", label: "كريم" }] },
    { id: "11", slug: "sabo-cuir", nameFr: "Sabo Cuir Homme", nameAr: "صابو جلد رجالي", nameEn: "Men Leather Sabo", price: 350, compareAt: 490, category: "shoes-men", img1: "/images/cat-shoes.png", img2: "/images/hero-2.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#C9A96E", label: "ذهب" }] },
    { id: "12", slug: "sabo-velours", nameFr: "Sabo Velours Homme", nameAr: "صابو مخمل رجالي", nameEn: "Men Velvet Sabo", price: 290, compareAt: null, category: "shoes-men", img1: "/images/cat-shoes.png", img2: "/images/hero-2.png", colors: [{ hex: "#1A1A2E", label: "كحلي" }, { hex: "#F5EDE0", label: "كريم" }] },
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

function ShopContent() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get("category") || "all";
    const [products, setProducts] = useState<ShopProduct[]>(ALL_PRODUCTS);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { items: cartItems } = useCartStore();

    useEffect(() => {
        let filtered = ALL_PRODUCTS;
        if (selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.nameAr.toLowerCase().includes(q) ||
                p.nameFr.toLowerCase().includes(q)
            );
        }
        setProducts(filtered);
    }, [selectedCategory, searchQuery]);

    const addToCart = (product: ShopProduct) => {
        const color = product.colors[0];
        const variant: ProductVariant = {
            id: `${product.id}-${color.hex}`,
            color: color.hex,
            colorNameFr: color.label,
            colorNameAr: color.label,
            colorNameEn: color.label,
            size: undefined,
            stock: 10,
            sku: `SKU-${product.id}`,
        };
        useCartStore.getState().addItem({
            id: product.id,
            slug: product.slug,
            nameFr: product.nameFr,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            descriptionFr: "",
            descriptionAr: "",
            descriptionEn: "",
            price: product.price,
            images: [product.img1],
            status: "active",
            category: { id: "", slug: product.category, nameFr: "", nameAr: "", nameEn: "" },
            variants: [],
        }, variant, 1);
    };

    return (
        <div className="min-h-screen bg-[#FDFAF6]" dir="rtl">
            {/* Header */}
            <header className="border-b border-[#C9A96E]/20 py-8 mt-24">
                <div className="max-w-[1300px] mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-[#C9A96E] text-[10px] tracking-[0.3em] uppercase mb-2">المتجر</p>
                        <h1 className="font-light text-[#1A1A2E] tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                            {selectedCategory === "all" ? "كل المنتجات" : CATEGORIES.find(c => c.slug === selectedCategory)?.labelAr}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحثي عن منتج..."
                                className="bg-white border border-[#C9A96E]/20 px-4 py-2.5 pe-10 text-sm text-[#1A1A2E] outline-none focus:border-[#C9A96E] rounded-lg w-64"
                            />
                            <Search size={16} className="absolute top-1/2 -translate-y-1/2 end-3 text-[#9B8E82] pointer-events-none" />
                        </div>

                        {/* Cart count */}
                        <Link href="/cart" className="relative">
                            <ShoppingBag size={20} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#C9A96E] text-white text-[8px] rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Category filter */}
            <nav className="my-8 px-6 md:px-12 max-w-[1300px] mx-auto flex overflow-x-auto gap-3">
                {CATEGORIES.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className={`px-5 py-2.5 rounded-full text-[10px] tracking-[0.15em] uppercase font-bold whitespace-nowrap transition-all duration-300 ${
                            cat.slug === selectedCategory
                                ? "bg-[#1A1A2E] text-white"
                                : "bg-white text-[#1A1A2E] hover:bg-[#C9A96E] hover:text-white border border-[#C9A96E]/20"
                        }`}
                    >
                        {cat.labelAr}
                    </Link>
                ))}
            </nav>

            {/* Products grid */}
            <main className="px-6 md:px-12 py-8">
                <div className="max-w-[1300px] mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] text-[#9B8E82] tracking-widest uppercase">
                            {products.length} منتج
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.length > 0 ? (
                            products.map((product) => {
                                const discount = product.compareAt
                                    ? Math.round((1 - product.price / product.compareAt) * 100)
                                    : 0;
                                return (
                                    <div
                                        key={product.id}
                                        className="group relative bg-white shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                                        onMouseEnter={() => setHoveredId(product.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        {/* Image */}
                                        <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-[#F5EDE0]">
                                            <Image
                                                src={product.img1}
                                                alt={product.nameAr}
                                                fill
                                                className={`object-cover transition-opacity duration-700 ${hoveredId === product.id ? "opacity-0" : "opacity-100"}`}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                            <Image
                                                src={product.img2}
                                                alt={product.nameAr}
                                                fill
                                                className={`object-cover transition-opacity duration-700 ${hoveredId === product.id ? "opacity-100" : "opacity-0"}`}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                            {discount > 0 && (
                                                <span className="absolute top-3 left-3 bg-[#1A1A2E] text-[#C9A96E] text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
                                                    -{discount}%
                                                </span>
                                            )}

                                            {/* Wishlist */}
                                            <button className="absolute top-3 right-3 w-8 h-8 bg-white/85 backdrop-blur flex items-center justify-center hover:bg-[#C9A96E] transition-all opacity-0 group-hover:opacity-100">
                                                <Heart size={14} strokeWidth={1.5} />
                                            </button>
                                        </Link>

                                        {/* Info */}
                                        <div className="p-5">
                                            <Link href={`/products/${product.slug}`}>
                                                <h3 className="font-light text-[#1A1A2E] text-lg mb-2 hover:text-[#C9A96E] transition-colors line-clamp-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                    {product.nameAr}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-2 mb-3">
                                                {product.colors.slice(0, 3).map((c, i) => (
                                                    <span
                                                        key={i}
                                                        className="w-3 h-3 rounded-full border border-[#C9A96E]/20"
                                                        style={{ background: c.hex }}
                                                        title={c.label}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {product.compareAt && (
                                                        <span className="text-[#9B8E82] text-xs line-through">
                                                            {product.compareAt.toLocaleString()} م.د
                                                        </span>
                                                    )}
                                                    <span className="text-[#1A1A2E] font-semibold">
                                                        {product.price.toLocaleString()} م.د
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="text-[#1A1A2E] hover:text-[#C9A96E] transition-colors"
                                                    aria-label="أضف إلى السلة"
                                                >
                                                    <ShoppingBag size={16} strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <p className="text-[#9B8E82] text-sm">لا توجد منتجات في هذه الفئة</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] flex items-center justify-center">
                <p className="text-[#C9A96E] text-[10px] uppercase animate-pulse">جاري التحميل...</p>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
