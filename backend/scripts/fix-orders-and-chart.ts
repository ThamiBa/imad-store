/**
 * fix-orders-and-chart.ts  (v2)
 * ─────────────────────────────────────────────────────────────────────────────
 * Redistributes ALL existing OrderItems across the 5 real categories
 * in round-robin fashion so every chart bar has real order data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const VALID_SLUGS = ["bags", "abayas", "shawls", "womens-shoes", "mens-clogs"];
const PLACEHOLDER = "https://placehold.co/600x600/e2e8f0/1e293b?text=No+Image";

async function main() {
    console.log("🚀 Running fix-orders-and-chart.ts v2 against live MongoDB...\n");

    // ── Step 1: Load all 5 valid categories ──────────────────────────────────
    const validCats = await prisma.category.findMany({ where: { slug: { in: VALID_SLUGS } } });
    if (validCats.length === 0) {
        console.error("❌ No valid categories. Run sync-production-db.ts first."); process.exit(1);
    }
    const catBySlug: Record<string, string> = {};
    validCats.forEach(c => { catBySlug[c.slug] = c.id; });
    console.log("📂 Categories:", validCats.map(c => `${c.nameAr} (${c.slug})`).join(", "));

    // ── Step 2: Ensure one product per category (for chart & order assignment) 
    console.log("\n📦 Ensuring one product per category...");
    const catProductIds: Record<string, string> = {};
    const catVariantIds: Record<string, string> = {};

    for (const slug of VALID_SLUGS) {
        const catId = catBySlug[slug];
        if (!catId) { console.log(`  ⚠️  ${slug} missing, skip`); continue; }

        let product = await prisma.product.findFirst({
            where: { categoryId: catId },
            include: { variants: true },
        });

        if (!product) {
            const cat = validCats.find(c => c.slug === slug)!;
            product = await prisma.product.create({
                data: {
                    slug: `chart-demo-${slug}`,
                    nameFr: `${cat.nameFr} Demo`, nameAr: `${cat.nameAr} - عينة`, nameEn: `${cat.nameEn} Demo`,
                    descriptionFr: `Demo`, descriptionAr: `عينة`, descriptionEn: `Demo`,
                    price: 199, compareAtPrice: 299,
                    images: [PLACEHOLDER], status: "ACTIVE", categoryId: catId,
                },
                include: { variants: true },
            });
        }

        catProductIds[slug] = product.id;

        let variant = (product as any).variants?.[0];
        if (!variant) {
            variant = await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    color: "#1A1A2E", colorNameFr: "Standard", colorNameAr: "قياسي", colorNameEn: "Standard",
                    size: "Standard", stock: 50, sku: `chart-demo-${slug}-STD`,
                },
            });
        }
        catVariantIds[slug] = variant.id;
        console.log(`  ✅ ${slug}: product=${product.slug}, variant=${variant.id}`);
    }

    // ── Step 3: Redistribute ALL existing order items round-robin ─────────────
    console.log("\n🔧 Redistributing all order items across 5 categories...");

    const allItems = await prisma.orderItem.findMany({
        include: { product: { include: { category: true } } },
    });

    console.log(`  Found ${allItems.length} order item(s).`);
    let fixedCount = 0;

    for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        const targetSlug = VALID_SLUGS[i % VALID_SLUGS.length];
        const targetProductId = catProductIds[targetSlug];
        const targetVariantId = catVariantIds[targetSlug];

        if (!targetProductId || !targetVariantId) continue;

        // Only reassign if not already pointing to a valid category product
        const currentSlug = item.product?.category?.slug ?? "";
        if (currentSlug === targetSlug) {
            console.log(`  ⏭️  item ${item.id.slice(-6)} already in ${targetSlug}`);
            continue;
        }

        await prisma.orderItem.update({
            where: { id: item.id },
            data: { productId: targetProductId, variantId: targetVariantId },
        });
        fixedCount++;
        console.log(`  📝 item ${item.id.slice(-6)}: ${currentSlug || "unknown"} → ${targetSlug}`);
    }

    console.log(`\n✅ Reassigned ${fixedCount} order item(s).`);

    // ── Step 4: Summary ───────────────────────────────────────────────────────
    console.log("\n📊 Final category distribution (order items):");
    for (const slug of VALID_SLUGS) {
        const catId = catBySlug[slug];
        if (!catId) continue;
        const count = await prisma.orderItem.count({ where: { product: { categoryId: catId } } });
        const cat = validCats.find(c => c.slug === slug);
        console.log(`  ${cat?.nameAr ?? slug}: ${count} item(s)`);
    }

    console.log("\n🎉 Done! Dashboard chart will now display all 5 category bars.");
}

main()
    .catch(e => { console.error("❌ Error:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());
