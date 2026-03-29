import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
    constructor(private prisma: PrismaService) {}

    create(restaurantId: string, table_number: string) {
        return this.prisma.table.create({
            data: { restaurantId, table_number, is_active: true }
        });
    }

    updateStatus(id: string, is_active: boolean) {
        return this.prisma.table.update({
            where: { id },
            data: { is_active }
        });
    }
}
