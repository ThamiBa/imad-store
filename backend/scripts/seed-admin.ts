import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

import { ensureProductionData } from "../src/lib/seedAdmin";

async function main() {
    await ensureProductionData();
}

main()
    .catch((e) => {
        console.error("Error seeding admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
