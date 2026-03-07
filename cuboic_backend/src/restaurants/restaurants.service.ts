import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
    constructor(private prisma: PrismaService) { }

    findById(id: string) {
        return this.prisma.restaurant.findUnique({ where: { id } });
    }

    findAll() {
        return this.prisma.restaurant.findMany();
    }

    create(data: { name: string; description?: string; logo_url?: string }) {
        return this.prisma.restaurant.create({ data });
    }
}