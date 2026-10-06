import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const ADMIN_EMAIL = "admin@imad-store.ma";
const ADMIN_PASSWORD = "Admin123456!";

/**
 * Runs on every server startup.
 * - If no admin exists → creates one with the correct password hash.
 * - If an admin exists but has a broken/null hash → resets it.
 * - If the admin exists with a valid hash → skips silently.
 */
export async function ensureAdminExists(): Promise<void> {
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

        // Admin exists — verify the hash is valid and matches the known password
        let hashValid = false;
        try {
            if (admin.passwordHash) {
                hashValid = await bcrypt.compare(ADMIN_PASSWORD, admin.passwordHash);
            }
        } catch {
            hashValid = false;
        }

        if (!hashValid) {
            console.log("⚙️  Admin password hash is invalid — resetting...");
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await prisma.user.update({
                where: { id: admin.id },
                data: { passwordHash, email: ADMIN_EMAIL },
            });
            console.log(`✅ Admin password reset for: ${admin.email}`);
        } else {
            console.log(`✅ Admin account verified: ${admin.email}`);
        }
    } catch (err) {
        console.error("⚠️  ensureAdminExists failed (non-fatal):", err);
    }
}
