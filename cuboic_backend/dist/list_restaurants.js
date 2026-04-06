"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const restaurants = await prisma.restaurant.findMany();
    console.log('--- Restaurants ---');
    restaurants.forEach(r => {
        console.log(`Name: ${r.name}`);
        console.log(`ID: ${r.id}`);
        console.log('----------------');
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=list_restaurants.js.map