import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
    constructor(private prisma: PrismaService) { }

    findById(id: string) {
        return this.prisma.restaurant.findUnique({ where: { id }, include: { tables: true } });
    }

    async findTables(restaurantId: string) {
        let tables = await this.prisma.table.findMany({
            where: { restaurantId },
        });

        // Ensure a Takeaway table exists for easy checkout routing
        const hasTakeaway = tables.some(t => t.table_number.toLowerCase() === 'takeaway');
        if (!hasTakeaway) {
            const takeawayTable = await this.prisma.table.create({
                data: {
                    restaurantId,
                    table_number: 'Takeaway',
                    is_active: true
                }
            });
            tables.push(takeawayTable);
        }

        return tables;
    }

    findAll() {
        return this.prisma.restaurant.findMany();
    }

    create(data: { name: string; description?: string; logoUrl?: string }) {
        return this.prisma.restaurant.create({ data });
    }
}