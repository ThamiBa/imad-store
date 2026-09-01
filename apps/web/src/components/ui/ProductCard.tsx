"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart.store";

/* ── Types ─────────────────────────────────────────────────── */
interface MockProduct {
    id: string;
    slug: string;
    nameFr: string;
    nameAr: string;
    nameEn: string;
    price: number;
    compareAt?: number;
    category: string;
    images: string[];
    variants: { id: string; color: string; colorLabel: string; size?: string; instock: boolean }[];
}

interface Props {
    product: MockProduct;
    locale: string;
    index?: number;
}

function getName(p: MockProduct, locale: string) {
    if (locale === "ar") return p.nameAr;
    if (locale === "en") return p.nameEn;
    return p.nameFr;
}

/* ── Component ─────────────────────────────────────────────── */
export function ProductCard({ product, locale, index = 0 }: Props) {
    const { openCart } = useCartStore();
    const [wished, setWished] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);

    const name = getName(product, locale);
    const discount = product.compareAt
        ? Math.round((1 - product.price / product.compareAt) * 100)
        : null;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Quick-add first available variant — opens cart
        openCart();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href={`/${locale}/products/${product.slug}`} className="group block">

                {/* ── Image container ── */}
                <div className="relative aspect-[3/4] bg-[#F5EDE0] overflow-hidden">

                    {/* Main image */}
                    {product.images[imgIdx] ? (
                        <Image
                            src={product.images[imgIdx]}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={48} strokeWidth={0.8} className="text-[#C9A96E]/30" />
                        </div>
                    )}

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {discount && (
                            <span className="bg-[#1A1A2E] text-[#C9A96E] text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
                                -{discount}%
                            </span>
                        )}
                        <span className="bg-[#C9A96E] text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1.5">
                            {locale === "ar" ? "حصري" : locale === "en" ? "Exclusive" : "Exclusif"}
                        </span>
                    </div>

                    {/* Wishlist */}
                    <button
                        onClick={(e) => { e.preventDefault(); setWished(!wished); }}
                        className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#C9A96E] hover:text-white"
                    >
                        <Heart
                            size={15}
                            strokeWidth={wished ? 0 : 1.5}
                            fill={wished ? "#C9A96E" : "none"}
                            className={wished ? "text-[#C9A96E]" : "text-[#1A1A2E]"}
                        />
                    </button>

                    {/* Second image preview on thumbnail hover */}
                    {product.images[1] && (
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            onMouseEnter={() => setImgIdx(1)}
                            onMouseLeave={() => setImgIdx(0)}
                        >
                            <Image
                                src={product.images[1]}
                                alt={`${name} alt`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Quick add button — slides up on hover */}
                    <button
                        onClick={handleQuickAdd}
                        className="absolute bottom-0 inset-x-0 z-10 bg-[#1A1A2E] text-white text-[10px] tracking-[0.25em] uppercase py-4 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out hover:bg-[#C9A96E]"
                    >
                        <ShoppingBag size={13} strokeWidth={1.5} />
                        {locale === "ar" ? "إضافة سريعة" : locale === "en" ? "Quick Add" : "Ajout Rapide"}
                    </button>
                </div>

                {/* ── Info panel ── */}
                <div className="pt-5 pb-2 px-1">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2 font-medium">
                        {product.category}
                    </p>
                    <h3
                        className="text-[#1A1A2E] text-base leading-snug mb-3 group-hover:text-[#C9A96E] transition-colors duration-300"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        {name}
                    </h3>

                    {/* Price row */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[#1A1A2E] text-sm font-medium tracking-wide">
                            {product.price.toFixed(0)} MAD
                        </span>
                        {product.compareAt && (
                            <span className="text-[#8B8399] text-xs line-through">
                                {product.compareAt.toFixed(0)} MAD
                            </span>
                        )}
                    </div>

                    {/* Color swatches */}
                    {product.variants.length > 0 && (
                        <div className="flex items-center gap-2">
                            {product.variants.slice(0, 5).map((v) => (
                                <div
                                    key={v.id}
                                    className="w-4 h-4 rounded-full border border-[#C9A96E]/30 shadow-sm shrink-0 hover:scale-125 transition-transform cursor-pointer"
                                    style={{ background: v.color }}
                                    title={v.colorLabel}
                                />
                            ))}
                            {product.variants.length > 5 && (
                                <span className="text-[10px] text-[#8B8399]">+{product.variants.length - 5}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom golden rule */}
                <div className="h-px bg-[#C9A96E]/20 mx-1 mt-3 group-hover:bg-[#C9A96E]/60 transition-colors duration-500" />
            </Link>
        </motion.div>
    );
}
