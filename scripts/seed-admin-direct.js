const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

async function main() {
    console.log("Connecting to database directly with mongodb driver...");
    
    let uri = process.env.DATABASE_URL;
    if (!uri) {
        console.error("No DATABASE_URL found in backend/.env");
        process.exit(1);
    }

    const client = new MongoClient(uri, {
        tls: true,
        retryWrites: true,
        serverSelectionTimeoutMS: 5000,
    });

    try {
        await client.connect();
        console.log("Connected successfully!");
        
        const db = client.db();
        const users = db.collection("users"); // from Prisma schema @@map("users")
        
        const admin = await users.findOne({ role: "ADMIN" });
        if (admin) {
            console.log(`✅ Admin exists! Email: ${admin.email}`);
            // Note: password hash cannot be reversed, but we know it exists.
        } else {
            console.log("⚠️ No Admin found. Creating default admin...");
            
            const email = "admin@quickydev.com";
            const password = "AdminPassword123!";
            const passwordHash = await bcrypt.hash(password, 10);
            
            await users.insertOne({
                email,
                passwordHash,
                firstName: "System",
                lastName: "Admin",
                role: "ADMIN",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log(`✅ Default admin created successfully!`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }
    } catch (e) {
        console.error("❌ Direct connection error:", e);
    } finally {
        await client.close();
    }
}

main();
