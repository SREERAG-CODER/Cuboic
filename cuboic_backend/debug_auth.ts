import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { restaurant: true }
  });
  
  console.log('--- ALL USERS ---');
  users.forEach(u => {
    console.log(`Username: ${u.user_id}`);
    console.log(`Role: ${u.role}`);
    console.log(`Restaurant: ${u.restaurant?.name || 'N/A'}`);
    console.log(`Outlet ID: ${u.outletId || 'N/A'}`);
    console.log('------------------');
  });

  const outlets = await prisma.outlet.findMany({
    include: { restaurant: true }
  });
  console.log('\n--- ALL OUTLETS ---');
  outlets.forEach(o => {
    console.log(`Outlet Name: ${o.name}`);
    console.log(`Outlet ID: ${o.id}`);
    console.log(`Restaurant Name: ${o.restaurant.name}`);
    console.log('------------------');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
