import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOutletDto } from './dto/create-outlet.dto';

@Injectable()
export class OutletsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateOutletDto) {
    return this.prisma.outlet.create({ data: dto });
  }

  findAll(restaurantId: string) {
    return this.prisma.outlet.findMany({
      where: { restaurantId },
      include: { _count: { select: { inventoryItems: true, orders: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const outlet = await this.prisma.outlet.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!outlet) throw new NotFoundException('Outlet not found');
    return outlet;
  }

  async update(id: string, data: Partial<CreateOutletDto>) {
    const outlet = await this.prisma.outlet.findUnique({ where: { id } });
    if (!outlet) throw new NotFoundException('Outlet not found');
    return this.prisma.outlet.update({ where: { id }, data });
  }
}
