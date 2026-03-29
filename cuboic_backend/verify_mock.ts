import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const res = await prisma.restaurant.findUnique({
        where: { id: 'clrzmockrest000000test000' },
        include: { tables: true, categories: { include: { menuItems: true } } }
    });
    console.log(JSON.stringify(res, null, 2));
}
main().finally(() => prisma.$disconnect());
