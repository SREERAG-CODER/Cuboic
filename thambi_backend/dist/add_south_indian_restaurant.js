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
const MENU_DATA = [
    {
        category: "BREAKFAST TIFFINS",
        items: [
            { name: "Idli Sambar", price: 40, image: "https://vaya.in/recipes/wp-content/uploads/2018/02/Idli-and-Sambar-1.jpg" },
            { name: "Ghee Roast Dosa", price: 80, image: "https://thumbs.dreamstime.com/b/ghee-roast-dosa-sambar-chutney-set-isolated-transparent-background-delicious-south-indian-meal-featuring-crispy-407921853.jpg" },
            { name: "Medu Vada", price: 50, image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/07/vada-recipe-1-500x500.jpg" },
            { name: "Upma", price: 45, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/10/upma-recipe.jpg" },
            { name: "Puri Saagu", price: 60, image: "https://www.spiceupthecurry.com/wp-content/uploads/2020/10/poori-recipe-2-500x500.jpg" }
        ]
    },
    {
        category: "MAIN COURSE",
        items: [
            { name: "Andhra Meals", price: 150, image: "https://static.vecteezy.com/system/resources/thumbnails/065/445/650/small/isolated-traditional-indian-thali-meal-free-photo.jpg" },
            { name: "Hyderabadi Chicken Dum Biryani", price: 250, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2012/10/chicken-dum-biryani.jpg" },
            { name: "Mutton Ghee Roast", price: 300, image: "https://myheartbeets.com/wp-content/uploads/2018/04/masala-egg-roast-instant-pot.jpg" },
            { name: "Bisi Bele Bath", price: 120, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/11/bisi-bele-bath-recipe.jpg" }
        ]
    },
    {
        category: "SNACKS & BEVERAGES",
        items: [
            { name: "Filter Coffee", price: 30, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/06/filter-coffee-recipe.jpg" },
            { name: "Mirchi Bajji", price: 40, image: "https://www.vegrecipesofindia.com/wp-content/uploads/2018/02/mirchi-bajji-recipe-1.jpg" },
            { name: "Punugulu", price: 35, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/01/punugulu-recipe.jpg" }
        ]
    }
];
async function addSouthIndianRestaurant() {
    console.log('🔗 Connecting to DB...');
    console.log(`🏗️ Creating South Indian Restaurant...`);
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Dakshin Delights',
            description: 'Authentic South Indian Cuisine',
            is_active: true
        }
    });
    console.log(`📍 Created Restaurant: ${restaurant.name} (${restaurant.id})`);
    console.log('🪑 Creating tables...');
    for (let i = 1; i <= 6; i++) {
        await prisma.table.create({
            data: {
                restaurantId: restaurant.id,
                table_number: `Table ${i}`,
                is_active: true
            }
        });
    }
    console.log('🚀 Populating menu...');
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
    console.log(`✅ successfully added South Indian restaurant, tables, and menu!`);
}
addSouthIndianRestaurant()
    .catch(e => {
    console.error('❌ Error adding restaurant:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add_south_indian_restaurant.js.map