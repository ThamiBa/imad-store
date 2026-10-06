import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const ADMIN_EMAIL = "admin@imad-store.ma";
const ADMIN_PASSWORD = "Admin123456!";

/** Ensures the admin user exists with a valid bcrypt hash. Safe to call on every boot. */
async function ensureAdminExists(): Promise<void> {
    try {
        const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

        if (!admin) {
            console.log("⚙️  No admin found — seeding default admin...");
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await prisma.user.create({
                data: {
                    email: ADMIN_EMAIL,
                    passwordHash,
                    firstName: "System",
                    lastName: "Admin",
                    role: "ADMIN",
                },
            });
            console.log(`✅ Admin seeded: ${ADMIN_EMAIL}`);
            return;
        }

        // Admin exists — verify the bcrypt hash is correct
        let hashValid = false;
        try {
            if (admin.passwordHash) {
                hashValid = await bcrypt.compare(ADMIN_PASSWORD, admin.passwordHash);
            }
        } catch {
            hashValid = false;
        }

        if (!hashValid) {
            console.log(`⚙️  Admin hash invalid for ${admin.email} — resetting password...`);
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await prisma.user.update({
                where: { id: admin.id },
                data: { passwordHash, email: ADMIN_EMAIL },
            });
            console.log(`✅ Admin password reset: ${ADMIN_EMAIL}`);
        } else {
            console.log(`✅ Admin account OK: ${admin.email}`);
        }
    } catch (err) {
        console.error("⚠️  ensureAdminExists failed (non-fatal):", err);
    }
}

/** Ensures at least one category + product exist so checkout never fails on empty DB. */
async function ensureSampleProducts(): Promise<void> {
    try {
        const productCount = await prisma.product.count();
        if (productCount > 0) {
            console.log(`✅ Products OK: ${productCount} product(s) in DB.`);
            return;
        }

        console.log("⚙️  No products found — seeding sample catalogue...");

        const category = await prisma.category.upsert({
            where: { slug: "robes" },
            update: {},
            create: {
                slug: "robes",
                nameFr: "Robes",
                nameAr: "فساتين",
                nameEn: "Dresses",
                image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            },
        });

        const product = await prisma.product.create({
            data: {
                slug: "robe-elegante-sample",
                nameFr: "Robe Élégante",
                nameAr: "فستان أنيق",
                nameEn: "Elegant Dress",
                descriptionFr: "Une robe élégante pour toutes les occasions.",
                descriptionAr: "فستان أنيق لجميع المناسبات.",
                descriptionEn: "An elegant dress for all occasions.",
                price: 299,
                compareAtPrice: 399,
                images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
                status: "ACTIVE",
                categoryId: category.id,
            },
        });

        await prisma.productVariant.create({
            data: {
                productId: product.id,
                color: "#000000",
                colorNameFr: "Noir",
                colorNameAr: "أسود",
                colorNameEn: "Black",
                size: "M",
                stock: 100,
                sku: `${product.id}-BLK-M`,
            },
        });

        console.log(`✅ Sample product seeded: ${product.slug}`);
    } catch (err) {
        console.error("⚠️  ensureSampleProducts failed (non-fatal):", err);
    }
}

/** Ensures store settings exist */
async function ensureStoreSettings(): Promise<void> {
    try {
        await prisma.storeSettings.upsert({
            where: { id: "settings" },
            update: {},
            create: {
                id: "settings",
                whatsappPhone: "212660560522",
                shippingCost: 30,
                freeShippingMin: 500,
                codEnabled: true,
            },
        });
        console.log("✅ Store settings OK.");
    } catch (err) {
        console.error("⚠️  ensureStoreSettings failed (non-fatal):", err);
    }
}

/** Master seed function — runs on every boot. Fully idempotent. */
export async function ensureProductionData(): Promise<void> {
    console.log("🌱 Running production data checks...");
    await ensureAdminExists();
    await ensureSampleProducts();
    await ensureStoreSettings();
    console.log("🌱 Production data checks complete.");
}

// Keep the old export name so nothing breaks
export { ensureAdminExists };
