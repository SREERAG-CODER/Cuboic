"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🏗️ Starting Outlet synchronization for all restaurants...');
    const restaurants = await prisma.restaurant.findMany({
        include: { outlets: true }
    });
    for (const restaurant of restaurants) {
        if (restaurant.outlets.length === 0) {
            const outletName = `${restaurant.name} Main Outlet`;
            const outletId = `outlet-${restaurant.id.slice(-6)}`;
            const newOutlet = await prisma.outlet.create({
                data: {
                    id: outletId,
                    name: outletName,
                    restaurantId: restaurant.id,
                    is_active: true
                }
            });
            console.log(`✅ Created Outlet: "${outletName}" (ID: ${newOutlet.id}) for Restaurant: ${restaurant.name}`);
        }
        else {
            console.log(`ℹ️ Restaurant "${restaurant.name}" already has ${restaurant.outlets.length} outlet(s). Skipping.`);
        }
    }
    console.log('\nFinal Outlet List:');
    const allOutlets = await prisma.outlet.findMany({ include: { restaurant: true } });
    console.log('--------------------------------------------------');
    allOutlets.forEach(o => {
        console.log(`Restaurant: ${o.restaurant.name}`);
        console.log(`Outlet Name: ${o.name}`);
        console.log(`Outlet ID: ${o.id}`);
        console.log('--------------------------------------------------');
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=sync_outlets.js.map