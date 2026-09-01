"use client";

import { useState, useEffect, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { createOrder } from "@/lib/api";
import { CheckCircle, CreditCard, Ship, AlertCircle } from "lucide-react";

function CheckoutContent({ params }: { params: { locale: string } }) {
    const { locale } = params;
    const isAr = locale === "ar";
    const isEn = locale === "en";
    const t = useTranslations("checkout");
    const { items, total, clearCart } = useCartStore();
    const searchParams = useSearchParams();

    const [paymentMethod, setPaymentMethod] = useState<"COD" | "STRIPE">("COD");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [form, setForm] = useState({
        phone: "",
        fullName: "",
        street: "",
        city: "",
    });

    // Stripe payment method logic removed for now

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        try {
            await createOrder({
                guestPhone: form.phone,
                address: {
                    fullName: form.fullName,
                    phone: form.phone,
                    street: form.street,
                    city: form.city,
                    region: form.city,
                },
                paymentMethod,
                items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
            });
            clearCart();
            setSuccess(true);

            // Notification WhatsApp pour l'admin
            const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "212660560522";
            const msg = isAr
                ? `مرحباً IMAD Mode،\nلقد قمت للتو بإرسال طلب جديد من المتجر.\n\nالاسم: ${form.fullName}\nرقم الهاتف: ${form.phone}\nتكلفة الطلب: ${total().toFixed(2)} MAD`
                : `Bonjour IMAD Mode,\nJe viens de valider une nouvelle commande sur le site.\n\nNom: ${form.fullName}\nTéléphone: ${form.phone}\nMontant: ${total().toFixed(2)} MAD`;
            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');

        } catch (err: unknown) {
            console.error("Order creation failed:", err);
            setErrorMsg(
                isAr
                    ? "فشل في تسجيل طلبكم. برجاء التحقق من البيانات والمحاولة مجدداً."
                    : "Erreur lors de la commande. Veuillez vérifier vos informations et réessayer."
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 max-w-lg mx-auto text-center" dir={isAr ? "rtl" : "ltr"}>
                <CheckCircle size={56} strokeWidth={1} className="text-[#C9A96E] mb-8 animate-pulse" />
                <h1 className="text-4xl font-light text-[#1A1A2E] tracking-wide mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {t("success_title")}
                </h1>
                <p className="text-[#9B8E82] text-sm tracking-wide leading-relaxed font-light mb-8">
                    {t("success_msg")}
                </p>
                <a
                    href={`/${locale}`}
                    className="inline-block bg-[#1A1A2E] text-white text-[10px] tracking-[0.25em] uppercase font-bold py-4 px-10 hover:bg-[#C9A96E] transition-all duration-300"
                >
                    {isAr ? "العودة للرئيسية" : isEn ? "Back to Home" : "Retour à l'accueil"}
                </a>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center px-4 max-w-lg mx-auto text-center" dir={isAr ? "rtl" : "ltr"}>
                <p className="text-3xl font-light text-[#1A1A2E] tracking-wide mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {isAr ? "حقيبة التسوق فارغة" : isEn ? "Your cart is empty" : "Votre panier est vide"}
                </p>
                <p className="text-[#9B8E82] text-xs uppercase tracking-widest font-light mb-8">
                    {isAr ? "تصفحي مجموعاتنا الراقية لأحدث التصاميم" : "Explore our exclusive lines and discover new creations"}
                </p>
                <a
                    href={`/${locale}/shop`}
                    className="inline-block bg-[#1A1A2E] text-white text-[10px] tracking-[0.25em] uppercase font-bold py-4 px-10 hover:bg-[#C9A96E] transition-all duration-300"
                >
                    {isAr ? "تسوقي الآن" : isEn ? "Shop Now" : "Découvrir la boutique"}
                </a>
            </div>
        );
    }

    const formFields = [
        { key: "fullName", label: t("full_name"), type: "text", placeholder: isAr ? "ياسمين العلمي" : "Yasmin Alami" },
        { key: "phone", label: t("phone"), type: "tel", placeholder: "+212 600-000000" },
        { key: "street", label: t("address"), type: "text", placeholder: isAr ? "شارع المسيرة، رقم 4" : "12 Route d'Anfa, N°4" },
        { key: "city", label: t("city"), type: "text", placeholder: isAr ? "الدار البيضاء" : "Casablanca" },
    ];

    return (
        <div className="max-w-[1300px] mx-auto px-6 md:px-12 py-16 md:py-24" dir={isAr ? "rtl" : "ltr"}>
            <div className="text-center mb-16">
                <p className="text-[#C9A96E] text-[10px] tracking-[0.3em] uppercase mb-4">Haute Couture Modeste</p>
                <h1 className="text-4xl md:text-5xl font-light text-[#1A1A2E] tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {t("title")}
                </h1>
                <div className="w-[100px] h-px bg-[#C9A96E]/20 mx-auto mt-6" />
            </div>

            <div className="grid lg:grid-cols-12 gap-16 items-start">
                {/* ─── Form Pane (7 cols) ─────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-12">
                    {errorMsg && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 text-xs tracking-wide">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xs tracking-[0.2em] uppercase font-bold text-[#1A1A2E] mb-8 border-b border-[#C9A96E]/10 pb-4">
                            01. {t("shipping")}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
                            {formFields.map((f) => (
                                <div key={f.key} className={f.key === "street" ? "md:col-span-2" : ""}>
                                    <label className="block text-[9px] tracking-[0.2em] uppercase font-medium text-[#C9A96E] mb-2">
                                        {f.label} *
                                    </label>
                                    <input
                                        type={f.type}
                                        required
                                        placeholder={f.placeholder}
                                        value={form[f.key as keyof typeof form]}
                                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                        className="w-full bg-[#FDFAF6] border border-[#1A1A2E]/10 px-5 py-4 text-xs tracking-wide text-[#1A1A2E] outline-none transition-colors hover:border-[#1A1A2E]/30 focus:border-[#C9A96E] focus:bg-white placeholder:text-[#9B8E82]/50 placeholder:text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs tracking-[0.2em] uppercase font-bold text-[#1A1A2E] mb-8 border-b border-[#C9A96E]/10 pb-4">
                            02. {t("payment")}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* COD Option */}
                            <label
                                className={`group flex items-center justify-between p-6 border cursor-pointer transition-all duration-300 ${paymentMethod === "COD"
                                    ? "border-[#C9A96E] bg-[#fbf8f3]"
                                    : "border-[#1A1A2E]/10 hover:border-[#C9A96E]/50 bg-transparent"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={() => setPaymentMethod("COD")}
                                        className="accent-[#C9A96E] w-4 h-4 cursor-pointer"
                                    />
                                    <div className="text-start">
                                        <p className="font-medium text-xs text-[#1A1A2E] tracking-wider uppercase">{t("cod")}</p>
                                        <p className="text-[10px] text-[#9B8E82] font-light mt-1">
                                            {isAr ? "الدفع عند الاستلام نقداً" : "Pay with cash on delivery"}
                                        </p>
                                    </div>
                                </div>
                                <Ship size={20} strokeWidth={1} className={paymentMethod === "COD" ? "text-[#C9A96E]" : "text-[#9B8E82]"} />
                            </label>
                            {/* Stripe Card Option DISABLED for now */}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full relative flex items-center justify-center bg-[#1A1A2E] text-white text-[10px] md:text-[11px] font-bold tracking-[0.25em] py-5 px-8 uppercase overflow-hidden hover:bg-[#C9A96E] transition-colors duration-500 disabled:opacity-50"
                    >
                        {loading ? "..." : t("submit")}
                    </button>
                </form>

                {/* ─── Summary Pane (5 cols) ─────────────────────────────────────── */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                    <div className="border border-[#C9A96E]/20 bg-[#FDFAF6] p-8 md:p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#C9A96E]" />

                        <h2 className="text-[#1A1A2E] font-light text-2xl tracking-wide mb-8 border-b border-[#C9A96E]/10 pb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {isAr ? "ملخص الطلب" : isEn ? "Order Summary" : "Résumé de votre Commande"}
                        </h2>

                        <div className="divide-y divide-[#C9A96E]/10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.variantId} className="flex justify-between items-center py-4 text-xs">
                                    <div className="text-start pr-4">
                                        <p className="text-[#1A1A2E] font-semibold tracking-wide truncate max-w-[200px]">
                                            {locale === "ar" ? item.nameAr : locale === "en" ? item.nameEn : item.nameFr}
                                        </p>
                                        <p className="text-[10px] text-[#9B8E82] uppercase mt-1">
                                            {isAr ? "الكمية " : "Qty "} {item.quantity}
                                        </p>
                                    </div>
                                    <span className="font-medium text-[#1A1A2E] select-all shrink-0">
                                        {(item.price * item.quantity).toFixed(2)} MAD
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-[#C9A96E]/15 mt-6 pt-6 space-y-4">
                            <div className="flex justify-between items-center text-xs text-[#9B8E82] tracking-wide">
                                <span>{isAr ? "الشحن" : "Shipping"}</span>
                                <span className="uppercase text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5">
                                    {isAr ? "مجانى" : "Free"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#C9A96E]/10 pt-4">
                                <span className="text-xs uppercase tracking-widest font-semibold text-[#1A1A2E]">Total</span>
                                <span className="text-xl font-bold text-[#C9A96E]">
                                    {total().toFixed(2)} MAD
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage({ params }: { params: { locale: string } }) {
    return (
        <Suspense fallback={
            <div className="min-h-[85vh] flex items-center justify-center bg-[#FDFAF6]">
                <p className="text-xs tracking-[0.2em] text-[#C9A96E] uppercase animate-pulse">Loading Checkout...</p>
            </div>
        }>
            <CheckoutContent params={params} />
        </Suspense>
    );
}
