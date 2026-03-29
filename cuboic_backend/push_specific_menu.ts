import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const RESTAURANT_ID = 'cmmg60qir0000c2lwao9t1z9m';
const TABLE_IDS = [
    'cmmg60r5k0002c2lwbvxfyg2w',
    'cmmg60t4g0004c2lwb5466213',
    'cmmg60t4h0006c2lw33g5vmks',
    'cmmg60t4h0009c2lwhnwxsbr0',
    'cmmg60t4h000ac2lwj8kanmyu',
    'cmmg60t4h000dc2lwyt0b507p',
    'cmmg60t4h000fc2lwzw3cjheb',
    'cmmg60t4h000gc2lwwnwfzuyq',
    'cmmg60t4h000ic2lwkp94a8z4',
    'cmmg60t4i000lc2lwq4sglhwz',
    'cmmg60t4i000nc2lw2v6tyq8n',
    'cmmg60t4i000oc2lwdzdodk9w',
    'cmn0f3wm20006dj2bcnt2ocrh'
];

const MENU_DATA = [
    {
        category: "AG TIFFINS MENU",
        items: [
            { name: "IDLI SAMBAR", price: 50, image: "https://vaya.in/recipes/wp-content/uploads/2018/02/Idli-and-Sambar-1.jpg" },
            { name: "IDLY", price: 40, image: "https://tayyaarfoods.com/wp-content/uploads/2020/02/idly-podi-image.jpg" },
            { name: "GHEE PODI IDLY", price: 40, image: "https://cdn.uengage.io/uploads/64296/image-2351-1758286090.jpg" },
            { name: "VADA", price: 40, image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/07/vada-recipe-1-500x500.jpg" },
            { name: "SAMBAR VADA", price: 50, image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/07/vada-sambar-1.jpg" },
            { name: "CURD VADA", price: 30, image: "https://vaya.in/recipes/wp-content/uploads/2018/02/Dahi-Vada.jpg" }, // matched with Perugu Vada
            { name: "PLAIN DOSA", price: 40, image: "https://www.cubesnjuliennes.com/wp-content/uploads/2023/10/Crispy-Plain-Dosa-Recipe-1.jpg" },
            { name: "ONION DOSA", price: 50, image: "https://images.jdmagicbox.com/justdial/icons/website/dishes/onion_dosa.jpg" },
            { name: "MASALA DOSA", price: 70, image: "https://vismaifood.com/storage/app/uploads/public/8b4/19e/427/thumb__1200_0_0_0_auto.jpg" },
            { name: "DOUBLE EGG DOSA", price: 70, image: "https://thumbs.dreamstime.com/b/delicious-masala-dosa-sides-vibrant-generated-ai-south-indian-crepe-filled-spiced-potatoes-vegetables-served-383817116.jpg" },
            { name: "EGG DOSA", price: 60, image: "https://vismaifood.com/storage/app/uploads/public/a95/608/610/thumb__1200_0_0_0_auto.jpg" },
            { name: "GHEE ROAST DOSA", price: 70, image: "https://thumbs.dreamstime.com/b/ghee-roast-dosa-sambar-chutney-set-isolated-transparent-background-delicious-south-indian-meal-featuring-crispy-407921853.jpg" },
            { name: "GHEE MASALA DOSA", price: 70, image: "https://static.wixstatic.com/media/a94a23_dd6b850649604f9ba9dec70155c950eb~mv2.jpg/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/a94a23_dd6b850649604f9ba9dec70155c950eb~mv2.jpg" },
            { name: "GHEE PODI DASA", price: 70, image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoCWkSO8NA9x48BwxTqrjXMlDzXU1wRkuIJICSxMwYmtH8OyMUbmUB4EHVPtN0KBFY8YeuDT0Ged3YP1T_rJNRAoy_3-maUTKzKSf5Yq71-h8WwfBuz-6vRIqf98QU6t2D32mTszYcLjg/s1600/II1A2899.JPG" },
            { name: "PANEER DOSA", price: 70, image: "https://www.carveyourcraving.com/wp-content/uploads/2018/08/paneer-masala-for-dosa-recipe-blog.jpg" },
            { name: "SET DOSA", price: 100, image: "https://vanitascorner.com/wp-content/uploads/2021/10/Set-Dosa.jpg" },
            { name: "UTTAPAM", price: 60, image: "https://www.sharmispassions.com/wp-content/uploads/2012/10/OnionUttapam2.jpg" },
            { name: "UPMA DOSA", price: 70, image: "https://res.cloudinary.com/roundglass/image/upload/v1753187552/rg/collective/media/rg-food-in-upma-mla-pesarattu-rakesh-raghunathan-may2022-001-16x9-1753187551759.jpg" },
            { name: "PESARA DOSA ( PLAIN )", price: 50, image: "https://ssbhotel.suregrowth.in/wp-content/uploads/2024/06/img_0736-1.jpeg" },
            { name: "PESARA DOSA ( MASALA )", price: 70, image: "https://static.s123-cdn-static-c.com/uploads/2101965/2000_5e8f36c4c8d8c.jpg" },
            { name: "PESARA DOSA ( ONION )", price: 60, image: "https://cdn1.foodviva.com/static-content/food-images/andhra-recipes/pesarattu/pesarattu.jpg" },
            { name: "UPMA PESARATTU", price: 80, image: "https://d3ox4wjkl7mf3m.cloudfront.net/recipe/80J3A5yfb61Udgiko3ojtdGaCYfEC87gH7wPMv5l.jpg" },
            { name: "PURI", price: 50, image: "https://www.spiceupthecurry.com/wp-content/uploads/2020/10/poori-recipe-2-500x500.jpg" },
            { name: "CHAPATI", price: 30, image: "https://www.krumpli.co.uk/wp-content/uploads/2023/05/Homemade-Indian-Chapati-02-735x735.jpg" }
        ]
    },
    {
        category: "EVENING SNACKS MENU",
        items: [
            { name: "CHINNA PUNUGULU", price: 40, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/01/punugulu-recipe.jpg" },
            { name: "MIRCHI BAJJI", price: 30, image: "https://www.vegrecipesofindia.com/wp-content/uploads/2018/02/mirchi-bajji-recipe-1.jpg" },
            { name: "EGG BONDA", price: 30, image: "https://i.timesnowhindi.com/stories/Egg-bonda.jpg" }
        ]
    },
    {
        category: "CHICKEN CURRY",
        items: [
            { name: "CHILLI CHICKEN", price: 200, image: "https://www.easycookingwithmolly.com/wp-content/uploads/2021/04/easy-indian-chilli-chicken-recipe-dry-480x480.jpg" },
            { name: "KADAI CHICKEN", price: 200, image: "https://www.whiskaffair.com/wp-content/uploads/2020/09/Kadai-Chicken-2-3.jpg" },
            { name: "BONELESS CHICKEN", price: 190, image: "https://kitchenswagger.com/wp-content/uploads/2016/10/honey-buffalo-wings-2.jpg" },
            { name: "PUNJABI CHICKEN (FULL)", price: 280, image: "https://www.whiskaffair.com/wp-content/uploads/2022/07/Tariwala-Chicken-2-3-500x500.jpg" },
            { name: "PUNJABI CHICKEN (HALF)", price: 150, image: "https://www.whiskaffair.com/wp-content/uploads/2022/07/Tariwala-Chicken-2-3-500x500.jpg" },
            { name: "RAMBHA CHICKEN (FULL)", price: 280, image: "https://cdn.dotpe.in/longtail/store-items/7002774/I95FwvuB.jpeg" },
            { name: "RAMBHA CHICKEN (HALF)", price: 150, image: "https://cdn.dotpe.in/longtail/store-items/7002774/I95FwvuB.jpeg" },
            { name: "MUGHLAI CHICKEN (FULL)", price: 280, image: "https://pipingpotcurry.com/wp-content/uploads/2024/01/Mughlai-Chicken-Korma-Piping-Pot-Curry.jpg" },
            { name: "MUGHLAI CHICKEN (HALF)", price: 180, image: "https://pipingpotcurry.com/wp-content/uploads/2024/01/Mughlai-Chicken-Korma-Piping-Pot-Curry.jpg" },
            { name: "BUTTER CHICKEN (FULL)", price: 280, image: "https://www.mysavoryadventures.com/wp-content/uploads/2023/04/restaurant-style-butter-chicken.jpg" },
            { name: "BUTTER CHICKEN (HALF)", price: 180, image: "https://www.mysavoryadventures.com/wp-content/uploads/2023/04/restaurant-style-butter-chicken.jpg" }
        ]
    },
    {
        category: "VEG CURRIES",
        items: [
            { name: "GOPI CURRY", price: 120, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2024/04/gobi-masala-cauliflower-masala.jpg" },
            { name: "CHILLI GOPY", price: 130, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScwqnN1f1nwovLlhL0IKyk51jTyEwBpsS_DA&s" },
            { name: "CHILLI PANEER", price: 150, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/02/chilli-paneer-recipe.jpg" },
            { name: "MIXED VEG CURRY", price: 150, image: "https://shwetainthekitchen.com/wp-content/uploads/2023/03/mixed-vegetable-curry.jpg" },
            { name: "PANEER CURRY", price: 150, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/02/paneer-curry-recipe.jpg" },
            { name: "KAJU PANEER", price: 180, image: "https://thespiceadventuress.com/wp-content/uploads/2013/12/22.jpg" },
            { name: "KADAI PANEER", price: 180, image: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/03/Best-Kadai-Paneer-Recipe.jpg" },
            { name: "PANEER BUTTER MASALA", price: 180, image: "https://myfoodstory.com/wp-content/uploads/2021/07/restaurant-style-paneer-butter-masala-2-500x500.jpg" },
            { name: "METHI CHAMAN", price: 180, image: "https://vismaifood.com/storage/app/uploads/public/d11/aad/b97/thumb__1200_0_0_0_auto.jpg" }
        ]
    },
    {
        category: "EGG ITEMS",
        items: [
            { name: "EGG BHURJI", price: 100, image: "https://spicecravings.com/wp-content/uploads/2023/03/Egg-Bhurji-Featured-1-500x500.jpg" },
            { name: "EGG CURRY", price: 120, image: "https://allwaysdelicious.com/wp-content/uploads/2024/12/egg-curry-in-pan-11.jpg" },
            { name: "EGG ROAST", price: 130, image: "https://myheartbeets.com/wp-content/uploads/2018/04/masala-egg-roast-instant-pot.jpg" },
            { name: "EGG 65", price: 150, image: "https://c.ndtvimg.com/2022-03/gfiouu7g_egg-65_625x300_04_March_22.jpg" },
            { name: "EGG CHILLI", price: 160, image: "https://www.licious.in/blog/wp-content/uploads/2021/11/shutterstock_2004853295.jpg" },
            { name: "OMELETE", price: 50, image: "https://www.healthyfood.com/wp-content/uploads/2018/02/Basic-omelette.jpg" }
        ]
    },
    {
        category: "STARTER’S",
        items: [
            { name: "GOPI 65", price: 120, image: "https://www.sharmispassions.com/wp-content/uploads/2021/11/gobi-65-recipe3.jpg" },
            { name: "PANEER 65", price: 180, image: "https://sinfullyspicy.com/wp-content/uploads/2024/11/3-3.jpg" },
            { name: "VEG MANCHURIYA", price: 120, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/veg-manchurian.jpg" },
            { name: "KAJU CHICKEN", price: 200, image: "https://burmawalakitchen.com/wp-content/uploads/2024/07/Cashew-Chicken-Curry-5.jpg" },
            { name: "CHICKEN LOLLIPOP", price: 230, image: "https://www.cafegoldenfeast.com/wp-content/uploads/2025/01/Chicken-Lollipop.jpg" },
            { name: "CHICKEN MANCHURIA", price: 170, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/veg-manchurian.jpg" } // Note: original list was Veg Manchuria, user added Chicken Manchuria here
        ]
    },
    {
        category: "TANDOORI",
        items: [
            { name: "TANDOORI CHICKEN (FULL)", price: 520, image: "https://static01.nyt.com/images/2024/05/16/multimedia/fs-tandoori-chicken-hmjq/fs-tandoori-chicken-hmjq-mediumSquareAt3X.jpg" },
            { name: "TANDOORI CHICKEN (HALF)", price: 260, image: "https://static01.nyt.com/images/2024/05/16/multimedia/fs-tandoori-chicken-hmjq/fs-tandoori-chicken-hmjq-mediumSquareAt3X.jpg" },
            { name: "TANDOORI CHICKEN (QUARTER)", price: 130, image: "https://static01.nyt.com/images/2024/05/16/multimedia/fs-tandoori-chicken-hmjq/fs-tandoori-chicken-hmjq-mediumSquareAt3X.jpg" },
            { name: "AL FAHAM (FULL)", price: 440, image: "https://theodehlicious.com/wp-content/uploads/2024/04/Al-faham-Chicken-Recipe-II.jpg" },
            { name: "AL FAHAM (HALF)", price: 220, image: "https://theodehlicious.com/wp-content/uploads/2024/04/Al-faham-Chicken-Recipe-II.jpg" },
            { name: "AL FAHAM (QUARTER)", price: 110, image: "https://theodehlicious.com/wp-content/uploads/2024/04/Al-faham-Chicken-Recipe-II.jpg" },
            { name: "PANEER TIKKA MASALA", price: 180, image: "https://s3.amazonaws.com/static.realcaliforniamilk.com/media/recipes_2/paneer-tikka-masala.jpg" },
            { name: "CHICKEN TIKKA MASALA", price: 180, image: "https://bellyfull.net/wp-content/uploads/2021/05/Chicken-Tikka-Masala-blog-featured.jpg" }
        ]
    },
    {
        category: "INDIAN BREADS",
        items: [
            { name: "POROTTA", price: 10, image: "https://availeverything.com/public/uploads/all/QQK9Z7qhBO3XoE5qsm7jFFunidmUBG5qi06YHJTF.jpg" },
            { name: "TANDOORI ROTI", price: 15, image: "https://i.pinimg.com/736x/83/83/34/8383344645d480fdd68f6957dbda48f9.jpg" },
            { name: "BUTTER ROTI", price: 20, image: "https://www.cookwithmanali.com/wp-content/uploads/2021/07/Tandoori-Roti-500x500.jpg" },
            { name: "BUTTER NAAN", price: 30, image: "https://bakerstable.net/wp-content/uploads/2021/02/homemade-naan-26-e1613344346440.jpg" },
            { name: "NORMAL NAAN", price: 25, image: "https://www.vegrecipesofindia.com/wp-content/uploads/2025/05/naan-3.jpg" },
            { name: "CHAPATI", price: 30, image: "https://www.krumpli.co.uk/wp-content/uploads/2023/05/Homemade-Indian-Chapati-02-735x735.jpg" } // Note: original list has Chapati(2) and Chapati(2 pcs), will use the 30 price here 
        ]
    },
    {
        category: "FRIED RICE (BASMATI)",
        items: [
            { name: "FRIED RICE WITH BASMATI RICE", price: 100, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2020/12/fried-rice.jpg" }
        ]
    },
    {
        category: "TIFFINS",
        items: [
            { name: "MYSORE BONDA", price: 40, image: "https://i.ytimg.com/vi/Oy0rfD3G3IY/maxresdefault.jpg" },
            { name: "PLAIN DOSA", price: 40, image: "https://www.cubesnjuliennes.com/wp-content/uploads/2023/10/Crispy-Plain-Dosa-Recipe-1.jpg" },
            { name: "ONION DOSA", price: 50, image: "https://images.jdmagicbox.com/justdial/icons/website/dishes/onion_dosa.jpg" },
            { name: "MASALA DOSA", price: 70, image: "https://vismaifood.com/storage/app/uploads/public/8b4/19e/427/thumb__1200_0_0_0_auto.jpg" },
            { name: "DOUBLE EGG DOSA", price: 70, image: "https://thumbs.dreamstime.com/b/delicious-masala-dosa-sides-vibrant-generated-ai-south-indian-crepe-filled-spiced-potatoes-vegetables-served-383817116.jpg" },
            { name: "SINGLE EGG DOSA", price: 60, image: "https://vismaifood.com/storage/app/uploads/public/a95/608/610/thumb__1200_0_0_0_auto.jpg" }, // Based on Egg Dosa price
            { name: "KARAM DOSA", price: 50, image: "https://www.us2guntur.com/images//10071img/palyamdosa_B_140323.jpg" }, // Missing explicit price, estimated 50
            { name: "GHEE KARAM DOSA", price: 70, image: "https://m.media-amazon.com/images/X/bxt1/M/9bxt1RvhbHJPet8._SL828_QL90_FMwebp_.jpg" }, // Missing explicit price, estimated 70
            { name: "POROTTA WITH CHICKEN", price: 150, image: "https://images.slurrp.com/webstories/wp-content/uploads/2023/03/4.-Malabar-Parotta-with-Kerala-beef-curry.jpg" }, // Missing explicit price, estimated 150
            { name: "POROTTA WITH PANEER", price: 150, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/02/paneer-paratha.jpg" } // Missing explicit price, estimated 150
        ]
    },
    {
        category: "CHICKEN BIRIYANI",
        items: [
            { name: "KABAB BIRIYANI", price: 150, image: "https://thumbs.dreamstime.com/b/floating-kabab-biryani-white-plate-generative-ai-322794047.jpg" },
            { name: "DUM BIRIYANI", price: 160, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2012/10/chicken-dum-biryani.jpg" },
            { name: "FRY PIECE BIRIYANI", price: 160, image: "https://www.indianrecipeinfo.com/wp-content/uploads/2023/03/andhra-chicken-fry-piece-biryani-500x500.jpg" },
            { name: "BONELESS BIRIYANI", price: 180, image: "https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani-5.jpg" },
            { name: "TANDOORI BIRIYANI", price: 220, image: "https://m.media-amazon.com/images/X/bxt1/M/ubxt1BzTog8xnyn._SL828_QL90_FMwebp_.jpg" },
            { name: "AL FAHAM BIRIYANI", price: 210, image: "https://b.zmtcdn.com/data/dish_photos/45d/c0906665f1ae7d55ef45cf8454a8845d.jpeg" },
            { name: "LOLLIPOP BIRIYANI", price: 200, image: "https://jeyporedukaan.in/wp-content/uploads/2025/03/chicken-lollipop-biryani.jpg" },
            { name: "STAR CHICKEN BIRIYANI", price: 200, image: "https://palatesdesire.com/wp-content/uploads/2022/05/ambur-chicken-biryani-recipe@palates-desire.jpg" },
            { name: "MUGHAI BIRIYANI", price: 250, image: "https://www.easycookingwithmolly.com/wp-content/uploads/2020/04/egg-biryani-pressure-cooker-mughlai.jpg" },
            { name: "CHICKEN TIKKA BIRIYANI", price: 200, image: "https://img-global.cpcdn.com/recipes/a2e184a8a35047fc/680x781cq80/chicken-tikka-biryani-recipe-main-photo.jpg" },
            { name: "MUTTON BIRIYANI", price: 280, image: "https://sinfullyspicy.com/wp-content/uploads/2023/12/1200-by-1200-images-2.jpg" },
            { name: "EGG BIRIYANI", price: 140, image: "https://sinfullyspicy.com/wp-content/uploads/2025/04/1200-by-1200-images-2.jpg" }
        ]
    },
    {
        category: "VEG BIRIYANI",
        items: [
            { name: "VEG BIRIYANI", price: 130, image: "https://madhurasrecipe.com/wp-content/uploads/2023/03/Veg-Biryani-2.jpg" },
            { name: "PANEER BIRIYANI", price: 160, image: "https://happietrio.com/wp-content/uploads/2019/04/PaneerBiryani1.jpg" },
            { name: "KAJU PANEER BIRIYANI", price: 180, image: "https://ministryofcurry.com/wp-content/uploads/2023/10/paneer-biryani_-9.jpg" },
            { name: "PANEER TIKKA BIRIYANI", price: 200, image: "https://orders.popskitchen.in/storage/2024/09/image-285.png" }
        ]
    },
    {
        category: "MEALS & RICE",
        items: [
            { name: "VEG MEALS", price: 100, image: "https://static.vecteezy.com/system/resources/thumbnails/065/445/650/small/isolated-traditional-indian-thali-meal-free-photo.jpg" },
            { name: "NON VEG MEALS", price: 150, image: "https://i.ytimg.com/vi/m9j9qSXbs_4/maxresdefault.jpg" },
            { name: "WHITE RICE", price: 70, image: "https://www.marthastewart.com/thmb/ts80O6Fy1XyD66-QKjM9AweAh4o=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/perfect-white-rice-7-ef73aef3b89c42008d409441071502fb.jpg" },
            { name: "JEERA RICE", price: 70, image: "https://lentillovingfamily.com/wp-content/uploads/2025/08/jeera-rice-1-500x500.jpg" },
            { name: "TOMATO RICE", price: 70, image: "https://cookilicious.com/wp-content/uploads/2025/09/tomato-rice-recipe00025-scaled.jpg" },
            { name: "BIRIYANI RICE", price: 90, image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/02/biryani-rice-kuska-recipe.jpg" }
        ]
    },
    {
        category: "FRIED RICE",
        items: [
            { name: "VEG FRIED RICE", price: 100, image: "https://www.whiskaffair.com/wp-content/uploads/2018/11/Vegetable-Fried-Rice-2-3.jpg" },
            { name: "GOBI FRIED RICE", price: 70, image: "https://cookingfromheart.com/wp-content/uploads/2021/10/Gobi-Fried-Rice-5.jpg" },
            { name: "EGG GOBI FRIED RICE", price: 130, image: "https://d2gtpjxvvd720b.cloudfront.net/system/recipe/image/2148/retina_hg-cauliflower-fried-rice-breakfast-bowl-20170919-1523-3709-5576.jpg" },
            { name: "DOUBLE EGG FRIED RICE", price: 140, image: "https://www.sharmispassions.com/wp-content/uploads/2013/04/EggFriedRice4-500x500.jpg" },
            { name: "KAJU FRIED RICE", price: 160, image: "https://cookthisagainmom.com/wp-content/uploads/2023/09/cashew-fried-rice-feautred-2.jpg" },
            { name: "PANEER FRIED RICE", price: 150, image: "https://www.indianveggiedelight.com/wp-content/uploads/2023/09/paneer-fried-rice-featured.jpg" },
            { name: "CHICKEN FRIED RICE", price: 140, image: "https://iamhomesteader.com/wp-content/uploads/2025/05/Bang-Bang-Chicken-Fried-Rice-2.jpg" }
        ]
    },
    {
        category: "NOODLES",
        items: [
            { name: "EGG NOODLES", price: 120, image: "https://www.sharmispassions.com/wp-content/uploads/2012/01/EggNoodles3-500x500.jpg" },
            { name: "DOUBLE EGG NOODLES", price: 130, image: "https://dms.mydukaan.io/original/jpeg/120067/56980869-2d71-40a3-9792-aa478a78731f.png" },
            { name: "CHICKEN NOODLES", price: 130, image: "https://sinfullyspicy.com/wp-content/uploads/2023/01/1200-by-1200-images-5-500x375.jpg" }
        ]
    }
];

async function updateSpecificMenu() {
    console.log('🔗 Connecting to DB...');
    
    // 1. Verify specific restaurant or create if not exists
    let restaurant = await prisma.restaurant.findUnique({
        where: { id: RESTAURANT_ID }
    });

    if (!restaurant) {
        console.log(`⚠️ Restaurant with ID ${RESTAURANT_ID} not found. Searching for any existing...`);
        restaurant = await prisma.restaurant.findFirst();
        
        if (!restaurant) {
            console.log(`🏗️ Creating restaurant with ID ${RESTAURANT_ID}...`);
            restaurant = await prisma.restaurant.create({
                data: {
                    id: RESTAURANT_ID,
                    name: 'AG TIFFINS',
                    description: 'Authentic Indian Tiffins and more',
                    is_active: true
                }
            });
        }
    }

    console.log(`📍 Using Restaurant: ${restaurant.name} (${restaurant.id})`);

    // 2. Clear existing menu items and categories for THIS restaurant
    console.log('🗑️ Clearing existing categories and menu items...');
    await prisma.menuItem.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.category.deleteMany({ where: { restaurantId: restaurant.id } });

    // 3. Update/Create Specific Tables
    console.log('🪑 Updating specific tables...');
    for (let i = 0; i < TABLE_IDS.length; i++) {
        const tableId = TABLE_IDS[i];
        const tableNumber = `T${i + 1}`;
        await prisma.table.upsert({
            where: { id: tableId },
            update: { restaurantId: restaurant.id, table_number: tableNumber, is_active: true },
            create: { id: tableId, restaurantId: restaurant.id, table_number: tableNumber, is_active: true }
        });
    }

    // 4. Create categories and items
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
                    price: itemData.price, // Using specific price!
                    image_url: itemData.image,
                    is_available: true,
                    display_order: j
                }
            });
        }
    }

    console.log('✅ Specific menu and tables updated successfully!');
}

updateSpecificMenu()
    .catch(e => {
        console.error('❌ Error updating specific menu:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
