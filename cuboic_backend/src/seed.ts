import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

function generateSecretKey() {
    return `robot-${Math.random().toString(36).substring(2, 12)}`;
}

// ── Real food image URLs ──────────────────────────────────────────────────
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

    // ── Clear existing data ──────────────────────────────────────────
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

    // ── Restaurant ───────────────────────────────────────────────────
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Thambi Kitchen',
            description: 'Robot-delivered dining experience',
            logo_url: '',
            is_active: true,
        },
    });

    // ── Tables — 12 total ────────────────────────────────────────────
    const tables = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
            prisma.table.create({
                data: {
                    restaurantId: restaurant.id,
                    table_number: `T${i + 1}`,
                    is_active: true,
                },
            })
        )
    );

    // ── Categories — 16 total ──────────────────────────────────────────────
    const catNames = [
        'Chicken Curries',
        'Veg Curries',
        'Egg Items',
        'Starters',
        'Tandoori',
        'Indian Breads',
        'Tiffins (AG Tiffins Menu)',
        'Dosas',
        'Pesarattu',
        'Others',
        'Chicken Biryani (UPDATED)',
        'Veg Biryani',
        'Fried Rice (UPDATED)',
        'Noodles',
        'Meals & Rice',
        'Evening Snacks'
    ];
    const categories = await Promise.all(
        catNames.map((name, i) =>
            prisma.category.create({
                data: {
                    restaurantId: restaurant.id,
                    name,
                    display_order: i,
                    is_active: true,
                },
            })
        )
    );

    // ── Menu Items ──────────────────────────────────────────────────
    const menuItemsData = [
        // Chicken Curries (cat 0)
        { name: 'Chilli Chicken', price: 200, cat: 0, image: IMG.chettinadChicken },
        { name: 'Kadai Chicken', price: 200, cat: 0, image: IMG.chettinadChicken },
        { name: 'Boneless Chicken', price: 190, cat: 0, image: IMG.chettinadChicken },
        { name: 'Punjabi Chicken (Full)', price: 280, cat: 0, image: IMG.chettinadChicken },
        { name: 'Punjabi Chicken (Half)', price: 150, cat: 0, image: IMG.chettinadChicken },
        { name: 'Ramba Chicken (Full)', price: 280, cat: 0, image: IMG.chettinadChicken },
        { name: 'Ramba Chicken (Half)', price: 150, cat: 0, image: IMG.chettinadChicken },
        { name: 'Mughlai Chicken (Full)', price: 280, cat: 0, image: IMG.chettinadChicken },
        { name: 'Mughlai Chicken (Half)', price: 180, cat: 0, image: IMG.chettinadChicken },
        { name: 'Butter Chicken (Full)', price: 280, cat: 0, image: IMG.chettinadChicken },
        { name: 'Butter Chicken (Half)', price: 180, cat: 0, image: IMG.chettinadChicken },

        // Veg Curries (cat 1)
        { name: 'Gobi Curry', price: 120, cat: 1, image: IMG.avialCurry },
        { name: 'Chilli Gobi', price: 130, cat: 1, image: IMG.avialCurry },
        { name: 'Chilli Paneer', price: 150, cat: 1, image: IMG.avialCurry },
        { name: 'Mixed Veg Curry', price: 150, cat: 1, image: IMG.avialCurry },
        { name: 'Paneer Curry', price: 150, cat: 1, image: IMG.avialCurry },
        { name: 'Kaju Paneer', price: 180, cat: 1, image: IMG.avialCurry },
        { name: 'Kadai Paneer', price: 180, cat: 1, image: IMG.avialCurry },
        { name: 'Paneer Butter Masala', price: 180, cat: 1, image: IMG.avialCurry },
        { name: 'Methi Chaman', price: 180, cat: 1, image: IMG.avialCurry },

        // Egg Items (cat 2)
        { name: 'Egg Bhurji', price: 100, cat: 2, image: IMG.kothuParotta },
        { name: 'Egg Curry', price: 120, cat: 2, image: IMG.kothuParotta },
        { name: 'Egg Roast', price: 130, cat: 2, image: IMG.kothuParotta },
        { name: 'Egg 65', price: 150, cat: 2, image: IMG.kothuParotta },
        { name: 'Egg Chilli', price: 160, cat: 2, image: IMG.kothuParotta },
        { name: 'Omelette', price: 50, cat: 2, image: IMG.kothuParotta },

        // Starters (cat 3)
        { name: 'Gobi 65', price: 120, cat: 3, image: IMG.bondaBajji },
        { name: 'Paneer 65', price: 180, cat: 3, image: IMG.bondaBajji },
        { name: 'Veg Manchuria', price: 120, cat: 3, image: IMG.bondaBajji },
        { name: 'Chicken Manchuria', price: 170, cat: 3, image: IMG.bondaBajji },
        { name: 'Kaju Chicken', price: 200, cat: 3, image: IMG.bondaBajji },
        { name: 'Chicken Lollipop', price: 230, cat: 3, image: IMG.bondaBajji },

        // Tandoori (cat 4)
        { name: 'Tandoori Chicken (Quarter)', price: 130, cat: 4, image: IMG.biryani },
        { name: 'Tandoori Chicken (Half)', price: 260, cat: 4, image: IMG.biryani },
        { name: 'Tandoori Chicken (Full)', price: 520, cat: 4, image: IMG.biryani },
        { name: 'Al Faham (Quarter)', price: 110, cat: 4, image: IMG.biryani },
        { name: 'Al Faham (Half)', price: 220, cat: 4, image: IMG.biryani },
        { name: 'Al Faham (Full)', price: 440, cat: 4, image: IMG.biryani },
        { name: 'Paneer Tikka Masala', price: 180, cat: 4, image: IMG.biryani },
        { name: 'Chicken Tikka Masala', price: 180, cat: 4, image: IMG.biryani },

        // Indian Breads (cat 5)
        { name: 'Porota', price: 10, cat: 5, image: IMG.appam },
        { name: 'Tandoori Roti', price: 15, cat: 5, image: IMG.appam },
        { name: 'Butter Roti', price: 20, cat: 5, image: IMG.appam },
        { name: 'Butter Naan', price: 30, cat: 5, image: IMG.appam },
        { name: 'Normal Naan', price: 25, cat: 5, image: IMG.appam },
        { name: 'Chapati (2)', price: 30, cat: 5, image: IMG.appam },

        // Tiffins (cat 6)
        { name: 'Idly', price: 40, cat: 6, image: IMG.idli },
        { name: 'Sambar Idly', price: 50, cat: 6, image: IMG.idli },
        { name: 'Ghee Podi Idly', price: 40, cat: 6, image: IMG.idli },
        { name: 'Mysore Bonda', price: 40, cat: 6, image: IMG.bondaBajji },
        { name: 'Vada', price: 40, cat: 6, image: IMG.vadai },
        { name: 'Sambar Vada', price: 50, cat: 6, image: IMG.vadai },
        { name: 'Perugu Vada', price: 30, cat: 6, image: IMG.vadai },

        // Dosas (cat 7)
        { name: 'Plain Dosa', price: 40, cat: 7, image: IMG.dosa },
        { name: 'Onion Dosa', price: 50, cat: 7, image: IMG.uttapam },
        { name: 'Egg Dosa', price: 60, cat: 7, image: IMG.dosa },
        { name: 'Double Egg Dosa', price: 70, cat: 7, image: IMG.dosa },
        { name: 'Ghee Roast Dosa', price: 70, cat: 7, image: IMG.gheeRoastDosa },
        { name: 'Ghee Masala Dosa', price: 70, cat: 7, image: IMG.gheeRoastDosa },
        { name: 'Ghee Podi Dosa', price: 70, cat: 7, image: IMG.gheeRoastDosa },
        { name: 'Paneer Dosa', price: 70, cat: 7, image: IMG.dosa },
        { name: 'Set Dosa', price: 100, cat: 7, image: IMG.dosa },
        { name: 'Uttapam', price: 60, cat: 7, image: IMG.uttapam },
        { name: 'Upma Dosa', price: 70, cat: 7, image: IMG.dosa },

        // Pesarattu (cat 8)
        { name: 'Plain Pesarattu', price: 50, cat: 8, image: IMG.pesarattu },
        { name: 'Masala Pesarattu', price: 70, cat: 8, image: IMG.pesarattu },
        { name: 'Onion Pesarattu', price: 60, cat: 8, image: IMG.pesarattu },
        { name: 'Upma Pesarattu', price: 80, cat: 8, image: IMG.pesarattu },

        // Others (cat 9)
        { name: 'Puri (2 pcs)', price: 50, cat: 9, image: IMG.appam },
        { name: 'Chapati (2 pcs)', price: 50, cat: 9, image: IMG.appam },

        // Chicken Biryani (cat 10)
        { name: 'Kebab Biryani', price: 150, cat: 10, image: IMG.biryani },
        { name: 'Dum Biryani', price: 160, cat: 10, image: IMG.biryani },
        { name: 'Fry Piece Biryani', price: 160, cat: 10, image: IMG.biryani },
        { name: 'Boneless Biryani', price: 180, cat: 10, image: IMG.biryani },
        { name: 'Tandoori Biryani', price: 220, cat: 10, image: IMG.biryani },
        { name: 'Al Faham Biryani', price: 210, cat: 10, image: IMG.biryani },
        { name: 'Lollipop Biryani', price: 200, cat: 10, image: IMG.biryani },
        { name: 'Star Chicken Biryani', price: 200, cat: 10, image: IMG.biryani },
        { name: 'Mughlai Biryani', price: 250, cat: 10, image: IMG.biryani },
        { name: 'Chicken Tikka Biryani', price: 200, cat: 10, image: IMG.biryani },
        { name: 'Mutton Biryani', price: 280, cat: 10, image: IMG.biryani },
        { name: 'Egg Biryani', price: 140, cat: 10, image: IMG.biryani },

        // Veg Biryani (cat 11)
        { name: 'Veg Biryani', price: 130, cat: 11, image: IMG.biryani },
        { name: 'Paneer Biryani', price: 160, cat: 11, image: IMG.biryani },
        { name: 'Kaju Paneer Biryani', price: 180, cat: 11, image: IMG.biryani },
        { name: 'Paneer Tikka Biryani', price: 200, cat: 11, image: IMG.biryani },

        // Fried Rice (cat 12)
        { name: 'Veg Fried Rice', price: 100, cat: 12, image: IMG.coconutRice },
        { name: 'Gobi Fried Rice', price: 70, cat: 12, image: IMG.coconutRice },
        { name: 'Egg Gobi Fried Rice', price: 130, cat: 12, image: IMG.coconutRice },
        { name: 'Double Egg Fried Rice', price: 140, cat: 12, image: IMG.coconutRice },
        { name: 'Kaju Fried Rice', price: 160, cat: 12, image: IMG.coconutRice },
        { name: 'Paneer Fried Rice', price: 150, cat: 12, image: IMG.coconutRice },
        { name: 'Chicken Fried Rice', price: 140, cat: 12, image: IMG.coconutRice },

        // Noodles (cat 13)
        { name: 'Egg Noodles', price: 120, cat: 13, image: IMG.kothuParotta },
        { name: 'Double Egg Noodles', price: 130, cat: 13, image: IMG.kothuParotta },
        { name: 'Chicken Noodles', price: 130, cat: 13, image: IMG.kothuParotta },

        // Meals & Rice (cat 14)
        { name: 'Veg Meals', price: 100, cat: 14, image: IMG.thaliPlate },
        { name: 'Non-Veg Meals', price: 150, cat: 14, image: IMG.thaliPlate },
        { name: 'White Rice', price: 70, cat: 14, image: IMG.coconutRice },
        { name: 'Jeera Rice', price: 70, cat: 14, image: IMG.coconutRice },
        { name: 'Tomato Rice', price: 70, cat: 14, image: IMG.coconutRice },
        { name: 'Biryani Rice', price: 90, cat: 14, image: IMG.biryani },

        // Evening Snacks (cat 15)
        { name: 'Chinna Punugulu', price: 40, cat: 15, image: IMG.bondaBajji },
        { name: 'Mirchi Bajji', price: 30, cat: 15, image: IMG.bondaBajji },
        { name: 'Egg Bonda', price: 30, cat: 15, image: IMG.bondaBajji },
    ];

    for (let i = 0; i < menuItemsData.length; i++) {
        const item = menuItemsData[i];
        await prisma.menuItem.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[item.cat].id,
                name: item.name,
                description: (item as any).description || '',
                price: item.price,
                image_url: item.image,
                is_available: true,
                display_order: i,
            },
        });
    }

    // ── Robots — 4 total ─────────────────────────────────────────────
    const robotConfigs = [
        { name: 'CuboBot-1', battery: 100, location: { x: 0, y: 0 } },
        { name: 'CuboBot-2', battery: 87, location: { x: 2, y: 1 } },
        { name: 'CuboBot-3', battery: 72, location: { x: 4, y: 0 } },
        { name: 'CuboBot-4', battery: 55, location: { x: 1, y: 3 } },
    ];

    const robots = await Promise.all(
        robotConfigs.map((r) =>
            prisma.robot.create({
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
            })
        )
    );

    // ── Users ────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.createMany({
        data: [
            { restaurantId: restaurant.id, name: 'Restaurant Owner', user_id: 'owner01', password_hash: passwordHash, role: 'Owner' },
            { restaurantId: restaurant.id, name: 'Staff Member', user_id: 'staff01', password_hash: passwordHash, role: 'Staff' },
        ],
    });

    // ── Summary ──────────────────────────────────────────────────────
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