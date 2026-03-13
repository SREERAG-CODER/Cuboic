const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findFirst();
  const table = await prisma.table.findFirst();

  if (!restaurant || !table) return console.log('No restaurant/table found for test.');

  const oldDate = new Date(Date.now() - 9 * 60 * 60 * 1000); // 9 hours old

  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: table.id,
      customer_session_id: 'test_session',
      items: [],
      subtotal: 10,
      tax: 1,
      total: 11,
      status: 'Pending',
      createdAt: oldDate,
      payment: {
        create: {
          amount: 11,
          method: 'Gateway',
          status: 'Paid',
          transaction_id: 'test_txn'
        }
      }
    }
  });

  console.log('Created old order:', order.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
