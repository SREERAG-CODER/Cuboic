const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.table.findMany({
    include: { restaurant: true }
  });
  fs.writeFileSync('tables.json', JSON.stringify(tables, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
