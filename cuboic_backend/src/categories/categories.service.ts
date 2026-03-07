import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    findAll(restaurantId: string) {
        return this.prisma.category.findMany({
            where: { restaurantId, is_active: true },
            orderBy: { display_order: 'asc' },
        });
    }
}
