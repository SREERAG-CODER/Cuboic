import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const MONGO_URI =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/cuboic';

function generateSecretKey() {
    return `robot-${Math.random().toString(36).substring(2, 12)}`;
}

// ── Unsplash food image URLs ────────────────────────────────────────────────
const IMG = {
    // Starters
    vadai: 'https://images.unsplash.com/photo-1630383249896-483b1356e6f1?w=480&h=320&fit=crop&auto=format&q=80',
    sambar: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=480&h=320&fit=crop&auto=format&q=80',
    idli: 'https://images.unsplash.com/photo-1626082927389-6cd097cee6e9?w=480&h=320&fit=crop&auto=format&q=80',
    bondaBajji: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=480&h=320&fit=crop&auto=format&q=80',
    papadum: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=480&h=320&fit=crop&auto=format&q=80',
    rasam: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=480&h=320&fit=crop&auto=format&q=80',
    // Mains
    dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=480&h=320&fit=crop&auto=format&q=80',
    uttapam: 'https://images.unsplash.com/photo-1626082927389-6cd097cee6e9?w=480&h=320&fit=crop&auto=format&q=80',
    biryani: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=480&h=320&fit=crop&auto=format&q=80',
    chettinadChicken: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=320&fit=crop&auto=format&q=80',
    fishCurry: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=480&h=320&fit=crop&auto=format&q=80',
    pesarattu: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=480&h=320&fit=crop&auto=format&q=80',
    avialCurry: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=480&h=320&fit=crop&auto=format&q=80',
    palakDal: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=480&h=320&fit=crop&auto=format&q=80',
    kothuParotta: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=320&fit=crop&auto=format&q=80',
    thaliPlate: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=480&h=320&fit=crop&auto=format&q=80',
    // Sides
    coconutRice: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=320&fit=crop&auto=format&q=80',
    appam: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=480&h=320&fit=crop&auto=format&q=80',
    poriyal: 'https://images.unsplash.com/photo-1620374645498-af6bd681a0bd?w=480&h=320&fit=crop&auto=format&q=80',
    chutneySet: 'https://images.unsplash.com/photo-1596097558878-5e2ca8dba53d?w=480&h=320&fit=crop&auto=format&q=80',
    pickleRaita: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=480&h=320&fit=crop&auto=format&q=80',
    // Desserts
    payasam: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=480&h=320&fit=crop&auto=format&q=80',
    halwa: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=480&h=320&fit=crop&auto=format&q=80',
    kesariBath: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=480&h=320&fit=crop&auto=format&q=80',
    iceCream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=480&h=320&fit=crop&auto=format&q=80',
    mysurePak: 'https://images.unsplash.com/photo-1488477181228-89d98f807aba?w=480&h=320&fit=crop&auto=format&q=80',
    banana: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=320&fit=crop&auto=format&q=80',
    // Drinks
    buttermilk: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=480&h=320&fit=crop&auto=format&q=80',
    masalaChai: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=480&h=320&fit=crop&auto=format&q=80',
    mangoLassi: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=480&h=320&fit=crop&auto=format&q=80',
    coconutWater: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=480&h=320&fit=crop&auto=format&q=80',
    filter: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=480&h=320&fit=crop&auto=format&q=80',
    panakam: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=480&h=320&fit=crop&auto=format&q=80',
};

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db!;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
        await db.dropCollection(col.name);
    }

    console.log('🗑️  Cleared existing data');

    // ──────────────────────────────────────────────────────────────
    // Restaurant
    // ──────────────────────────────────────────────────────────────
    const restaurantId = new mongoose.Types.ObjectId();

    await db.collection('restaurants').insertOne({
        _id: restaurantId,
        name: 'Cuboic Kitchen',
        description: 'Robot-delivered dining experience',
        logo_url: '',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // ──────────────────────────────────────────────────────────────
    // Tables — 12 total
    // ──────────────────────────────────────────────────────────────
    const tableIds = Array.from({ length: 12 }, () => new mongoose.Types.ObjectId());

    await db.collection('tables').insertMany(
        tableIds.map((id, i) => ({
            _id: id,
            restaurant_id: restaurantId,
            table_number: `T${i + 1}`,
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
    );

    // ──────────────────────────────────────────────────────────────
    // Categories — 5 categories
    // ──────────────────────────────────────────────────────────────
    const catNames = ['Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];
    const categoryIds = catNames.map(() => new mongoose.Types.ObjectId());

    await db.collection('categories').insertMany(
        catNames.map((name, i) => ({
            _id: categoryIds[i],
            restaurant_id: restaurantId,
            name,
            display_order: i,
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
    );

    // cat index: 0=Starters, 1=Mains, 2=Sides, 3=Desserts, 4=Drinks
    // ──────────────────────────────────────────────────────────────
    // Menu Items — 35 items with images
    // ──────────────────────────────────────────────────────────────
    const menuItems = [
        // ── Starters (cat 0) ──────────────────────────────────────────────
        { name: 'Medu Vadai', description: 'Crispy urad dal doughnuts, served with sambar & coconut chutney', price: 80, category: 0, image: IMG.vadai },
        { name: 'Idli Sambar', description: 'Three steamed rice cakes with aromatic sambar & three chutneys', price: 70, category: 0, image: IMG.idli },
        { name: 'Mysore Bonda', description: 'Fluffy deep-fried urad dal balls with ginger & curry leaves', price: 80, category: 0, image: IMG.bondaBajji },
        { name: 'Masala Papadum', description: 'Roasted papadums with raw mango, onion & green chilli topping', price: 60, category: 0, image: IMG.papadum },
        { name: 'Rasam', description: 'Thin tangy tomato-tamarind pepper broth — the South Indian soul', price: 60, category: 0, image: IMG.rasam },
        { name: 'Filter Coffee Shots', description: 'Two small tumblers of traditional Mysore filter decoction', price: 70, category: 0, image: IMG.filter },

        // ── Mains (cat 1) ─────────────────────────────────────────────────
        { name: 'Masala Dosa', description: 'Crispy rice-lentil crepe folded over spiced potato & onion filling', price: 130, category: 1, image: IMG.dosa },
        { name: 'Ghee Roast Dosa', description: 'Paper-thin dosa finished with generous ghee, served with chutneys', price: 150, category: 1, image: IMG.dosa },
        { name: 'Onion Uttapam', description: 'Thick soft pancake topped with caramelised onion & tomato', price: 120, category: 1, image: IMG.uttapam },
        { name: 'Chicken Biryani', description: 'Chettinad-spiced chicken layered with seeraga samba rice', price: 280, category: 1, image: IMG.biryani },
        { name: 'Chettinad Chicken Curry', description: 'Dry-roasted whole-spice chicken curry — fiery & fragrant', price: 320, category: 1, image: IMG.chettinadChicken },
        { name: 'Pesarattu', description: 'Green moong dal crepe with ginger chutney & upma stuffing', price: 120, category: 1, image: IMG.pesarattu },
        { name: 'Kerala Fish Curry', description: 'Karimeen in a tangy raw mango & coconut milk gravy', price: 340, category: 1, image: IMG.fishCurry },
        { name: 'Avial', description: 'Mixed vegetables in a thick coconut-curd gravy, tempered with coconut oil', price: 170, category: 1, image: IMG.avialCurry },
        { name: 'Pesara Pappu Dal', description: 'Andhra-style green moong dal tempered with dry red chilli & ghee', price: 160, category: 1, image: IMG.palakDal },
        { name: 'Kothu Parotta', description: 'Shredded layered parotta stir-fried with egg, onion & spiced gravy', price: 210, category: 1, image: IMG.kothuParotta },
        { name: 'Andhra Veg Thali', description: '7-item unlimited thali — rice, dal, sambar, rasam, 2 curries, curd', price: 220, category: 1, image: IMG.thaliPlate },

        // ── Sides (cat 2) ─────────────────────────────────────────────────
        { name: 'Coconut Rice', description: 'Steamed rice tossed with freshly grated coconut & mustard seeds', price: 110, category: 2, image: IMG.coconutRice },
        { name: 'Appam', description: 'Lacy fermented rice hoppers, best paired with stew or curry', price: 100, category: 2, image: IMG.appam },
        { name: 'Beans Poriyal', description: 'Green beans stir-fried with coconut, mustard seeds & curry leaves', price: 90, category: 2, image: IMG.poriyal },
        { name: 'Chutney Trio', description: 'Coconut, tomato & mint-coriander chutneys with fresh curry leaf oil', price: 60, category: 2, image: IMG.chutneySet },
        { name: 'Pickle & Raita', description: 'House mango pickle with chilled cucumber raita', price: 70, category: 2, image: IMG.pickleRaita },

        // ── Desserts (cat 3) ──────────────────────────────────────────────
        { name: 'Semiya Payasam', description: 'Vermicelli simmered in milk, cardamom, cashews & golden raisins', price: 100, category: 3, image: IMG.payasam },
        { name: 'Carrot Halwa', description: 'Slow-cooked grated carrot in ghee, milk & khoya, topped with pistachios', price: 120, category: 3, image: IMG.halwa },
        { name: 'Kesari Bath', description: 'Semolina sweet with saffron, ghee & cardamom — a Bangalore classic', price: 90, category: 3, image: IMG.kesariBath },
        { name: 'Tender Coconut Ice Cream', description: 'Hand-churned tender coconut sorbet — light & tropical', price: 110, category: 3, image: IMG.iceCream },
        { name: 'Mysore Pak', description: 'Melt-in-the-mouth gram flour & ghee fudge from the royal kitchens', price: 80, category: 3, image: IMG.mysurePak },
        { name: 'Banana Sheera', description: 'Ripe banana & semolina pudding with jaggery and cardamom', price: 90, category: 3, image: IMG.banana },

        // ── Drinks (cat 4) ────────────────────────────────────────────────
        { name: 'Spiced Buttermilk', description: 'Chilled churned curd with ginger, green chilli, coriander & mustard', price: 60, category: 4, image: IMG.buttermilk },
        { name: 'Masala Chai', description: 'Kadak tea brewed with cardamom, ginger, cinnamon & jaggery', price: 60, category: 4, image: IMG.masalaChai },
        { name: 'Mango Lassi', description: 'Thick Alphonso mango blended with full-fat curd & a hint of saffron', price: 100, category: 4, image: IMG.mangoLassi },
        { name: 'Tender Coconut Water', description: 'Fresh green coconut served tableside — hydrating & natural', price: 80, category: 4, image: IMG.coconutWater },
        { name: 'Filter Coffee', description: 'Classic South Indian filter decoction with full-cream milk & froth', price: 70, category: 4, image: IMG.filter },
        { name: 'Panakam', description: 'Temple-style cold drink of jaggery, ginger, cardamom & pepper', price: 60, category: 4, image: IMG.panakam },
    ];

    const menuItemIds = menuItems.map(() => new mongoose.Types.ObjectId());

    await db.collection('menuitems').insertMany(
        menuItems.map((item, i) => ({
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
        })),
    );

    // ──────────────────────────────────────────────────────────────
    // Robots — 4 total
    // ──────────────────────────────────────────────────────────────
    const robotIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
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

    // ──────────────────────────────────────────────────────────────
    // Users
    // ──────────────────────────────────────────────────────────────
    const password_hash = await bcrypt.hash('password123', 10);

    const ownerUserId = new mongoose.Types.ObjectId();
    const staffUserId = new mongoose.Types.ObjectId();

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

    // ──────────────────────────────────────────────────────────────
    // Summary
    // ──────────────────────────────────────────────────────────────
    console.log('\n🎉 Seed complete!\n');
    console.log('──────────────────────────────────────────────');
    console.log(`Restaurant ID : ${restaurantId}`);
    console.log(`Tables        : 12  (T1 – T12)`);
    console.log(`Menu Items    : ${menuItems.length}`);
    console.log(`Robots        : 4   (CuboBot-1 through CuboBot-4)`);

    // Print table IDs - the first one is used as the demo URL table
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

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});