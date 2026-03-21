import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function findId() {
    const restaurants = await prisma.restaurant.findMany();
    restaurants.forEach(r => console.log(`${r.id} : ${r.name}`));
}

findId().finally(() => prisma.$disconnect());
