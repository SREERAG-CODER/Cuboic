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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
function generateSecretKey() {
    return `robot-${Math.random().toString(36).substring(2, 12)}`;
}
const IMG = {
    vadai: 'https://www.yummytummyaarthi.com/wp-content/uploads/2022/08/medu-vada-1.jpeg',
    idli: 'https://vaya.in/recipes/wp-content/uploads/2018/02/Idli-and-Sambar-1.jpg',
    bondaBajji: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqqY21G0FJtOh0XYrSHYJ3CWkdXZAt_Gwp7g&s',
    papadum: 'https://www.spiceupthecurry.com/wp-content/uploads/2015/07/masala-papad-1.jpg',
    rasam: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlMc1l0teo_PdE7nwmRi3P0sCVuL2UjCY24A&s',
    filterShots: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCZBiCjds3hJI1OJkdLx22mk0_4_flwUNWbg&s',
    dosa: 'https://static.toiimg.com/photo/54289752.cms',
    gheeRoastDosa: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6t1pmvBEm17aKSbivyhrYkWWEEqWtb4kn3w&s',
    uttapam: 'https://www.sharmispassions.com/wp-content/uploads/2012/10/OnionUttapam2.jpg',
    biryani: 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Chicken-Biryani-Recipe.jpg',
    chettinadChicken: 'https://www.whiskaffair.com/wp-content/uploads/2020/09/Chicken-Chettinad-Curry-2-3.jpg',
    pesarattu: 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2022/07/pesarattu-allam-pachadi-1.jpg?ssl=1',
    fishCurry: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU6DPk7mPhi79YCapaD8JvE1HGULEeNGl-nQ&s',
    avialCurry: 'https://www.sharmispassions.com/wp-content/uploads/2024/08/aviyal7.jpg',
    palakDal: 'https://www.cookshideout.com/wp-content/uploads/2009/06/Palakura-Pesarapappu_FI.jpg',
    kothuParotta: 'https://www.relishthebite.com/wp-content/uploads/2015/05/Kothuparotta8.jpg',
    thaliPlate: 'https://www.vidhyashomecooking.com/wp-content/uploads/2017/03/AndhraThali.jpg',
    coconutRice: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHt5tx8H62LyeYtmB4KiAspvDCMcqFBjxDeg&s',
    appam: 'https://www.cookshideout.com/wp-content/uploads/2018/04/Instant-Appam_FI.jpg',
    poriyal: 'https://img-cdn.publive.online/fit-in/640x430/filters:format(webp)/sanjeev-kapoor/media/media_files/uUtFri1V299Xn5idvbh5.JPG',
    chutneySet: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRspWzzjnvo7Fk1ERUq9zVv8UaQSahtOj3EEQ&s',
    pickleRaita: 'https://media-cdn.tripadvisor.com/media/photo-s/1a/21/a6/4b/raita-und-lemon-pickle.jpg',
    payasam: 'https://www.sharmispassions.com/wp-content/uploads/2023/10/semiya-payasam1-500x500.jpg',
    halwa: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvQLXhFa45wSRw8xNuXvYnlRuILf_qEgo58Q&s',
    kesariBath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToywi5Okql9MZtyNAZpIopKVENBT9jcAeiLA&s',
    iceCream: 'https://camerry.in/images/ice-cream-1.png',
    mysurePak: 'https://lynkfoods.com/cdn/shop/articles/mysore-pak-the-royal-sweet-of-karnataka-119721_56c2f15e-9ea8-43be-a6bb-5a3f4d31a9cc.jpg?v=1753080568',
    banana: 'https://i0.wp.com/aartimadan.com/wp-content/uploads/2020/08/IMG-20200817-WA0001-01.jpeg?resize=750%2C750&ssl=1',
    buttermilk: 'https://i0.wp.com/foodtrails25.com/wp-content/uploads/2023/03/Chaas-pin.jpg?resize=720%2C720&ssl=1',
    masalaChai: 'https://www.temptingtreat.com/wp-content/uploads/2024/06/chai-p3.jpg',
    mangoLassi: 'https://biancazapatka.com/wp-content/uploads/2020/09/mango-lassi-smoothie.jpg',
    coconutWater: 'https://udupifresh.com/cdn/shop/files/1_115bd586-7cd1-43fa-82d7-fa1077f7f48b_750x.jpg?v=1705777421',
    filterCoffee: 'https://www.sharmispassions.com/wp-content/uploads/2012/01/filter-coffee-recipe8.jpg',
    panakam: 'https://www.cookclickndevour.com/wp-content/uploads/2018/03/Panakam-Recipe.jpg',
};
async function seed() {
    console.log('🔗 Connecting to PostgreSQL...');
    await prisma.robotTelemetry.deleteMany({});
    await prisma.delivery.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.robot.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.table.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.restaurant.deleteMany({});
    console.log('🗑️  Cleared existing data');
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Thambi Kitchen',
            description: 'Robot-delivered dining experience',
            logo_url: '',
            is_active: true,
        },
    });
    const tables = await Promise.all(Array.from({ length: 12 }, (_, i) => prisma.table.create({
        data: {
            restaurantId: restaurant.id,
            table_number: `T${i + 1}`,
            is_active: true,
        },
    })));
    const catNames = ['Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];
    const categories = await Promise.all(catNames.map((name, i) => prisma.category.create({
        data: {
            restaurantId: restaurant.id,
            name,
            display_order: i,
            is_active: true,
        },
    })));
    const menuItemsData = [
        { name: 'Medu Vadai', description: 'Crispy urad dal doughnuts, served with sambar & coconut chutney', price: 80, cat: 0, image: IMG.vadai },
        { name: 'Idli Sambar', description: 'Three steamed rice cakes with aromatic sambar & three chutneys', price: 70, cat: 0, image: IMG.idli },
        { name: 'Mysore Bonda', description: 'Fluffy deep-fried urad dal balls with ginger & curry leaves', price: 80, cat: 0, image: IMG.bondaBajji },
        { name: 'Masala Papadum', description: 'Roasted papadums with raw mango, onion & green chilli topping', price: 60, cat: 0, image: IMG.papadum },
        { name: 'Rasam', description: 'Thin tangy tomato-tamarind pepper broth — the South Indian soul', price: 60, cat: 0, image: IMG.rasam },
        { name: 'Filter Coffee Shots', description: 'Two small tumblers of traditional Mysore filter decoction', price: 70, cat: 0, image: IMG.filterShots },
        { name: 'Masala Dosa', description: 'Crispy rice-lentil crepe folded over spiced potato & onion filling', price: 130, cat: 1, image: IMG.dosa },
        { name: 'Ghee Roast Dosa', description: 'Paper-thin dosa finished with generous ghee, served with chutneys', price: 150, cat: 1, image: IMG.gheeRoastDosa },
        { name: 'Onion Uttapam', description: 'Thick soft pancake topped with caramelised onion & tomato', price: 120, cat: 1, image: IMG.uttapam },
        { name: 'Chicken Biryani', description: 'Chettinad-spiced chicken layered with seeraga samba rice', price: 280, cat: 1, image: IMG.biryani },
        { name: 'Chettinad Chicken Curry', description: 'Dry-roasted whole-spice chicken curry — fiery & fragrant', price: 320, cat: 1, image: IMG.chettinadChicken },
        { name: 'Pesarattu', description: 'Green moong dal crepe with ginger chutney & upma stuffing', price: 120, cat: 1, image: IMG.pesarattu },
        { name: 'Kerala Fish Curry', description: 'Karimeen in a tangy raw mango & coconut milk gravy', price: 340, cat: 1, image: IMG.fishCurry },
        { name: 'Avial', description: 'Mixed vegetables in a thick coconut-curd gravy, tempered with coconut oil', price: 170, cat: 1, image: IMG.avialCurry },
        { name: 'Pesara Pappu Dal', description: 'Andhra-style green moong dal tempered with dry red chilli & ghee', price: 160, cat: 1, image: IMG.palakDal },
        { name: 'Kothu Parotta', description: 'Shredded layered parotta stir-fried with egg, onion & spiced gravy', price: 210, cat: 1, image: IMG.kothuParotta },
        { name: 'Andhra Veg Thali', description: '7-item unlimited thali — rice, dal, sambar, rasam, 2 curries, curd', price: 220, cat: 1, image: IMG.thaliPlate },
        { name: 'Coconut Rice', description: 'Steamed rice tossed with freshly grated coconut & mustard seeds', price: 110, cat: 2, image: IMG.coconutRice },
        { name: 'Appam', description: 'Lacy fermented rice hoppers, best paired with stew or curry', price: 100, cat: 2, image: IMG.appam },
        { name: 'Beans Poriyal', description: 'Green beans stir-fried with coconut, mustard seeds & curry leaves', price: 90, cat: 2, image: IMG.poriyal },
        { name: 'Chutney Trio', description: 'Coconut, tomato & mint-coriander chutneys with fresh curry leaf oil', price: 60, cat: 2, image: IMG.chutneySet },
        { name: 'Pickle & Raita', description: 'House mango pickle with chilled cucumber raita', price: 70, cat: 2, image: IMG.pickleRaita },
        { name: 'Semiya Payasam', description: 'Vermicelli simmered in milk, cardamom, cashews & golden raisins', price: 100, cat: 3, image: IMG.payasam },
        { name: 'Carrot Halwa', description: 'Slow-cooked grated carrot in ghee, milk & khoya, topped with pistachios', price: 120, cat: 3, image: IMG.halwa },
        { name: 'Kesari Bath', description: 'Semolina sweet with saffron, ghee & cardamom — a Bangalore classic', price: 90, cat: 3, image: IMG.kesariBath },
        { name: 'Tender Coconut Ice Cream', description: 'Hand-churned tender coconut sorbet — light & tropical', price: 110, cat: 3, image: IMG.iceCream },
        { name: 'Mysore Pak', description: 'Melt-in-the-mouth gram flour & ghee fudge from the royal kitchens', price: 80, cat: 3, image: IMG.mysurePak },
        { name: 'Banana Sheera', description: 'Ripe banana & semolina pudding with jaggery and cardamom', price: 90, cat: 3, image: IMG.banana },
        { name: 'Spiced Buttermilk', description: 'Chilled churned curd with ginger, green chilli, coriander & mustard', price: 60, cat: 4, image: IMG.buttermilk },
        { name: 'Masala Chai', description: 'Kadak tea brewed with cardamom, ginger, cinnamon & jaggery', price: 60, cat: 4, image: IMG.masalaChai },
        { name: 'Mango Lassi', description: 'Thick Alphonso mango blended with full-fat curd & a hint of saffron', price: 100, cat: 4, image: IMG.mangoLassi },
        { name: 'Tender Coconut Water', description: 'Fresh green coconut served tableside — hydrating & natural', price: 80, cat: 4, image: IMG.coconutWater },
        { name: 'Filter Coffee', description: 'Classic South Indian filter decoction with full-cream milk & froth', price: 70, cat: 4, image: IMG.filterCoffee },
        { name: 'Panakam', description: 'Temple-style cold drink of jaggery, ginger, cardamom & pepper', price: 60, cat: 4, image: IMG.panakam },
    ];
    for (let i = 0; i < menuItemsData.length; i++) {
        const item = menuItemsData[i];
        await prisma.menuItem.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[item.cat].id,
                name: item.name,
                description: item.description,
                price: item.price,
                image_url: item.image,
                is_available: true,
                display_order: i,
            },
        });
    }
    const robotConfigs = [
        { name: 'CuboBot-1', battery: 100, location: { x: 0, y: 0 } },
        { name: 'CuboBot-2', battery: 87, location: { x: 2, y: 1 } },
        { name: 'CuboBot-3', battery: 72, location: { x: 4, y: 0 } },
        { name: 'CuboBot-4', battery: 55, location: { x: 1, y: 3 } },
    ];
    const robots = await Promise.all(robotConfigs.map((r) => prisma.robot.create({
        data: {
            restaurantId: restaurant.id,
            name: r.name,
            secretKey: generateSecretKey(),
            status: 'Idle',
            mode: 'Automatic',
            isOnline: false,
            battery: r.battery,
            location: r.location,
            cabinets: [
                { id: 'C1', status: 'Free' },
                { id: 'C2', status: 'Free' },
                { id: 'C3', status: 'Free' },
            ],
        },
    })));
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.createMany({
        data: [
            { restaurantId: restaurant.id, name: 'Restaurant Owner', user_id: 'owner01', password_hash: passwordHash, role: 'Owner' },
            { restaurantId: restaurant.id, name: 'Staff Member', user_id: 'staff01', password_hash: passwordHash, role: 'Staff' },
        ],
    });
    console.log('\n🎉 Seed complete!\n');
    console.log('──────────────────────────────────────────────');
    console.log(`Restaurant ID : ${restaurant.id}`);
    console.log(`Tables        : 12  (T1 – T12)`);
    console.log(`Menu Items    : ${menuItemsData.length}`);
    console.log(`Robots        : 4   (CuboBot-1 through CuboBot-4)`);
    console.log(`\n📋 Table IDs (first 3):`);
    tables.slice(0, 3).forEach((t, i) => console.log(`  T${i + 1}: ${t.id}`));
    console.log('\n🔐 Robot Credentials:');
    robots.forEach((r) => console.log(`  ${r.name}  |  ID: ${r.id}  |  key: ${r.secretKey}`));
    console.log(`\n🌐 Customer App URL (Table T1):`);
    console.log(`  http://localhost:5173/?r=${restaurant.id}&t=${tables[0].id}`);
    console.log(`\n🔑 Admin Login:`);
    console.log(`  Owner  →  userId=owner01   password=password123`);
    console.log(`  Staff  →  userId=staff01   password=password123`);
    console.log('──────────────────────────────────────────────');
}
seed()
    .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map