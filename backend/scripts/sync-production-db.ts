import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@imad-store.ma";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin123456!";

const REAL_CATEGORIES = [
    { slug: "bags",        nameAr: "الحقائب",       nameFr: "Sacs",             nameEn: "Bags" },
    { slug: "abayas",      nameAr: "العبايات",      nameFr: "Abayas",           nameEn: "Abayas" },
    { slug: "shawls",      nameAr: "شيلان",         nameFr: "Châles",           nameEn: "Shawls" },
    { slug: "womens-shoes",nameAr: "أحذية نسائية",  nameFr: "Chaussures Femme", nameEn: "Women's Shoes" },
    { slug: "mens-clogs",  nameAr: "صابو رجالي",    nameFr: "Sabots Homme",     nameEn: "Men's Clogs" },
];

const PLACEHOLDER = "https://placehold.co/600x600/e2e8f0/1e293b?text=No+Image";

async function main() {
    console.log("🚀 Starting full production sync...");
    console.log(`   ADMIN_EMAIL    = ${ADMIN_EMAIL}`);
    console.log(`   ADMIN_PASSWORD = ${"*".repeat(ADMIN_PASSWORD.length)}`);

    // ── 1. Admin credential reset using env vars ──────────────────────────────
    console.log("\n🔐 Resetting admin credentials from env...");
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
        where:  { email: ADMIN_EMAIL },
        update: { passwordHash, role: "ADMIN" },
        create: {
            email: ADMIN_EMAIL,
            passwordHash,
            firstName: "Admin",
            lastName: "User",
            role: "ADMIN",
        },
    });
    console.log(`✅ Admin upserted: ${ADMIN_EMAIL}`);

    // ── 2. Delete legacy "robes" category (migrate products first) ────────────
    const legacySlugs = ["robes", "pajamas", "pyjamas", "shailan", "shoes-women", "shoes-men"];
    for (const slug of legacySlugs) {
        const cat = await prisma.category.findUnique({ where: { slug }, include: { products: true } });
        if (!cat) continue;
        // Migrate its products to bags before deleting
        const bags = await prisma.category.findUnique({ where: { slug: "bags" } });
        if (bags && cat.products.length > 0) {
            await prisma.product.updateMany({ where: { categoryId: cat.id }, data: { categoryId: bags.id } });
            console.log(`📦 Migrated ${cat.products.length} product(s) from '${slug}' → 'bags'`);
        }
        await prisma.category.delete({ where: { id: cat.id } });
        console.log(`🗑️  Deleted legacy category: ${slug}`);
    }

    // ── 3. Upsert the 5 exact categories ─────────────────────────────────────
    console.log("\n⚙️  Upserting 5 real categories...");
    const catIds: Record<string, string> = {};
    for (const cat of REAL_CATEGORIES) {
        const record = await prisma.category.upsert({
            where:  { slug: cat.slug },
            update: { nameAr: cat.nameAr, nameFr: cat.nameFr, nameEn: cat.nameEn },
            create: { slug: cat.slug, nameFr: cat.nameFr, nameAr: cat.nameAr, nameEn: cat.nameEn, image: PLACEHOLDER },
        });
        catIds[cat.slug] = record.id;
        console.log(`  ✅ ${cat.nameAr} (${cat.slug}) — id: ${record.id}`);
    }

    // ── 4. Seed one demo product per category so chart shows all bars ─────────
    console.log("\n⚙️  Ensuring one sample product per category...");
    for (const cat of REAL_CATEGORIES) {
        const catId = catIds[cat.slug];
        const existing = await prisma.product.findFirst({ where: { categoryId: catId } });
        if (existing) {
            console.log(`  ⏭️  ${cat.nameAr} already has a product (${existing.slug}), skipping.`);
            continue;
        }
        const slug = `demo-${cat.slug}`;
        const product = await prisma.product.create({
            data: {
                slug,
                nameFr:         `${cat.nameEn} Sample`,
                nameAr:         `${cat.nameAr} - عينة`,
                nameEn:         `${cat.nameEn} Sample`,
                descriptionFr:  `Produit de démonstration — ${cat.nameFr}`,
                descriptionAr:  `منتج تجريبي — ${cat.nameAr}`,
                descriptionEn:  `Demo product — ${cat.nameEn}`,
                price:           199,
                compareAtPrice:  299,
                images:          [PLACEHOLDER],
                status:         "ACTIVE",
                categoryId:     catId,
            },
        });
        await prisma.productVariant.create({
            data: {
                productId:    product.id,
                color:        "#1A1A2E",
                colorNameFr:  "Standard",
                colorNameAr:  "قياسي",
                colorNameEn:  "Standard",
                size:         "Standard",
                stock:        50,
                sku:          `${slug}-STD`,
            },
        });
        console.log(`  ✅ Seeded demo product for ${cat.nameAr}: ${slug}`);
    }

    // ── 5. Fix products missing placeholder images ────────────────────────────
    console.log("\n⚙️  Fixing products with missing images...");
    const allProducts = await prisma.product.findMany();
    let fixedImages = 0;
    for (const p of allProducts) {
        const needsFix = !p.images || p.images.length === 0 ||
            p.images.every(img => !img || img.includes("cloudinary.com/demo"));
        if (needsFix) {
            await prisma.product.update({ where: { id: p.id }, data: { images: [PLACEHOLDER] } });
            fixedImages++;
        }
    }
    console.log(`✅ Fixed images for ${fixedImages} product(s).`);

    // ── 6. Ensure store settings ──────────────────────────────────────────────
    await prisma.storeSettings.upsert({
        where:  { id: "settings" },
        update: {},
        create: { id: "settings", whatsappPhone: "212660560522", shippingCost: 30, freeShippingMin: 500, codEnabled: true },
    });
    console.log("\n✅ Store settings OK.");

    console.log("\n🎉 Full production sync completed successfully!");
}

main()
    .catch(e => { console.error("❌ Sync failed:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());
