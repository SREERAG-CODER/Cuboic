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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var dns_1 = require("dns");
(0, dns_1.setDefaultResultOrder)('ipv4first');
var mongoose_1 = __importDefault(require("mongoose"));
var bcrypt = __importStar(require("bcryptjs"));
var dotenv = __importStar(require("dotenv"));
dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
var MONGO_URI = (_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : 'mongodb://localhost:27017/thambi';
function generateSecretKey() {
    return "robot-".concat(Math.random().toString(36).substring(2, 12));
}
// ── Unsplash food image URLs ────────────────────────────────────────────────
var IMG = {
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
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var db, collections, _i, collections_1, col, restaurantId, tableIds, catNames, categoryIds, menuItems, menuItemIds, robotIds, robotData, password_hash, ownerUserId, staffUserId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mongoose_1.default.connect(MONGO_URI, {
                        serverSelectionTimeoutMS: 30000,
                        connectTimeoutMS: 30000,
                    })];
                case 1:
                    _a.sent();
                    console.log('✅ Connected to MongoDB');
                    db = mongoose_1.default.connection.db;
                    return [4 /*yield*/, db.listCollections().toArray()];
                case 2:
                    collections = _a.sent();
                    _i = 0, collections_1 = collections;
                    _a.label = 3;
                case 3:
                    if (!(_i < collections_1.length)) return [3 /*break*/, 6];
                    col = collections_1[_i];
                    return [4 /*yield*/, db.dropCollection(col.name)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('🗑️  Cleared existing data');
                    restaurantId = new mongoose_1.default.Types.ObjectId();
                    return [4 /*yield*/, db.collection('restaurants').insertOne({
                            _id: restaurantId,
                            name: 'Thambi Kitchen',
                            description: 'Robot-delivered dining experience',
                            logo_url: '',
                            is_active: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })];
                case 7:
                    _a.sent();
                    tableIds = Array.from({ length: 12 }, function () { return new mongoose_1.default.Types.ObjectId(); });
                    return [4 /*yield*/, db.collection('tables').insertMany(tableIds.map(function (id, i) { return ({
                            _id: id,
                            restaurant_id: restaurantId,
                            table_number: "T".concat(i + 1),
                            is_active: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }); }))];
                case 8:
                    _a.sent();
                    catNames = ['Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];
                    categoryIds = catNames.map(function () { return new mongoose_1.default.Types.ObjectId(); });
                    return [4 /*yield*/, db.collection('categories').insertMany(catNames.map(function (name, i) { return ({
                            _id: categoryIds[i],
                            restaurant_id: restaurantId,
                            name: name,
                            display_order: i,
                            is_active: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }); }))];
                case 9:
                    _a.sent();
                    menuItems = [
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
                    menuItemIds = menuItems.map(function () { return new mongoose_1.default.Types.ObjectId(); });
                    return [4 /*yield*/, db.collection('menuitems').insertMany(menuItems.map(function (item, i) { return ({
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
                        }); }))];
                case 10:
                    _a.sent();
                    robotIds = [
                        new mongoose_1.default.Types.ObjectId(),
                        new mongoose_1.default.Types.ObjectId(),
                        new mongoose_1.default.Types.ObjectId(),
                        new mongoose_1.default.Types.ObjectId(),
                    ];
                    robotData = [
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
                    return [4 /*yield*/, db.collection('robots').insertMany(robotData)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, bcrypt.hash('password123', 10)];
                case 12:
                    password_hash = _a.sent();
                    ownerUserId = new mongoose_1.default.Types.ObjectId();
                    staffUserId = new mongoose_1.default.Types.ObjectId();
                    return [4 /*yield*/, db.collection('users').insertMany([
                            {
                                _id: ownerUserId,
                                restaurant_id: restaurantId,
                                name: 'Restaurant Owner',
                                user_id: 'owner01',
                                password_hash: password_hash,
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
                                password_hash: password_hash,
                                role: 'Staff',
                                is_active: true,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        ])];
                case 13:
                    _a.sent();
                    // ──────────────────────────────────────────────────────────────
                    // Summary
                    // ──────────────────────────────────────────────────────────────
                    console.log('\n🎉 Seed complete!\n');
                    console.log('──────────────────────────────────────────────');
                    console.log("Restaurant ID : ".concat(restaurantId));
                    console.log("Tables        : 12  (T1 \u2013 T12)");
                    console.log("Menu Items    : ".concat(menuItems.length));
                    console.log("Robots        : 4   (CuboBot-1 through CuboBot-4)");
                    // Print table IDs - the first one is used as the demo URL table
                    console.log("\n\uD83D\uDCCB Table IDs (first 3):");
                    tableIds.slice(0, 3).forEach(function (id, i) { return console.log("  T".concat(i + 1, ": ").concat(id)); });
                    console.log('\n🔐 Robot Credentials:');
                    robotData.forEach(function (r) {
                        console.log("  ".concat(r.name, "  |  ID: ").concat(r._id, "  |  key: ").concat(r.secretKey));
                    });
                    console.log("\n\uD83C\uDF10 Customer App URL (Table T1):");
                    console.log("  http://localhost:5173/?r=".concat(restaurantId, "&t=").concat(tableIds[0]));
                    console.log("\n\uD83D\uDD11 Admin Login:");
                    console.log("  Owner  \u2192  user_id=owner01   password=password123");
                    console.log("  Staff  \u2192  user_id=staff01   password=password123");
                    console.log('──────────────────────────────────────────────');
                    return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 14:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
seed().catch(function (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
