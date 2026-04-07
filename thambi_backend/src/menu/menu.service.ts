import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
    constructor(private prisma: PrismaService) { }

    async getMenu(restaurantId: string, tableId?: string, categoryId?: string) {
        if (tableId) {
            const table = await this.prisma.table.findFirst({
                where: { id: tableId, restaurantId, is_active: true },
            });
            if (!table) throw new NotFoundException('Table not found or inactive');
        }

        return this.prisma.menuItem.findMany({
            where: {
                restaurantId,
                is_available: true,
                ...(categoryId ? { categoryId } : {}),
            },
            orderBy: { display_order: 'asc' },
        });
    }

    getAllForAdmin(restaurantId: string) {
        return this.prisma.menuItem.findMany({
            where: { restaurantId },
            orderBy: [{ display_order: 'asc' }, { name: 'asc' }],
        });
    }

    createItem(dto: CreateMenuItemDto) {
        return this.prisma.menuItem.create({
            data: {
                restaurantId: dto.restaurantId,
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                image_url: dto.image_url,
                is_available: dto.is_available ?? true,
                display_order: dto.display_order ?? 0,
            },
        });
    }

    async updateItem(id: string, dto: UpdateMenuItemDto) {
        const updated = await this.prisma.menuItem.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.image_url !== undefined && { image_url: dto.image_url }),
                ...(dto.is_available !== undefined && { is_available: dto.is_available }),
                ...(dto.display_order !== undefined && { display_order: dto.display_order }),
            },
        }).catch(() => { throw new NotFoundException('Menu item not found'); });
        return updated;
    }

    async bulkUpdate(restaurantId: string, updates: Array<{ id: string; data: Partial<UpdateMenuItemDto> }>) {
        const results = await this.prisma.$transaction(
            updates.map((u) =>
                this.prisma.menuItem.update({
                    where: { id: u.id, restaurantId }, // Safety check: must belong to the restaurant
                    data: u.data,
                }),
            ),
        );
        return results;
    }

    deleteItem(id: string) {
        return this.prisma.menuItem.delete({ where: { id } })
            .catch(() => { throw new NotFoundException('Menu item not found'); });
    }
}