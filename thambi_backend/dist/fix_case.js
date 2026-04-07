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
function toTitleCase(str) {
    if (!str)
        return str;
    return str.toLowerCase().replace(/(?:^|\s|-|\/|\()\w/g, function (match) {
        return match.toUpperCase();
    });
}
function convertName(name) {
    let title = toTitleCase(name);
    title = title.replace(/\bAg\b/g, 'AG');
    return title;
}
async function fixCase() {
    console.log('🔗 Connecting to DB to fix casing...');
    const categories = await prisma.category.findMany({
        where: { restaurantId: RESTAURANT_ID }
    });
    for (const cat of categories) {
        const newName = convertName(cat.name);
        if (newName !== cat.name) {
            await prisma.category.update({
                where: { id: cat.id },
                data: { name: newName }
            });
            console.log(`Updated Category: ${cat.name} -> ${newName}`);
        }
    }
    const items = await prisma.menuItem.findMany({
        where: { restaurantId: RESTAURANT_ID }
    });
    for (const item of items) {
        const newName = convertName(item.name);
        if (newName !== item.name) {
            await prisma.menuItem.update({
                where: { id: item.id },
                data: { name: newName }
            });
            console.log(`Updated Item: ${item.name} -> ${newName}`);
        }
    }
    console.log('✅ Case fix complete!');
}
fixCase()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=fix_case.js.map