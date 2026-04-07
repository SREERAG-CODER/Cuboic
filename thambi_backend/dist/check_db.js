"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const restaurants = await prisma.restaurant.findMany({ select: { id: true, name: true } });
    console.log(JSON.stringify(restaurants, null, 2));
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=check_db.js.map