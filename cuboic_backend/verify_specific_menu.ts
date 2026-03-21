import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const RESTAURANT_ID = 'cmmg60qir0000c2lwao9t1z9m';

async function verifyMenu() {
    console.log('🔗 Connecting to DB...');
    
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: RESTAURANT_ID },
        include: {
            categories: {
                include: { menuItems: true }
            }
        }
    });

    if (!restaurant) {
        console.error('❌ Restaurant not found!');
        process.exit(1);
    }

    const tables = await prisma.table.findMany({
        where: { restaurantId: RESTAURANT_ID }
    });

    console.log(`\n📍 Restaurant: ${restaurant.name} (${restaurant.id})`);
    
    console.log(`\n🪑 Tables (${tables.length}):`);
    tables.forEach(table => {
        console.log(`  - ${table.table_number}: ${table.id}`);
    });

    console.log(`\n🍔 Categories & Items:`);
    let totalItems = 0;
    restaurant.categories.forEach(cat => {
        console.log(`\n  📂 [${cat.name}] (${cat.menuItems.length} items)`);
        cat.menuItems.forEach(item => {
            console.log(`    - ${item.name}: ₹${item.price}`);
            totalItems++;
        });
    });

    console.log(`\n✅ Total Items: ${totalItems}`);
}

verifyMenu()
    .catch(e => {
        console.error('❌ Error verifying:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
