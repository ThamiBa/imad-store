import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL || "admin@imad-store.ma";
    const password = process.env.ADMIN_PASSWORD || "Admin123456!";
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Seeding Admin: ${email}`);

    await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            role: "ADMIN",
        },
        create: {
            email,
            passwordHash,
            firstName: "System",
            lastName: "Admin",
            role: "ADMIN",
        },
    });

    console.log("Admin seeded successfully!");
}

main()
    .catch((e) => {
        console.error("Error seeding admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
