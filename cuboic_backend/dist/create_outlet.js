"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const restaurantId = 'cmn4bj2n40000c2m04hr9rjju';
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
    await prisma.user.updateMany({
        where: { restaurantId: restaurantId },
        data: { outletId: outlet.id }
    });
    console.log('✅ Outlet created and users updated!');
    console.log('Outlet ID:', outlet.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=create_outlet.js.map