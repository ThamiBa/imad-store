import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
    title: "IMAD Mode — Admin",
    description: "Admin Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ar">
            <body>{children}</body>
        </html>
    );
}
