import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const REAL_CATEGORIES = [
    { slug: "bags", nameAr: "الحقائب", nameFr: "Sacs", nameEn: "Bags" },
    { slug: "abayas", nameAr: "العبايات", nameFr: "Abayas", nameEn: "Abayas" },
    { slug: "shawls", nameAr: "شيلان", nameFr: "Châles", nameEn: "Shawls" },
    { slug: "womens-shoes", nameAr: "أحذية نسائية", nameFr: "Chaussures Femme", nameEn: "Women's Shoes" },
    { slug: "pajamas", nameAr: "بيجامات", nameFr: "Pyjamas", nameEn: "Pajamas" },
    { slug: "mens-clogs", nameAr: "سابو رجالي", nameFr: "Sabots Homme", nameEn: "Men's Clogs" }
];

async function main() {
    console.log("🚀 Starting database synchronization script...");
    
    // 1. Upsert real categories
    console.log("⚙️  Upserting 6 real categories...");
    let bagsCategoryId: string | null = null;
    for (const cat of REAL_CATEGORIES) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                slug: cat.slug,
                nameFr: cat.nameFr,
                nameAr: cat.nameAr,
                nameEn: cat.nameEn,
                image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            },
        });
        if (cat.slug === "bags") {
            bagsCategoryId = created.id;
        }
    }
    console.log("✅ Categories upserted successfully.");

    // 2. Migrate and delete "robes"
    console.log("⚙️  Checking for legacy 'robes' category...");
    const robesCategory = await prisma.category.findUnique({
        where: { slug: "robes" },
        include: { products: true }
    });

    if (robesCategory) {
        if (robesCategory.products.length > 0 && bagsCategoryId) {
            console.log(`📦 Found ${robesCategory.products.length} product(s) linked to 'robes'. Migrating to 'bags'...`);
            await prisma.product.updateMany({
                where: { categoryId: robesCategory.id },
                data: { categoryId: bagsCategoryId }
            });
            console.log("✅ Products migrated successfully.");
        }
        
        console.log("🗑️  Deleting 'robes' category...");
        await prisma.category.delete({ where: { id: robesCategory.id } });
        console.log("✅ 'robes' category deleted.");
    } else {
        console.log("✅ 'robes' category not found. Nothing to delete.");
    }

    // 3. Fix Missing Order/Product Images
    console.log("⚙️  Checking for products with missing images...");
    const allProducts = await prisma.product.findMany();
    let updatedCount = 0;
    
    for (const product of allProducts) {
        if (!product.images || product.images.length === 0) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"]
                }
            });
            updatedCount++;
        }
    }
    console.log(`✅ Fixed missing images for ${updatedCount} product(s).`);

    console.log("🎉 Database synchronization completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Error during synchronization:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
