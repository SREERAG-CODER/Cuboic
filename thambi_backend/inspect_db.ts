import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true, is_active: true }
  })
  console.log('=== RESTAURANTS ===')
  for (const r of restaurants) {
    console.log(`  [${r.id}] "${r.name}" active=${r.is_active}`)
  }

  for (const r of restaurants) {
    const tables = await prisma.table.findMany({
      where: { restaurantId: r.id },
      select: { id: true, table_number: true, is_active: true },
      orderBy: { table_number: 'asc' }
    })
    const users = await prisma.user.findMany({
      where: { restaurantId: r.id },
      select: { user_id: true, name: true, role: true, is_active: true }
    })
    console.log(`\n--- ${r.name} ---`)
    console.log(`  Tables (${tables.length}):`, tables.map(t => `${t.table_number}(active=${t.is_active})`).join(', ') || 'NONE')
    console.log(`  Users (${users.length}):`)
    for (const u of users) {
      console.log(`    user_id="${u.user_id}" name="${u.name}" role=${u.role} active=${u.is_active}`)
    }
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
