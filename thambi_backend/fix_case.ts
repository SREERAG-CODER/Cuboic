import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const RESTAURANT_ID = 'cmmg60qir0000c2lwao9t1z9m';

function toTitleCase(str: string) {
    if (!str) return str;
    return str.toLowerCase().replace(/(?:^|\s|-|\/|\()\w/g, function(match) {
        return match.toUpperCase();
    });
}

// Ensure AG or specific acronyms stay uppercase if needed, but for now strict Title Case is requested.
// We can manually fix 'Ag' to 'AG' if we want.
function convertName(name: string) {
    let title = toTitleCase(name);
    // Let's preserve "AG" uppercase if it's there
    title = title.replace(/\bAg\b/g, 'AG');
    return title;
}

async function fixCase() {
    console.log('🔗 Connecting to DB to fix casing...');

    const categories = await prisma.category.findMany({
        where: { restaurantId: RESTAURANT_ID }
    });

    for (const cat of categories) {
        const newName = convertName(cat.name);
        if (newName !== cat.name) {
            await prisma.category.update({
                where: { id: cat.id },
                data: { name: newName }
            });
            console.log(`Updated Category: ${cat.name} -> ${newName}`);
        }
    }

    const items = await prisma.menuItem.findMany({
        where: { restaurantId: RESTAURANT_ID }
    });

    for (const item of items) {
        const newName = convertName(item.name);
        if (newName !== item.name) {
            await prisma.menuItem.update({
                where: { id: item.id },
                data: { name: newName }
            });
            console.log(`Updated Item: ${item.name} -> ${newName}`);
        }
    }

    console.log('✅ Case fix complete!');
}

fixCase()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
