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
    const bags = await prisma.category.upsert({
        where: { slug: "bags" },
        update: {},
        create: { slug: "bags", nameFr: "Sacs", nameAr: "الحقائب", nameEn: "Bags" },
    });
    const abayas = await prisma.category.upsert({
        where: { slug: "abayas" },
        update: {},
        create: { slug: "abayas", nameFr: "Abayas", nameAr: "العبايات", nameEn: "Abayas" },
    });
    const shailan = await prisma.category.upsert({
        where: { slug: "shailan" },
        update: {},
        create: { slug: "shailan", nameFr: "Châles", nameAr: "شيلان", nameEn: "Shawls" },
    });
    const shoesWomen = await prisma.category.upsert({
        where: { slug: "shoes-women" },
        update: {},
        create: { slug: "shoes-women", nameFr: "Chaussures Femmes", nameAr: "أحذية نسائية", nameEn: "Women's Shoes" },
    });
    const pyjamas = await prisma.category.upsert({
        where: { slug: "pyjamas" },
        update: {},
        create: { slug: "pyjamas", nameFr: "Pyjamas", nameAr: "بيجامات", nameEn: "Pajamas" },
    });
    const shoesMen = await prisma.category.upsert({
        where: { slug: "shoes-men" },
        update: {},
        create: { slug: "shoes-men", nameFr: "Sabots Hommes", nameAr: "سابو رجالي", nameEn: "Men's Sabots" },
    });
    console.log("✅ 6 categories seeded");

    // ─── Delete Existing Products & Variants ──────────────────────────────────
    console.log("🧹 Clearing old orders, products and variants...");
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    // ─── Sample Products ─────────────────────────────────────────────────────
    const products = [
        {
            slug: "sac-cuir-luxe",
            nameFr: "Sac en Cuir Luxe",
            nameAr: "حقيبة جلدية فاخرة",
            nameEn: "Luxury Leather Bag",
            descriptionFr: "Un sac en cuir véritable avec des finitions dorées.",
            descriptionAr: "حقيبة من الجلد الطبيعي مع لمسات ذهبية.",
            descriptionEn: "A genuine leather bag with gold finishes.",
            price: 1200,
            categoryId: bags.id,
            images: ["https://placehold.co/600x400?text=Luxury+Bag"],
            variants: [
                { color: "#000000", colorNameFr: "Noir", colorNameAr: "أسود", colorNameEn: "Black", stock: 15, sku: "BAG-BLK" },
            ],
        },
        {
            slug: "abaya-velours",
            nameFr: "Abaya Velours Royal",
            nameAr: "عباية مخملية ملكية",
            nameEn: "Royal Velvet Abaya",
            descriptionFr: "Abaya en velours doux, parfaite pour les soirées.",
            descriptionAr: "عباية من المخمل الناعم، مثالية للسهرات.",
            descriptionEn: "Soft velvet abaya, perfect for evenings.",
            price: 850,
            compareAtPrice: 1100,
            categoryId: abayas.id,
            images: ["https://placehold.co/600x400?text=Velvet+Abaya"],
            variants: [
                { color: "#800020", colorNameFr: "Bordeaux", colorNameAr: "عنابي", colorNameEn: "Burgundy", size: "M", stock: 20, sku: "ABA-VEL-BUR-M" },
            ],
        },
        {
            slug: "chale-soie",
            nameFr: "Châle en Soie",
            nameAr: "شال حريري",
            nameEn: "Silk Shawl",
            descriptionFr: "Châle léger et élégant en soie naturelle.",
            descriptionAr: "شال خفيف وأنيق من الحرير الطبيعي.",
            descriptionEn: "Light and elegant natural silk shawl.",
            price: 350,
            categoryId: shailan.id,
            images: ["https://placehold.co/600x400?text=Silk+Shawl"],
            variants: [
                { color: "#F5F5DC", colorNameFr: "Beige", colorNameAr: "بيج", colorNameEn: "Beige", stock: 50, sku: "SHA-BEI" },
            ],
        },
        {
            slug: "talons-hauts-or",
            nameFr: "Talons Hauts Or",
            nameAr: "حذاء كعب عالي ذهبي",
            nameEn: "Gold High Heels",
            descriptionFr: "Chaussures élégantes pour femmes avec détails dorés.",
            descriptionAr: "أحذية أنيقة للنساء مع تفاصيل ذهبية.",
            descriptionEn: "Elegant women's shoes with gold details.",
            price: 590,
            categoryId: shoesWomen.id,
            images: ["https://placehold.co/600x400?text=Gold+Heels"],
            variants: [
                { color: "#FFD700", colorNameFr: "Or", colorNameAr: "ذهبي", colorNameEn: "Gold", size: "38", stock: 10, sku: "SHO-WOM-GLD-38" },
            ],
        },
        {
            slug: "pyjama-soie",
            nameFr: "Pyjama en Soie",
            nameAr: "بيجامة حريرية",
            nameEn: "Silk Pajamas",
            descriptionFr: "Ensemble pyjama confortable et luxueux.",
            descriptionAr: "طقم بيجامة مريح وفاخر.",
            descriptionEn: "Comfortable and luxurious pajama set.",
            price: 450,
            categoryId: pyjamas.id,
            images: ["https://placehold.co/600x400?text=Silk+Pajamas"],
            variants: [
                { color: "#000080", colorNameFr: "Bleu Nuit", colorNameAr: "أزرق ليلي", colorNameEn: "Navy Blue", size: "L", stock: 25, sku: "PYJ-NAV-L" },
            ],
        },
        {
            slug: "sabots-classiques",
            nameFr: "Sabots Classiques Homme",
            nameAr: "سابو رجالي كلاسيك",
            nameEn: "Classic Men's Sabots",
            descriptionFr: "Sabots traditionnels confortables pour hommes.",
            descriptionAr: "سابو تقليدي مريح للرجال.",
            descriptionEn: "Comfortable traditional men's sabots.",
            price: 320,
            categoryId: shoesMen.id,
            images: ["https://placehold.co/600x400?text=Mens+Sabots"],
            variants: [
                { color: "#8B4513", colorNameFr: "Marron", colorNameAr: "بني", colorNameEn: "Brown", size: "42", stock: 30, sku: "SHO-MEN-BRN-42" },
            ],
        },
    ];

    for (const { variants, ...productData } of products) {
        await prisma.product.create({
            data: { ...productData, status: "ACTIVE", variants: { create: variants } },
        });
    }
    console.log("✅ 6 sample products seeded");
    console.log("\n🎉 Seed complete!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
