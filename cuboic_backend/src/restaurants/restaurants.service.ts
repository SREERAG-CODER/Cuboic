import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
    constructor(private prisma: PrismaService) { }

    findById(id: string) {
        return this.prisma.restaurant.findUnique({ where: { id }, include: { tables: true } });
    }

    findTables(restaurantId: string) {
        return this.prisma.table.findMany({
            where: { restaurantId, is_active: true },
            orderBy: { table_number: 'asc' },
        });
    }

    findAll() {
        return this.prisma.restaurant.findMany();
    }

    create(data: { name: string; description?: string; logoUrl?: string }) {
        return this.prisma.restaurant.create({ data });
    }
}