"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage({ params }: { params: { locale: string } }) {
    const { locale } = params;
    const isAr = locale === "ar";
    const isFr = locale === "fr";
    const router = useRouter();

    const copy = {
        eyebrow: "IMAD MODE",
        title: isAr ? "تسجيل الدخول" : isFr ? "Connexion" : "Sign In",
        subtitle: isAr
            ? "الولوج إلى فضائكم الخاص"
            : isFr
                ? "Accédez à votre espace exclusif"
                : "Access your exclusive space",
        emailLabel: isAr ? "البريد الإلكتروني" : isFr ? "Adresse Email" : "Email Address",
        passwordLabel: isAr ? "كلمة المرور" : isFr ? "Mot de passe" : "Password",
        submitBtn: isAr ? "تسجيل الدخول" : isFr ? "Se Connecter" : "Sign In",
        noAccount: isAr ? "ليس لديكم حساب؟" : isFr ? "Pas encore de compte ?" : "No account yet?",
        registerLink: isAr ? "إنشاء حساب" : isFr ? "Créer un compte" : "Create Account",
        homeBack: isAr ? "الرئيسية" : isFr ? "Accueil" : "Home",
        heroCopy: isAr
            ? "أناقة راقية\nفي كل فرصة"
            : isFr
                ? "Élégance Intemporelle\nChaque Occasion"
                : "Timeless Elegance\nEvery Occasion",
        heroSub: "Haute Couture Modeste",
        errInvalid: isAr
            ? "بريد إلكتروني أو كلمة مرور غير صحيحة."
            : isFr
                ? "Email ou mot de passe incorrect."
                : "Invalid email or password.",
    };

    const [form, setForm] = useState({ email: "", password: "" });
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
            const res = await loginUser(form);
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            router.push(`/${locale}`);
        } catch {
            setError(copy.errInvalid);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#FDFAF6]" dir={isAr ? "rtl" : "ltr"}>
            {/* ─── Editorial image panel ──────────────────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1A1A2E]">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] hover:scale-105"
                    style={{ backgroundImage: "url('/images/hero-1.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/90 via-[#1A1A2E]/30 to-transparent" />
                <div className="absolute top-10 left-10">
                    <span className="text-[9px] tracking-[0.35em] uppercase text-white/40 font-light">
                        © 2024 IMAD Mode
                    </span>
                </div>
                <div className="absolute bottom-16 left-14 right-14">
                    <p className="text-[#C9A96E] text-[9px] tracking-[0.3em] uppercase mb-4">{copy.heroSub}</p>
                    <h2
                        className="text-white font-light text-5xl leading-[1.1] whitespace-pre-line"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        {copy.heroCopy}
                    </h2>
                    <div className="w-12 h-px bg-[#C9A96E] mt-8" />
                </div>
            </div>

            {/* ─── Form panel ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 py-16 relative">
                <Link
                    href={`/${locale}`}
                    className="absolute top-8 left-8 text-[9px] tracking-[0.25em] uppercase text-[#9B8E82] font-medium hover:text-[#C9A96E] transition-colors flex items-center gap-2"
                >
                    <ArrowRight size={12} className="rotate-180" />
                    {copy.homeBack}
                </Link>

                <div className="max-w-[400px] w-full">
                    <p className="text-[#C9A96E] text-[9px] tracking-[0.35em] uppercase mb-6">{copy.eyebrow}</p>
                    <h1
                        className="text-5xl font-light text-[#1A1A2E] leading-[1.05] mb-3"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        {copy.title}
                    </h1>
                    <p className="text-[#9B8E82] text-xs tracking-wide font-light mb-14">{copy.subtitle}</p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="py-3 px-4 border-l-2 border-red-400 bg-red-50 text-red-600 text-xs tracking-wide">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[9px] tracking-[0.25em] uppercase font-semibold text-[#C9A96E] mb-3">
                                {copy.emailLabel}
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="yasmin@example.com"
                                className="w-full bg-transparent border-b border-[#1A1A2E]/15 pb-3 text-sm text-[#1A1A2E] outline-none focus:border-[#C9A96E] transition-colors placeholder:text-[#9B8E82]/30 placeholder:text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] tracking-[0.25em] uppercase font-semibold text-[#C9A96E] mb-3">
                                {copy.passwordLabel}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-b border-[#1A1A2E]/15 pb-3 text-sm text-[#1A1A2E] outline-none focus:border-[#C9A96E] transition-colors placeholder:text-[#9B8E82]/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 text-[#9B8E82] hover:text-[#C9A96E] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1A1A2E] text-white text-[10px] font-bold tracking-[0.35em] py-[18px] uppercase hover:bg-[#C9A96E] transition-all duration-500 disabled:opacity-40 mt-2"
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
                        {copy.noAccount}{" "}
                        <Link
                            href={`/${locale}/auth/register`}
                            className="text-[#1A1A2E] font-bold hover:text-[#C9A96E] transition-colors"
                        >
                            {copy.registerLink} →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
