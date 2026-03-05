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
const IMG = {
    springRolls: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=480&h=320&fit=crop&auto=format&q=80',
    garlicBread: 'https://images.unsplash.com/photo-1619894991209-9f9694e02748?w=480&h=320&fit=crop&auto=format&q=80',
    bruschetta: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=480&h=320&fit=crop&auto=format&q=80',
    calamari: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=480&h=320&fit=crop&auto=format&q=80',
    soupTomato: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=480&h=320&fit=crop&auto=format&q=80',
    nachos: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=480&h=320&fit=crop&auto=format&q=80',
    grilledChicken: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=320&fit=crop&auto=format&q=80',
    pasta: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=480&h=320&fit=crop&auto=format&q=80',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&auto=format&q=80',
    biryani: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=480&h=320&fit=crop&auto=format&q=80',
    pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=320&fit=crop&auto=format&q=80',
    steak: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=480&h=320&fit=crop&auto=format&q=80',
    fishTacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=480&h=320&fit=crop&auto=format&q=80',
    pastaCarb: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=480&h=320&fit=crop&auto=format&q=80',
    salmonRice: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=480&h=320&fit=crop&auto=format&q=80',
    vegCurry: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=480&h=320&fit=crop&auto=format&q=80',
    lavaCAke: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=480&h=320&fit=crop&auto=format&q=80',
    iceCream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=480&h=320&fit=crop&auto=format&q=80',
    tiramisu: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=480&h=320&fit=crop&auto=format&q=80',
    cheesecake: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=320&fit=crop&auto=format&q=80',
    brownie: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=480&h=320&fit=crop&auto=format&q=80',
    pannaCotta: 'https://images.unsplash.com/photo-1488477181228-89d98f807aba?w=480&h=320&fit=crop&auto=format&q=80',
    lemonade: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=480&h=320&fit=crop&auto=format&q=80',
    icedCoffee: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=480&h=320&fit=crop&auto=format&q=80',
    smoothie: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=480&h=320&fit=crop&auto=format&q=80',
    sparkling: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=480&h=320&fit=crop&auto=format&q=80',
    hotChocolate: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=480&h=320&fit=crop&auto=format&q=80',
    chai: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=480&h=320&fit=crop&auto=format&q=80',
    fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=480&h=320&fit=crop&auto=format&q=80',
    caesarSalad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=320&fit=crop&auto=format&q=80',
    coleslaw: 'https://images.unsplash.com/photo-1620374645498-af6bd681a0bd?w=480&h=320&fit=crop&auto=format&q=80',
    sweetPotato: 'https://images.unsplash.com/photo-1596097558878-5e2ca8dba53d?w=480&h=320&fit=crop&auto=format&q=80',
};
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
    const tableIds = Array.from({ length: 12 }, () => new mongoose_1.default.Types.ObjectId());
    await db.collection('tables').insertMany(tableIds.map((id, i) => ({
        _id: id,
        restaurant_id: restaurantId,
        table_number: `T${i + 1}`,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    })));
    const catNames = ['Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];
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
        { name: 'Spring Rolls', description: 'Crispy golden vegetable rolls with sweet chilli dip', price: 5.99, category: 0, image: IMG.springRolls },
        { name: 'Garlic Bread', description: 'Toasted sourdough with herb garlic butter & mozzarella', price: 3.99, category: 0, image: IMG.garlicBread },
        { name: 'Bruschetta', description: 'Grilled bread with fresh tomatoes, basil & olive oil', price: 5.49, category: 0, image: IMG.bruschetta },
        { name: 'Crispy Calamari', description: 'Lightly battered squid rings with aioli sauce', price: 7.99, category: 0, image: IMG.calamari },
        { name: 'Tomato Bisque', description: 'Creamy roasted tomato soup with croutons', price: 4.99, category: 0, image: IMG.soupTomato },
        { name: 'Loaded Nachos', description: 'Tortilla chips, guacamole, sour cream & salsa', price: 6.99, category: 0, image: IMG.nachos },
        { name: 'Grilled Chicken', description: 'Herb-marinated breast with roasted vegetables', price: 13.99, category: 1, image: IMG.grilledChicken },
        { name: 'Pasta Primavera', description: 'Penne with seasonal vegetables in a light cream sauce', price: 11.99, category: 1, image: IMG.pasta },
        { name: 'Classic Beef Burger', description: 'Double smash patty, cheddar, pickles & house sauce', price: 14.99, category: 1, image: IMG.burger },
        { name: 'Chicken Biryani', description: 'Fragrant basmati rice with slow-cooked spiced chicken', price: 13.49, category: 1, image: IMG.biryani },
        { name: 'Margherita Pizza', description: 'San Marzano tomato base, fresh mozzarella & basil', price: 12.99, category: 1, image: IMG.pizza },
        { name: 'Ribeye Steak', description: '300g prime ribeye, chimichurri & seasonal greens', price: 24.99, category: 1, image: IMG.steak },
        { name: 'Fish Tacos', description: 'Battered tilapia, slaw & chipotle mayo in soft tortillas', price: 12.49, category: 1, image: IMG.fishTacos },
        { name: 'Spaghetti Carbonara', description: 'Al dente pasta, pancetta, egg yolk & Parmigiano', price: 13.29, category: 1, image: IMG.pastaCarb },
        { name: 'Grilled Salmon', description: 'Atlantic salmon on jasmine rice with citrus butter', price: 16.99, category: 1, image: IMG.salmonRice },
        { name: 'Vegetable Curry', description: 'Fragrant coconut curry with seasonal vegetables & naan', price: 10.99, category: 1, image: IMG.vegCurry },
        { name: 'Crispy Fries', description: 'Double-fried golden fries with sea salt', price: 3.49, category: 2, image: IMG.fries },
        { name: 'Caesar Salad', description: 'Romaine, parmesan, croutons & house Caesar dressing', price: 5.49, category: 2, image: IMG.caesarSalad },
        { name: 'Creamy Coleslaw', description: 'Garden cabbage and carrots in a light dressing', price: 2.99, category: 2, image: IMG.coleslaw },
        { name: 'Sweet Potato Fries', description: 'Crispy sweet potato with chipotle dip', price: 4.49, category: 2, image: IMG.sweetPotato },
        { name: 'Garlic Mushrooms', description: 'Sautéed button mushrooms in garlic & thyme butter', price: 4.99, category: 2, image: IMG.bruschetta },
        { name: 'Chocolate Lava Cake', description: 'Warm molten chocolate centre with vanilla ice cream', price: 6.99, category: 3, image: IMG.lavaCAke },
        { name: 'Vanilla Ice Cream', description: 'Three generous scoops of Madagascar vanilla', price: 4.49, category: 3, image: IMG.iceCream },
        { name: 'Classic Tiramisu', description: 'Coffee-soaked ladyfingers with mascarpone cream', price: 6.49, category: 3, image: IMG.tiramisu },
        { name: 'New York Cheesecake', description: 'Baked cheesecake with fresh berry compote', price: 6.99, category: 3, image: IMG.cheesecake },
        { name: 'Fudge Brownie', description: 'Rich chocolate brownie with caramel drizzle', price: 5.49, category: 3, image: IMG.brownie },
        { name: 'Panna Cotta', description: 'Silky vanilla cream with raspberry coulis', price: 5.99, category: 3, image: IMG.pannaCotta },
        { name: 'House Lemonade', description: 'Hand-squeezed lemon with honey syrup & mint', price: 3.49, category: 4, image: IMG.lemonade },
        { name: 'Cold Brew Coffee', description: 'Slow-steeped 24hr cold brew served over ice', price: 4.49, category: 4, image: IMG.icedCoffee },
        { name: 'Mango Smoothie', description: 'Alphonso mango blended with yoghurt & honey', price: 4.99, category: 4, image: IMG.smoothie },
        { name: 'Sparkling Water', description: 'San Pellegrino sparkling mineral water 500ml', price: 2.49, category: 4, image: IMG.sparkling },
        { name: 'Hot Chocolate', description: 'Rich 70% dark chocolate with steamed milk & cream', price: 4.29, category: 4, image: IMG.hotChocolate },
        { name: 'Masala Chai', description: 'Spiced Indian tea with cardamom, ginger & cinnamon', price: 3.29, category: 4, image: IMG.chai },
    ];
    const menuItemIds = menuItems.map(() => new mongoose_1.default.Types.ObjectId());
    await db.collection('menuitems').insertMany(menuItems.map((item, i) => ({
        _id: menuItemIds[i],
        restaurant_id: restaurantId,
        category_id: categoryIds[item.category],
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image,
        is_available: true,
        display_order: i,
        createdAt: new Date(),
        updatedAt: new Date(),
    })));
    const robotIds = [
        new mongoose_1.default.Types.ObjectId(),
        new mongoose_1.default.Types.ObjectId(),
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
        {
            _id: robotIds[2],
            restaurant_id: restaurantId,
            name: 'CuboBot-3',
            secretKey: generateSecretKey(),
            status: 'Idle',
            mode: 'Automatic',
            currentDeliveryId: null,
            isOnline: false,
            lastSeen: null,
            battery: 72,
            location: { x: 4, y: 0 },
            cabinets: [
                { id: 'C1', status: 'Free' },
                { id: 'C2', status: 'Free' },
                { id: 'C3', status: 'Free' },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: robotIds[3],
            restaurant_id: restaurantId,
            name: 'CuboBot-4',
            secretKey: generateSecretKey(),
            status: 'Idle',
            mode: 'Automatic',
            currentDeliveryId: null,
            isOnline: false,
            lastSeen: null,
            battery: 55,
            location: { x: 1, y: 3 },
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
    console.log(`Tables        : 12  (T1 – T12)`);
    console.log(`Menu Items    : ${menuItems.length}`);
    console.log(`Robots        : 4   (CuboBot-1 through CuboBot-4)`);
    console.log(`\n📋 Table IDs (first 3):`);
    tableIds.slice(0, 3).forEach((id, i) => console.log(`  T${i + 1}: ${id}`));
    console.log('\n🔐 Robot Credentials:');
    robotData.forEach((r) => {
        console.log(`  ${r.name}  |  ID: ${r._id}  |  key: ${r.secretKey}`);
    });
    console.log(`\n🌐 Customer App URL (Table T1):`);
    console.log(`  http://localhost:5173/?r=${restaurantId}&t=${tableIds[0]}`);
    console.log(`\n🔑 Admin Login:`);
    console.log(`  Owner  →  user_id=owner01   password=password123`);
    console.log(`  Staff  →  user_id=staff01   password=password123`);
    console.log('──────────────────────────────────────────────');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map