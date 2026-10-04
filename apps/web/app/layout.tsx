import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import StoreLayoutWrapper from "@/components/layout/StoreLayoutWrapper";

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
                    <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
                </Providers>
            </body>
        </html>
    );
}