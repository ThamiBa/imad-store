import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Imad Store (MongoDB)...");

    // ─── Store Settings ───────────────────────────────────────────────────────
    await prisma.storeSettings.upsert({
        where: { id: "settings" },
        update: {},
        create: {
            id: "settings",
            whatsappPhone: "212600000000",
            shippingCost: 30,
            freeShippingMin: 500,
            codEnabled: true,
            stripeEnabled: true,
        },
    });
    console.log("✅ Store settings seeded");

    // ─── Admin User ──────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash("Admin123!", 10);
    await prisma.user.upsert({
        where: { email: "admin@imad-store.ma" },
        update: {},
        create: {
            email: "admin@imad-store.ma",
            passwordHash: adminHash,
            firstName: "Admin",
            lastName: "Imad",
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user seeded → admin@imad-store.ma / Admin123!");

    // ─── Categories ──────────────────────────────────────────────────────────
    const hijab = await prisma.category.upsert({
        where: { slug: "hijab" },
        update: {},
        create: { slug: "hijab", nameFr: "Hijab", nameAr: "حجاب", nameEn: "Hijab" },
    });
    const niqab = await prisma.category.upsert({
        where: { slug: "niqab" },
        update: {},
        create: { slug: "niqab", nameFr: "Niqab", nameAr: "نقاب", nameEn: "Niqab" },
    });
    const abaya = await prisma.category.upsert({
        where: { slug: "abaya" },
        update: {},
        create: { slug: "abaya", nameFr: "Abaya", nameAr: "عباءة", nameEn: "Abaya" },
    });
    await prisma.category.upsert({
        where: { slug: "accessoires" },
        update: {},
        create: { slug: "accessoires", nameFr: "Accessoires", nameAr: "إكسسوارات", nameEn: "Accessories" },
    });
    console.log("✅ 4 categories seeded");

    // ─── Sample Products ─────────────────────────────────────────────────────
    const products = [
        {
            slug: "hijab-soie-noir",
            nameFr: "Hijab en Soie — Noir",
            nameAr: "حجاب حرير — أسود",
            nameEn: "Silk Hijab — Black",
            descriptionFr: "Un hijab en soie naturelle d'une douceur incomparable. Coupe élégante, tombé parfait.",
            descriptionAr: "حجاب من الحرير الطبيعي بنعومة لا مثيل لها. قطع أنيقة بسقوط مثالي.",
            descriptionEn: "A natural silk hijab with unmatched softness. Elegant cut, perfect drape.",
            price: 249,
            categoryId: hijab.id,
            images: ["https://placehold.co/600x400?text=Hijab+Soie+Noir"],
            variants: [
                { color: "#000000", colorNameFr: "Noir", colorNameAr: "أسود", colorNameEn: "Black", stock: 50, sku: "HIJ-SOI-BLK-OS" },
                { color: "#F5F5DC", colorNameFr: "Beige", colorNameAr: "بيج", colorNameEn: "Beige", stock: 30, sku: "HIJ-SOI-BEI-OS" },
            ],
        },
        {
            slug: "abaya-dubai-luxe",
            nameFr: "Abaya Dubaï Luxe",
            nameAr: "عباءة دبي الفاخرة",
            nameEn: "Dubai Luxury Abaya",
            descriptionFr: "Abaya inspirée des créations de Dubaï, avec broderies dorées subtiles.",
            descriptionAr: "عباءة مستوحاة من تصاميم دبي مع تطريز ذهبي رفيع.",
            descriptionEn: "Abaya inspired by Dubai designs with subtle gold embroidery.",
            price: 699,
            compareAtPrice: 899,
            categoryId: abaya.id,
            images: ["https://placehold.co/600x400?text=Abaya+Dubai"],
            variants: [
                { color: "#000000", colorNameFr: "Noir", colorNameAr: "أسود", colorNameEn: "Black", size: "S", stock: 10, sku: "ABA-DUB-BLK-S" },
                { color: "#000000", colorNameFr: "Noir", colorNameAr: "أسود", colorNameEn: "Black", size: "M", stock: 15, sku: "ABA-DUB-BLK-M" },
                { color: "#000000", colorNameFr: "Noir", colorNameAr: "أسود", colorNameEn: "Black", size: "L", stock: 10, sku: "ABA-DUB-BLK-L" },
            ],
        },
        {
            slug: "niqab-premium-jersey",
            nameFr: "Niqab Premium Jersey",
            nameAr: "نقاب جيرسي الفاخر",
            nameEn: "Premium Jersey Niqab",
            descriptionFr: "Niqab en jersey premium, léger et respirant, maintien parfait toute la journée.",
            descriptionAr: "نقاب جيرسي فاخر خفيف وقابل للتنفس مع ثبات مثالي طوال اليوم.",
            descriptionEn: "Premium jersey niqab, light and breathable, perfect hold all day.",
            price: 129,
            categoryId: niqab.id,
            images: ["https://placehold.co/600x400?text=Niqab+Jersey"],
            variants: [
                { color: "#000000", colorNameFr: "Noir", colorNameAr: "أسود", colorNameEn: "Black", stock: 100, sku: "NIQ-JER-BLK-OS" },
                { color: "#8B4513", colorNameFr: "Marron", colorNameAr: "بني", colorNameEn: "Brown", stock: 40, sku: "NIQ-JER-BRN-OS" },
            ],
        },
    ];

    for (const { variants, ...productData } of products) {
        const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
        if (!existing) {
            await prisma.product.create({
                data: { ...productData, status: "ACTIVE", variants: { create: variants } },
            });
        }
    }
    console.log("✅ 3 sample products seeded");
    console.log("\n🎉 Seed complete!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
