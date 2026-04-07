"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
const NEW_ID = 'cmmg60qir0000c2lwao9t1z9m';
async function main() {
    console.log('🔗 Connecting to DB...');
    const restaurants = await prisma.restaurant.findMany({
        where: { id: { not: NEW_ID } }
    });
    if (restaurants.length === 0) {
        console.log(`✅ No old restaurant to migrate. Everything is already on ${NEW_ID}.`);
        return;
    }
    const oldRestaurant = restaurants[0];
    const oldId = oldRestaurant.id;
    console.log(`Found old restaurant ID: ${oldId}. Migrating to ${NEW_ID}...`);
    const existingNew = await prisma.restaurant.findUnique({ where: { id: NEW_ID } });
    if (!existingNew) {
        console.log(`Creating new restaurant with ID: ${NEW_ID}...`);
        await prisma.restaurant.create({
            data: {
                id: NEW_ID,
                name: oldRestaurant.name,
                description: oldRestaurant.description,
                logo_url: oldRestaurant.logo_url,
                is_active: oldRestaurant.is_active,
                createdAt: oldRestaurant.createdAt,
            }
        });
    }
    console.log('Updating relations...');
    await prisma.table.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.category.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.menuItem.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.user.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.robot.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.order.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.delivery.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    await prisma.platformFee.updateMany({ where: { restaurantId: oldId }, data: { restaurantId: NEW_ID } });
    console.log(`Deleting old restaurant (${oldId})...`);
    await prisma.restaurant.delete({ where: { id: oldId } });
    console.log('✅ Migration complete!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=migrate_restaurant_id.js.map