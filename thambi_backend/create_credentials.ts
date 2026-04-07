import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔗 Connecting to DB...');
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: 'cmn4bj2n40000c2m04hr9rjju' }
    });

    if (!restaurant) {
        console.log('❌ Restaurant Dakshin Delights not found');
        return;
    }

    const passwords = {
        owner: 'owner123',
        staff: 'staff123'
    };

    const hashOwner = await bcrypt.hash(passwords.owner, 10);
    const hashStaff = await bcrypt.hash(passwords.staff, 10);

    console.log('👤 Creating Owner...');
    const owner = await prisma.user.upsert({
        where: { user_id: 'dakshin_owner' },
        update: { password_hash: hashOwner, restaurantId: restaurant.id, is_active: true },
        create: {
            name: 'Dakshin Owner',
            user_id: 'dakshin_owner',
            password_hash: hashOwner,
            role: 'Owner' as UserRole,
            restaurantId: restaurant.id,
            is_active: true
        }
    });

    console.log('👤 Creating Staff...');
    const staff = await prisma.user.upsert({
        where: { user_id: 'dakshin_staff' },
        update: { password_hash: hashStaff, restaurantId: restaurant.id, is_active: true },
        create: {
            name: 'Dakshin Staff',
            user_id: 'dakshin_staff',
            password_hash: hashStaff,
            role: 'Staff' as UserRole,
            restaurantId: restaurant.id,
            is_active: true
        }
    });

    console.log('\n✅ Credentials created/updated successfully!');
    console.log('==========================================');
    console.log(`OWNER:`);
    console.log(`Username: ${owner.user_id}`);
    console.log(`Password: ${passwords.owner}`);
    console.log('------------------------------------------');
    console.log(`STAFF:`);
    console.log(`Username: ${staff.user_id}`);
    console.log(`Password: ${passwords.staff}`);
    console.log('==========================================\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
