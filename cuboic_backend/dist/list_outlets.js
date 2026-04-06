"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const outlets = await prisma.outlet.findMany({
        include: { restaurant: true }
    });
    console.log('--- Outlets ---');
    outlets.forEach(o => {
        console.log(`Name: ${o.name}`);
        console.log(`Outlet ID: ${o.id}`);
        console.log(`Restaurant: ${o.restaurant.name} (${o.restaurant.id})`);
        console.log('----------------');
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=list_outlets.js.map