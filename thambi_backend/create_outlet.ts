import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const restaurantId = 'cmn4bj2n40000c2m04hr9rjju'; // Andhra Ruchulu / Dakshin Delights
  
  const outlet = await prisma.outlet.upsert({
    where: { id: 'main-outlet-001' },
    update: {},
    create: {
      id: 'main-outlet-001',
      name: 'Main Terminal Outlet',
      restaurantId: restaurantId,
      is_active: true
    }
  });

  // Also ensure the users have this outletId assigned
  await prisma.user.updateMany({
    where: { restaurantId: restaurantId },
    data: { outletId: outlet.id }
  });

  console.log('✅ Outlet created and users updated!');
  console.log('Outlet ID:', outlet.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
