import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const outlets = await prisma.outlet.findMany({
    where: { restaurantId: 'cmmg60qir0000c2lwao9t1z9m' },
    select: { id: true, name: true }
  })
  console.log('=== FOOD GURU OUTLETS ===')
  console.log(JSON.stringify(outlets, null, 2))
  await prisma.$disconnect()
}
main()
