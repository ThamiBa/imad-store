const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@imadmode.com';
    const plainPassword = 'YourStrongPassword123';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        console.log('User found, updating password...');
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        });
        console.log('Password updated');
    } else {
        console.log('User not found, creating...');
        user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName: 'Admin',
                lastName: 'Imad',
                role: 'ADMIN'
            }
        });
        console.log('User created:', user.email);
    }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());