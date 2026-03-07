import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const rest = await prisma.restaurant.findFirst();
    if (!rest) return;
    const tables = await prisma.table.findMany({ where: { restaurantId: rest.id } });

    const links = tables.map(t => `Table ${t.table_number}: https://cuboic.vercel.app/?r=${rest.id}&t=${t.id}`);
    fs.writeFileSync('links.json', JSON.stringify({ restaurant: rest.name, links }, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
