"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage({ params }: { params: { locale: string } }) {
    const { locale } = params;
    const isAr = locale === "ar";
    const isFr = locale === "fr";
    const router = useRouter();

    const copy = {
        eyebrow: "IMAD MODE",
        title: isAr ? "إنشاء حساب" : isFr ? "Créer un Compte" : "Create Account",
        subtitle: isAr
            ? "الانضمام إلى نادي عماد مود الخاص"
            : isFr
                ? "Rejoignez le club privé IMAD Mode"
                : "Join the private club IMAD Mode",
        firstLabel: isAr ? "الاسم الشخصي" : isFr ? "Prénom" : "First Name",
        lastLabel: isAr ? "الاسم العائلي" : isFr ? "Nom de famille" : "Last Name",
        emailLabel: isAr ? "البريد الإلكتروني" : isFr ? "Adresse Email" : "Email Address",
        phoneLabel: isAr ? "رقم الهاتف" : isFr ? "Téléphone" : "Phone Number",
        passwordLabel: isAr ? "كلمة المرور" : isFr ? "Mot de passe" : "Password",
        passwordHint: isAr ? "8 أحرف كحد أدنى" : isFr ? "8 caractères minimum" : "Minimum 8 characters",
        submitBtn: isAr ? "إنشاء الحساب" : isFr ? "Créer le Compte" : "Create Account",
        haveAccount: isAr ? "لديكم حساب بالفعل؟" : isFr ? "Déjà un compte ?" : "Already have an account?",
        loginLink: isAr ? "تسجيل الدخول" : isFr ? "Se connecter" : "Sign In",
        homeBack: isAr ? "الرئيسية" : isFr ? "Accueil" : "Home",
        heroCopy: isAr
            ? "انضمي إلى\nنادينا الخاص"
            : isFr
                ? "Rejoignez\nNotre Club Privé"
                : "Join Our\nPrivate Club",
        heroBadge: isAr ? "وصول أول — عروض خاصة — تجربة مخصصة"
            : isFr ? "Accès Prioritaire — Offres Exclusives — Expérience VIP"
                : "Early Access — Exclusive Offers — VIP Experience",
        errDuplicate: isAr ? "هذا البريد الإلكتروني مستخدم بالفعل." : isFr ? "Cet email est déjà utilisé." : "This email is already registered.",
        errGeneric: isAr ? "حدث خطأ. برجاء المحاولة مجدداً." : isFr ? "Une erreur est survenue." : "Something went wrong. Please try again.",
    };

    const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
            router.push(`/${locale}`);
        }
    }, [locale, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await registerUser(form);
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            router.push(`/${locale}`);
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? "";
            setError(msg.includes("use") ? copy.errDuplicate : copy.errGeneric);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full bg-transparent border-b border-[#1A1A2E]/15 pb-3 text-sm text-[#1A1A2E] outline-none focus:border-[#C9A96E] transition-colors placeholder:text-[#9B8E82]/30 placeholder:text-xs";
    const labelClass = "block text-[9px] tracking-[0.25em] uppercase font-semibold text-[#C9A96E] mb-3";

    return (
        <div className="min-h-screen flex bg-[#FDFAF6]" dir={isAr ? "rtl" : "ltr"}>
            {/* ─── Left editorial panel ───────────────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1A2E]">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] hover:scale-105"
                    style={{ backgroundImage: "url('/images/cat-abayas.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/92 via-[#1A1A2E]/25 to-transparent" />
                <div className="absolute top-10 left-10">
                    <span className="text-[9px] tracking-[0.35em] uppercase text-white/40 font-light">
                        © 2024 IMAD Mode
                    </span>
                </div>
                <div className="absolute bottom-16 left-14 right-10">
                    <p className="text-[#C9A96E] text-[9px] tracking-[0.3em] uppercase mb-4">Collection Exclusive</p>
                    <h2
                        className="text-white font-light text-5xl leading-[1.1] whitespace-pre-line"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        {copy.heroCopy}
                    </h2>
                    <div className="w-12 h-px bg-[#C9A96E] mt-8 mb-5" />
                    <p className="text-white/40 text-[9px] tracking-[0.18em] font-light">
                        {copy.heroBadge}
                    </p>
                </div>
            </div>

            {/* ─── Right: form panel ─────────────────────────────── */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 py-16 relative overflow-y-auto">
                <Link
                    href={`/${locale}`}
                    className="absolute top-8 left-8 text-[9px] tracking-[0.25em] uppercase text-[#9B8E82] font-medium hover:text-[#C9A96E] transition-colors flex items-center gap-2"
                >
                    <ArrowRight size={12} className="rotate-180" />
                    {copy.homeBack}
                </Link>

                <div className="max-w-[420px] w-full">
                    <p className="text-[#C9A96E] text-[9px] tracking-[0.35em] uppercase mb-6">{copy.eyebrow}</p>
                    <h1
                        className="text-5xl font-light text-[#1A1A2E] leading-[1.05] mb-3"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        {copy.title}
                    </h1>
                    <p className="text-[#9B8E82] text-xs tracking-wide font-light mb-12">{copy.subtitle}</p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="py-3 px-4 border-l-2 border-red-400 bg-red-50 text-red-600 text-xs tracking-wide">
                                {error}
                            </div>
                        )}

                        {/* First & Last in a row */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{copy.firstLabel}</label>
                                <input
                                    type="text"
                                    required
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    placeholder={isAr ? "ياسمين" : "Yasmin"}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{copy.lastLabel}</label>
                                <input
                                    type="text"
                                    required
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    placeholder={isAr ? "العلمي" : "Alami"}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>{copy.emailLabel}</label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="yasmin@example.com"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{copy.phoneLabel}</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+212 600-000000"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>{copy.passwordLabel}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 text-[#9B8E82] hover:text-[#C9A96E] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                                </button>
                            </div>
                            <p className="text-[9px] text-[#9B8E82]/60 mt-2 tracking-wide">{copy.passwordHint}</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#C9A96E] text-white text-[10px] font-bold tracking-[0.35em] py-[18px] uppercase hover:bg-[#1A1A2E] transition-all duration-500 disabled:opacity-40 mt-2"
                        >
                            {loading ? "..." : copy.submitBtn}
                        </button>
                    </form>

                    <div className="flex items-center gap-5 my-10">
                        <div className="flex-1 h-px bg-[#1A1A2E]/8" />
                        <span className="text-[8px] tracking-[0.2em] uppercase text-[#9B8E82]/60">ou</span>
                        <div className="flex-1 h-px bg-[#1A1A2E]/8" />
                    </div>

                    <p className="text-center text-[11px] text-[#9B8E82] tracking-wide">
                        {copy.haveAccount}{" "}
                        <Link
                            href={`/${locale}/auth/login`}
                            className="text-[#1A1A2E] font-bold hover:text-[#C9A96E] transition-colors"
                        >
                            {copy.loginLink} →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
