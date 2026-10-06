import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = "admin@imad-store.ma";
    const password = "Admin123456!";
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Deleting existing admin records for ${email} to prevent null field errors...`);
    // Delete any existing broken user with this email to avoid P2032 schema mismatch errors
    await prisma.user.deleteMany({
        where: { email },
    });

    console.log(`Seeding Admin: ${email}`);
    await prisma.user.create({
        data: {
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
