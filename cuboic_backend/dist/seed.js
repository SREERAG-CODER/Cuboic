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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = require("dns");
(0, dns_1.setDefaultResultOrder)('ipv4first');
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/cuboic';
function generateSecretKey() {
    return `robot-${Math.random().toString(36).substring(2, 12)}`;
}
async function seed() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const db = mongoose_1.default.connection.db;
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
        await db.dropCollection(col.name);
    }
    console.log('🗑️  Cleared existing data');
    const restaurantId = new mongoose_1.default.Types.ObjectId();
    await db.collection('restaurants').insertOne({
        _id: restaurantId,
        name: 'Cuboic Kitchen',
        description: 'Robot-delivered dining experience',
        logo_url: '',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const tableIds = Array.from({ length: 6 }, () => new mongoose_1.default.Types.ObjectId());
    await db.collection('tables').insertMany(tableIds.map((id, i) => ({
        _id: id,
        restaurant_id: restaurantId,
        table_number: `T${i + 1}`,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    })));
    const catNames = ['Starters', 'Mains', 'Desserts', 'Drinks'];
    const categoryIds = catNames.map(() => new mongoose_1.default.Types.ObjectId());
    await db.collection('categories').insertMany(catNames.map((name, i) => ({
        _id: categoryIds[i],
        restaurant_id: restaurantId,
        name,
        display_order: i,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    })));
    const menuItems = [
        { name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 5.99, category: 0 },
        { name: 'Garlic Bread', description: 'Toasted with garlic butter', price: 3.99, category: 0 },
        { name: 'Grilled Chicken', description: 'Herb-marinated chicken breast', price: 13.99, category: 1 },
        { name: 'Pasta Primavera', description: 'Seasonal vegetables in light sauce', price: 11.99, category: 1 },
        { name: 'Beef Burger', description: 'Classic beef patty with fries', price: 14.99, category: 1 },
        { name: 'Chocolate Lava Cake', description: 'Warm molten chocolate centre', price: 6.99, category: 2 },
        { name: 'Vanilla Ice Cream', description: 'Three scoops', price: 4.99, category: 2 },
        { name: 'Fresh Lemonade', description: 'House-made with mint', price: 3.49, category: 3 },
        { name: 'Iced Coffee', description: 'Cold brew over ice', price: 4.49, category: 3 },
    ];
    const menuItemIds = menuItems.map(() => new mongoose_1.default.Types.ObjectId());
    await db.collection('menuitems').insertMany(menuItems.map((item, i) => ({
        _id: menuItemIds[i],
        restaurant_id: restaurantId,
        category_id: categoryIds[item.category],
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: '',
        is_available: true,
        display_order: i,
        createdAt: new Date(),
        updatedAt: new Date(),
    })));
    const robotIds = [
        new mongoose_1.default.Types.ObjectId(),
        new mongoose_1.default.Types.ObjectId(),
    ];
    const robotData = [
        {
            _id: robotIds[0],
            restaurant_id: restaurantId,
            name: 'CuboBot-1',
            secretKey: generateSecretKey(),
            status: 'Idle',
            mode: 'Automatic',
            currentDeliveryId: null,
            isOnline: false,
            lastSeen: null,
            battery: 100,
            location: { x: 0, y: 0 },
            cabinets: [
                { id: 'C1', status: 'Free' },
                { id: 'C2', status: 'Free' },
                { id: 'C3', status: 'Free' },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: robotIds[1],
            restaurant_id: restaurantId,
            name: 'CuboBot-2',
            secretKey: generateSecretKey(),
            status: 'Idle',
            mode: 'Automatic',
            currentDeliveryId: null,
            isOnline: false,
            lastSeen: null,
            battery: 87,
            location: { x: 2, y: 1 },
            cabinets: [
                { id: 'C1', status: 'Free' },
                { id: 'C2', status: 'Free' },
                { id: 'C3', status: 'Free' },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    await db.collection('robots').insertMany(robotData);
    const password_hash = await bcrypt.hash('password123', 10);
    const ownerUserId = new mongoose_1.default.Types.ObjectId();
    const staffUserId = new mongoose_1.default.Types.ObjectId();
    await db.collection('users').insertMany([
        {
            _id: ownerUserId,
            restaurant_id: restaurantId,
            name: 'Restaurant Owner',
            user_id: 'owner01',
            password_hash,
            role: 'Owner',
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: staffUserId,
            restaurant_id: restaurantId,
            name: 'Staff Member',
            user_id: 'staff01',
            password_hash,
            role: 'Staff',
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
    console.log('\n🎉 Seed complete!\n');
    console.log('──────────────────────────────────────────────');
    console.log(`Restaurant ID : ${restaurantId}`);
    console.log(`Robot IDs     : ${robotIds.map((r) => r.toString()).join(', ')}`);
    console.log('\n🔐 Robot Credentials:');
    robotData.forEach((r) => {
        console.log(`Robot: ${r.name}`);
        console.log(`  ID       : ${r._id}`);
        console.log(`  secretKey: ${r.secretKey}\n`);
    });
    console.log(`Owner login   : user_id=owner01  password=password123`);
    console.log(`Staff login   : user_id=staff01  password=password123`);
    console.log('──────────────────────────────────────────────');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map