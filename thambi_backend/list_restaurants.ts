import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const restaurants = await prisma.restaurant.findMany();
  console.log('--- Restaurants ---');
  restaurants.forEach(r => {
    console.log(`Name: ${r.name}`);
    console.log(`ID: ${r.id}`);
    console.log('----------------');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
