import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const restaurant = await prisma.restaurant.findFirst({
        where: { name: 'Dakshin Delights' },
        include: { tables: true }
    });

    if (!restaurant) { 
        console.log('Restaurant not found'); 
        return; 
    }

    console.log(`\n\n=== LINKS FOR ${restaurant.name} ===`);
    console.log(`Restaurant ID: ${restaurant.id}\n`);
    
    for (const table of restaurant.tables) {
        console.log(`[${table.table_number}]`);
        console.log(`Production: https://cuboic.vercel.app/?r=${restaurant.id}&t=${table.id}`);
        console.log(`Localhost:  http://localhost:5173/?r=${restaurant.id}&t=${table.id}\n`);
    }
}

main().finally(() => prisma.$disconnect());
