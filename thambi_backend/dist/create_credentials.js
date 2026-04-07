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
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔗 Connecting to DB...');
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: 'cmn4bj2n40000c2m04hr9rjju' }
    });
    if (!restaurant) {
        console.log('❌ Restaurant Dakshin Delights not found');
        return;
    }
    const passwords = {
        owner: 'owner123',
        staff: 'staff123'
    };
    const hashOwner = await bcrypt.hash(passwords.owner, 10);
    const hashStaff = await bcrypt.hash(passwords.staff, 10);
    console.log('👤 Creating Owner...');
    const owner = await prisma.user.upsert({
        where: { user_id: 'dakshin_owner' },
        update: { password_hash: hashOwner, restaurantId: restaurant.id, is_active: true },
        create: {
            name: 'Dakshin Owner',
            user_id: 'dakshin_owner',
            password_hash: hashOwner,
            role: 'Owner',
            restaurantId: restaurant.id,
            is_active: true
        }
    });
    console.log('👤 Creating Staff...');
    const staff = await prisma.user.upsert({
        where: { user_id: 'dakshin_staff' },
        update: { password_hash: hashStaff, restaurantId: restaurant.id, is_active: true },
        create: {
            name: 'Dakshin Staff',
            user_id: 'dakshin_staff',
            password_hash: hashStaff,
            role: 'Staff',
            restaurantId: restaurant.id,
            is_active: true
        }
    });
    console.log('\n✅ Credentials created/updated successfully!');
    console.log('==========================================');
    console.log(`OWNER:`);
    console.log(`Username: ${owner.user_id}`);
    console.log(`Password: ${passwords.owner}`);
    console.log('------------------------------------------');
    console.log(`STAFF:`);
    console.log(`Username: ${staff.user_id}`);
    console.log(`Password: ${passwords.staff}`);
    console.log('==========================================\n');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=create_credentials.js.map