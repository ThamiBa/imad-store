import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const EXACT_CATEGORIES = [
    { slug: "bags", nameAr: "الحقائب", nameFr: "Sacs", nameEn: "Bags" },
    { slug: "abayas", nameAr: "العبايات", nameFr: "Abayas", nameEn: "Abayas" },
    { slug: "shawls", nameAr: "شيلان", nameFr: "Châles", nameEn: "Shawls" },
    { slug: "womens-shoes", nameAr: "أحذية نسائية", nameFr: "Chaussures Femme", nameEn: "Women's Shoes" },
    { slug: "mens-clogs", nameAr: "صابو رجالي", nameFr: "Sabots Homme", nameEn: "Men's Clogs" }
];

async function main() {
    console.log("🚀 Starting fix-admin-and-categories script...");
    
    // 1. Admin Authentication Reset
    console.log("🔐 Resetting Admin Credentials...");
    const adminEmail = "admin@imad-store.ma";
    const passwordHash = await bcrypt.hash("Admin123456!", 10);
    
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { passwordHash, role: "ADMIN" },
        create: {
            email: adminEmail,
            passwordHash,
            firstName: "Admin",
            lastName: "User",
            role: "ADMIN"
        }
    });
    console.log("✅ Admin credentials reset successfully.");

    // 2. Categories & Placeholder Images
    console.log("⚙️  Upserting 5 exact categories...");
    for (const cat of EXACT_CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { nameAr: cat.nameAr },
            create: {
                slug: cat.slug,
                nameFr: cat.nameFr,
                nameAr: cat.nameAr,
                nameEn: cat.nameEn,
                image: "https://placehold.co/600x600/e2e8f0/1e293b?text=No+Image",
            },
        });
    }
    console.log("✅ Categories upserted successfully.");

    // Fix missing images on products
    console.log("⚙️  Ensuring all products have images...");
    const products = await prisma.product.findMany();
    let updatedCount = 0;
    
    for (const product of products) {
        if (!product.images || product.images.length === 0 || product.images.some(img => img.includes("demo/image/upload/sample"))) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    images: ["https://placehold.co/600x600/e2e8f0/1e293b?text=No+Image"]
                }
            });
            updatedCount++;
        }
    }
    console.log(`✅ Set placeholder image for ${updatedCount} product(s).`);

    console.log("🎉 Script completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Error during script execution:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
