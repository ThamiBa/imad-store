import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
    let client: MongoClient | null = null;
    
    try {
        const uri = process.env.DATABASE_URL;
        if (!uri) {
            return NextResponse.json({ error: "No DATABASE_URL found in environment variables." }, { status: 500 });
        }

        client = new MongoClient(uri, {
            tls: true,
            retryWrites: true,
        });

        await client.connect();
        const db = client.db();
        const users = db.collection("users");

        const admin = await users.findOne({ role: "ADMIN" });
        if (admin) {
            return NextResponse.json({ 
                success: true, 
                message: "Admin already exists", 
                email: admin.email 
            });
        }

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

        return NextResponse.json({ 
            success: true, 
            message: "Default admin created successfully!", 
            credentials: { email, password }
        });

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
