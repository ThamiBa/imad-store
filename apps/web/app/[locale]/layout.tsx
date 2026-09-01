import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
    title: "Imad Mode — L'Élégance Modeste",
    description: "Collection exclusive de hijabs, niqabs et abayas de luxe. أناقة محتشمة فاخرة.",
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = await Promise.resolve(params);
    const messages = await getMessages();
    const isRTL = locale === "ar";

    return (
        <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
            <body className={isRTL ? "font-arabic" : ""}>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <Navbar locale={locale} />
                        <CartDrawer locale={locale} />
                        <main className="min-h-screen">{children}</main>
                        <Footer locale={locale} />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
