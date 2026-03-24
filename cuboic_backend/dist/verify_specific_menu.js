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
const RESTAURANT_ID = 'cmmg60qir0000c2lwao9t1z9m';
async function verifyMenu() {
    console.log('🔗 Connecting to DB...');
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: RESTAURANT_ID },
        include: {
            categories: {
                include: { menuItems: true }
            }
        }
    });
    if (!restaurant) {
        console.error('❌ Restaurant not found!');
        process.exit(1);
    }
    const tables = await prisma.table.findMany({
        where: { restaurantId: RESTAURANT_ID }
    });
    console.log(`\n📍 Restaurant: ${restaurant.name} (${restaurant.id})`);
    console.log(`\n🪑 Tables (${tables.length}):`);
    tables.forEach(table => {
        console.log(`  - ${table.table_number}: ${table.id}`);
    });
    console.log(`\n🍔 Categories & Items:`);
    let totalItems = 0;
    restaurant.categories.forEach(cat => {
        console.log(`\n  📂 [${cat.name}] (${cat.menuItems.length} items)`);
        cat.menuItems.forEach(item => {
            console.log(`    - ${item.name}: ₹${item.price}`);
            totalItems++;
        });
    });
    console.log(`\n✅ Total Items: ${totalItems}`);
}
verifyMenu()
    .catch(e => {
    console.error('❌ Error verifying:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=verify_specific_menu.js.map