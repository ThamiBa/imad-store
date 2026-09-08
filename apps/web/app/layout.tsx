import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
    title: "IMAD Mode — أناقة محتشمة فاخرة",
    description: "مجموعة حصرية من الحجاب والنقاب والعبايات الفاخرة. أناقة محتشمة فاخرة.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="font-arabic">
                <Providers>
                    <Navbar />
                    <CartDrawer />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}