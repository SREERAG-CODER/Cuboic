import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    const restaurant = await prisma.restaurant.findFirst({
        where: { name: 'Dakshin Delights' },
        include: { tables: true }
    });
    if (!restaurant) return;
    
    const links = restaurant.tables.map(t => ({
        table: t.table_number,
        prod: `https://cuboic.vercel.app/?r=${restaurant.id}&t=${t.id}`,
        local: `http://localhost:5173/?r=${restaurant.id}&t=${t.id}`
    }));
    
    fs.writeFileSync('links_clean.json', JSON.stringify(links, null, 2));
}

main().finally(() => prisma.$disconnect());
