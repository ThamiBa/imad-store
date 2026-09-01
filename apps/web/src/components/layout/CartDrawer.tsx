"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck, CreditCard, ShieldCheck, Gift, Sparkles, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore, CartItem } from "@/store/cart.store";

function locName(item: CartItem, locale: string) {
    if (locale === "ar") return item.nameAr;
    if (locale === "en") return item.nameEn;
    return item.nameFr;
}

const FREE_THRESHOLD = 800;

export function CartDrawer({ locale }: { locale: string }) {
    const { items, isOpen, closeCart, updateQty, removeItem, total } = useCartStore();
    const subtotal = total();
    const freeLeft = Math.max(0, FREE_THRESHOLD - subtotal);
    const progress = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
    const deliveryFee = freeLeft === 0 ? 0 : 30; // 30 MAD standard Delivery
    const orderTotal = subtotal + deliveryFee;

    const T = {
        bag: locale === "ar" ? "حقيبتي" : locale === "en" ? "My Bag" : "Mon Panier",
        items: locale === "ar" ? "قطعة" : locale === "en" ? "item" : "article",
        empty: locale === "ar" ? "حقيبتك فارغة" : locale === "en" ? "Your bag is empty" : "Votre panier est vide",
        browse: locale === "ar" ? "تصفح المجموعة" : locale === "en" ? "Explore Collection" : "Explorer la Collection",
        shippingBar: (n: number) => locale === "ar"
            ? `أضف ${n.toFixed(0)} درهم للشحن المجاني`
            : locale === "en" ? `Add ${n.toFixed(0)} MAD for free shipping`
                : `${n.toFixed(0)} MAD pour la livraison offerte`,
        freeShip: locale === "ar" ? "🎉 شحن مجاني مفعّل" : locale === "en" ? "🎉 Free shipping unlocked!" : "🎉 Livraison offerte !",
        subtotal: locale === "ar" ? "المجموع" : locale === "en" ? "Subtotal" : "Sous-total",
        delivery: locale === "ar" ? "التوصيل" : locale === "en" ? "Delivery" : "Livraison",
        free: locale === "ar" ? "مجاني" : locale === "en" ? "Free" : "Offerte",
        total: locale === "ar" ? "المجموع الكلي" : locale === "en" ? "Total" : "Total",
        payment: locale === "ar" ? "طريقة الدفع" : locale === "en" ? "Payment method" : "Mode de paiement",
        byCard: locale === "ar" ? "الدفع بالبطاقة" : locale === "en" ? "Pay by Card" : "Paiement par carte",
        onDelivery: locale === "ar" ? "الدفع عند الاستلام" : locale === "en" ? "Pay on Delivery" : "Paiement à la livraison",
        order: locale === "ar" ? "تأكيد الطلب" : locale === "en" ? "Place Order" : "Passer la commande",
        secure: locale === "ar" ? "دفع آمن ومشفّر" : locale === "en" ? "Secure & encrypted" : "Paiement sécurisé et crypté",
        gift: locale === "ar" ? "إضافة رسالة هدية" : locale === "en" ? "Add a gift message" : "Ajouter un message cadeau",
        size: locale === "ar" ? "مقاس" : locale === "en" ? "Size" : "Taille",
    };

    return (
        <>
            {/* ── Backdrop ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div key="backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: "fixed", inset: 0, zIndex: 100 }}
                        className="bg-[#1A1A2E]/70 backdrop-blur-md"
                        onClick={closeCart}
                    />
                )}
            </AnimatePresence>

            {/* ══════════════════ CART PANEL ══════════════════ */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        key="cart"
                        initial={{ x: locale === "ar" ? "-100%" : "100%", opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: locale === "ar" ? "-100%" : "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 34 }}
                        style={{ position: "fixed", top: 0, ...(locale === "ar" ? { left: 0 } : { right: 0 }), bottom: 0, zIndex: 101, width: "100%", maxWidth: 520 }}
                        className={`flex flex-col bg-[#FDFAF6] ${locale === "ar" ? 'shadow-[40px_0_120px_rgba(0,0,0,0.35)]' : 'shadow-[-40px_0_120px_rgba(0,0,0,0.35)]'}`}
                    >
                        {/* ─── DARK EDITORIAL HEADER ─── */}
                        <div className="relative bg-[#1A1A2E] px-8 pt-7 pb-6 shrink-0">
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/60 to-transparent" />

                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag size={21} strokeWidth={1.2} className="text-[#C9A96E]" />
                                    <h2 className="text-[26px] font-light text-white tracking-[0.12em]"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        {T.bag}
                                    </h2>
                                    {items.length > 0 && (
                                        <motion.span key={items.length}
                                            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                            className="bg-[#C9A96E] text-white text-[10px] font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1.5">
                                            {items.length}
                                        </motion.span>
                                    )}
                                </div>
                                <button onClick={closeCart}
                                    className="w-9 h-9 border border-white/15 flex items-center justify-center text-white/50 hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-all">
                                    <X size={17} strokeWidth={1.5} />
                                </button>
                            </div>

                            {/* Free shipping progress */}
                            {items.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[9px] tracking-[0.18em] uppercase text-white/40">
                                            {freeLeft > 0 ? T.shippingBar(freeLeft) : T.freeShip}
                                        </p>
                                        <span className="text-[9px] tracking-widest text-[#C9A96E] uppercase">{T.free}</span>
                                    </div>
                                    <div className="h-0.5 bg-white/8 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-[#C9A96E] to-[#F0D89A]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── ITEMS SCROLL AREA ─── */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            {items.length === 0 ? (
                                /* Empty state */
                                <div className="flex flex-col items-center justify-center h-full gap-8 px-8 py-16 text-center">
                                    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.15, type: "spring" }}
                                        className="relative w-32 h-32 rounded-full bg-[#F5EDE0] flex items-center justify-center">
                                        <ShoppingBag size={56} strokeWidth={0.7} className="text-[#C9A96E]/35" />
                                        <Sparkles size={22} className="absolute -top-1 -right-2 text-[#C9A96E]/50" />
                                    </motion.div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-light text-[#1A1A2E]"
                                            style={{ fontFamily: "'Cormorant Garamond', serif" }}>{T.empty}</p>
                                        <p className="text-[9px] tracking-[0.25em] uppercase text-[#8B8399]">
                                            {locale === "ar" ? "اكتشفي أناقتنا الفاخرة" : "Découvrez notre sélection exclusive"}
                                        </p>
                                    </div>
                                    <Link href={`/${locale}/shop`} onClick={closeCart}
                                        className="border border-[#C9A96E] text-[#C9A96E] text-[10px] tracking-[0.3em] uppercase px-10 py-3.5 hover:bg-[#C9A96E] hover:text-white transition-all duration-300">
                                        {T.browse}
                                    </Link>
                                </div>
                            ) : (
                                <div className="px-8 py-5 space-y-0 divide-y divide-[#C9A96E]/8">
                                    <AnimatePresence initial={false}>
                                        {items.map((item, idx) => (
                                            <motion.div key={item.variantId} layout
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 80, transition: { duration: 0.22 } }}
                                                transition={{ delay: idx * 0.04 }}
                                                className="flex gap-5 py-6"
                                            >
                                                {/* Image — large and prominent */}
                                                <div className="relative w-28 h-36 bg-[#F5EDE0] shrink-0 overflow-hidden group">
                                                    {item.image ? (
                                                        <Image src={item.image} alt={locName(item, locale)} fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag size={32} strokeWidth={0.8} className="text-[#C9A96E]/20" />
                                                        </div>
                                                    )}
                                                    {/* Gold badge overlay */}
                                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1A1A2E]/50 to-transparent h-1/3 pointer-events-none" />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 flex flex-col min-w-0 py-1">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <Link href={`/${locale}/products/${item.productSlug}`} onClick={closeCart}
                                                            className="text-base text-[#1A1A2E] hover:text-[#C9A96E] transition-colors line-clamp-2 leading-snug"
                                                            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                            {locName(item, locale)}
                                                        </Link>
                                                        <button onClick={() => removeItem(item.variantId)}
                                                            className="shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center text-[#1A1A2E]/20 hover:text-red-400 hover:bg-red-50 rounded-sm transition-all">
                                                            <Trash2 size={13} strokeWidth={1.5} />
                                                        </button>
                                                    </div>

                                                    {item.size && (
                                                        <span className="text-[8px] tracking-[0.25em] uppercase text-[#8B8399] mb-3">
                                                            {T.size}: {item.size}
                                                        </span>
                                                    )}

                                                    <div className="flex items-center justify-between mt-auto">
                                                        {/* Qty stepper */}
                                                        <div className="flex items-center border border-[#C9A96E]/25 divide-x divide-[#C9A96E]/20">
                                                            <button onClick={() => updateQty(item.variantId, item.quantity - 1)}
                                                                className="w-9 h-9 flex items-center justify-center text-[#1A1A2E]/40 hover:text-[#C9A96E] hover:bg-[#C9A96E]/5 transition-colors">
                                                                <Minus size={11} />
                                                            </button>
                                                            <span className="w-10 h-9 flex items-center justify-center text-sm font-medium text-[#1A1A2E]">
                                                                {item.quantity}
                                                            </span>
                                                            <button onClick={() => updateQty(item.variantId, item.quantity + 1)}
                                                                className="w-9 h-9 flex items-center justify-center text-[#1A1A2E]/40 hover:text-[#C9A96E] hover:bg-[#C9A96E]/5 transition-colors">
                                                                <Plus size={11} />
                                                            </button>
                                                        </div>

                                                        {/* Line price */}
                                                        <motion.p key={item.quantity}
                                                            initial={{ scale: 1.2, color: "#C9A96E" }}
                                                            animate={{ scale: 1, color: "#1A1A2E" }}
                                                            transition={{ duration: 0.35 }}
                                                            className="text-[17px] font-light"
                                                            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                            {(item.price * item.quantity).toLocaleString()} MAD
                                                        </motion.p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Gift note */}
                                    <div className="py-5 flex items-center gap-3 text-[10px] tracking-widest uppercase text-[#8B8399] hover:text-[#C9A96E] transition-colors cursor-pointer group">
                                        <Gift size={14} strokeWidth={1.5} className="group-hover:scale-110 transition-transform shrink-0" />
                                        {T.gift} +
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── CHECKOUT PANEL ─── */}
                        {items.length > 0 && (
                            <div className="shrink-0 border-t border-[#C9A96E]/15 bg-white">
                                <div className="px-8 pt-7 pb-5">



                                    {/* Summary rows */}
                                    <div className="space-y-2 pb-5 border-b border-[#C9A96E]/10">
                                        <div className="flex justify-between text-xs text-[#1A1A2E]/50">
                                            <span className="tracking-wider uppercase">{T.subtotal}</span>
                                            <span>{subtotal.toLocaleString()} MAD</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="tracking-wider uppercase text-[#1A1A2E]/50">{T.delivery}</span>
                                            <span className={deliveryFee === 0 ? "text-[#C9A96E] text-xs tracking-wider" : "text-[#1A1A2E]/60"}>
                                                {deliveryFee === 0 ? T.free : `${deliveryFee} MAD`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-baseline pt-4 mb-6">
                                        <span className="text-[10px] tracking-[0.25em] uppercase text-[#1A1A2E]/60">{T.total}</span>
                                        <motion.span key={orderTotal}
                                            initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                            className="text-2xl font-light text-[#1A1A2E]"
                                            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            {orderTotal.toLocaleString()} MAD
                                        </motion.span>
                                    </div>

                                    {/* ── Place Order CTA ── */}
                                    <Link href={`/${locale}/checkout?method=delivery`} onClick={closeCart}
                                        className="group w-full flex items-center justify-between bg-[#1A1A2E] text-white px-8 py-5 hover:bg-[#C9A96E] transition-all duration-500 mb-4">
                                        <span className="text-[11px] tracking-[0.35em] uppercase font-medium">{T.order}</span>
                                        <div className="w-8 h-8 border border-white/30 group-hover:border-white/60 flex items-center justify-center group-hover:translate-x-1 transition-all">
                                            <ArrowRight size={15} strokeWidth={1.5} />
                                        </div>
                                    </Link>

                                    {/* Security */}
                                    <div className="flex items-center justify-center gap-2">
                                        <ShieldCheck size={11} strokeWidth={1.5} className="text-[#8B8399]" />
                                        <p className="text-[9px] tracking-wider text-[#8B8399]">{T.secure}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
