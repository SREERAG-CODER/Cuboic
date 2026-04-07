import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const RESTAURANT_ID = 'clrzmockrest000000test000'; 
const TABLE_IDS = [
    'clrzmocktab00001test000',
    'clrzmocktab00002test000',
    'clrzmocktab00003test000',
    'clrzmocktab00004test000',
];

const MENU_DATA = [
    {
        category: "MOCK STARTERS",
        items: [
            { name: "MOCK SOUP", price: 120, image: "https://example.com/soup.jpg" },
            { name: "SPRING ROLLS", price: 150, image: "https://example.com/springrolls.jpg" }
        ]
    },
    {
        category: "MOCK MAIN COURSE",
        items: [
            { name: "MOCK CHICKEN CURRY", price: 250, image: "https://example.com/chicken.jpg" },
            { name: "MOCK VEG BIRYANI", price: 220, image: "https://example.com/paneer.jpg" }
        ]
    }
];

async function addMockRestaurant() {
    console.log('🔗 Connecting to DB...');
    
    console.log(`🏗️ Creating restaurant with ID ${RESTAURANT_ID}...`);
    const restaurant = await prisma.restaurant.create({
        data: {
            id: RESTAURANT_ID,
            name: 'THE MOCK RESTAURANT',
            description: 'A mock restaurant for testing purposes',
            is_active: true
        }
    });

    console.log(`📍 Created Restaurant: ${restaurant.name} (${restaurant.id})`);

    console.log('🪑 Creating mock tables...');
    for (let i = 0; i < TABLE_IDS.length; i++) {
        const tableId = TABLE_IDS[i];
        const tableNumber = `T${i + 1}`;
        await prisma.table.create({
            data: { id: tableId, restaurantId: restaurant.id, table_number: tableNumber, is_active: true }
        });
    }

    console.log('🚀 Populating mock menu...');
    for (let i = 0; i < MENU_DATA.length; i++) {
        const catData = MENU_DATA[i];
        const category = await prisma.category.create({
            data: {
                restaurantId: restaurant.id,
                name: catData.category,
                display_order: i,
                is_active: true
            }
        });

        for (let j = 0; j < catData.items.length; j++) {
            const itemData = catData.items[j];
            await prisma.menuItem.create({
                data: {
                    restaurantId: restaurant.id,
                    categoryId: category.id,
                    name: itemData.name,
                    price: itemData.price,
                    image_url: itemData.image,
                    is_available: true,
                    display_order: j
                }
            });
        }
    }

    console.log('✅ Mock restaurant, tables, and menu added successfully!');
}

addMockRestaurant()
    .catch(e => {
        console.error('❌ Error adding mock restaurant:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
