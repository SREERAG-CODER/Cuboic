import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const NEW_ID = 'cmmg60qir0000c2lwao9t1z9m';

async function main() {
    console.log('🔗 Connecting to DB...');

    // Get all restaurants except the new one
    const restaurants = await prisma.restaurant.findMany({
        where: { id: { not: NEW_ID } }
    });

    if (restaurants.length === 0) {
        console.log(`✅ No old restaurant to migrate. Everything is already on ${NEW_ID}.`);
        return;
    }

    const oldRestaurant = restaurants[0];
    const oldId = oldRestaurant.id;
    console.log(`Found old restaurant ID: ${oldId}. Migrating to ${NEW_ID}...`);

    const existingNew = await prisma.restaurant.findUnique({ where: { id: NEW_ID } });
    if (!existingNew) {
        console.log(`Creating new restaurant with ID: ${NEW_ID}...`);
        await prisma.restaurant.create({
            data: {
                id: NEW_ID,
                name: oldRestaurant.name,
                description: oldRestaurant.description,
                logo_url: oldRestaurant.logo_url,
                is_active: oldRestaurant.is_active,
                createdAt: oldRestaurant.createdAt,
            }
        });
    }

    // Update relations
    console.log('Updating relations...');
    await prisma.table.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.category.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.menuItem.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.user.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.robot.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.order.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.delivery.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.platformFee.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });

    console.log(`Deleting old restaurant (${oldId})...`);
    await prisma.restaurant.delete({ where: { id: oldId } });

    console.log('✅ Migration complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
