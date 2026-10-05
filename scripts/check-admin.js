const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const prisma = new PrismaClient();

async function main() {
    console.log("Connecting to database...");
    
    // Check if an admin exists
    const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    });

    if (admin) {
        console.log(`✅ Admin exists! Email: ${admin.email}`);
    } else {
        console.log("⚠️ No Admin found. Creating default admin...");
        
        const email = "admin@quickydev.com";
        const password = "AdminPassword123!";
        const passwordHash = await bcrypt.hash(password, 10);
        
        const newAdmin = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName: "System",
                lastName: "Admin",
                role: "ADMIN"
            }
        });
        
        console.log(`✅ Default admin created successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    }
}

main()
    .catch((e) => {
        console.error("❌ Error checking admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
