import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const restaurantId = 'cmmg60qir0000c2lwao9t1z9m'; // Food Guru
  
  // 1. Ensure the exact Outlet ID exists
  const targetOutletId = 'outlet-9t1z9m';
  const outlet = await prisma.outlet.upsert({
    where: { id: targetOutletId },
    update: { name: 'Food Guru Main Terminal' },
    create: {
      id: targetOutletId,
      name: 'Food Guru Main Terminal',
      restaurantId: restaurantId,
      is_active: true
    }
  });

  // 2. Fix owner01 password and association
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { user_id: 'owner01' },
    update: { 
      password_hash: hashedPassword, 
      restaurantId: restaurantId,
      outletId: targetOutletId 
    },
    create: {
      user_id: 'owner01',
      name: 'Food Guru Owner',
      password_hash: hashedPassword,
      role: 'Owner',
      restaurantId: restaurantId,
      outletId: targetOutletId,
      is_active: true
    }
  });

  console.log('✅ Credentials & Outlet ID fixed!');
  console.log(`Outlet ID: ${targetOutletId}`);
  console.log(`Username: owner01`);
  console.log(`Password: password123`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
