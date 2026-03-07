import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({ where: { user_id: dto.user_id } });
        if (existing) throw new ConflictException('User ID already taken');

        const password_hash = await bcrypt.hash(dto.password, 10);
        const { password_hash: _, ...user } = await this.prisma.user.create({
            data: {
                name: dto.name,
                user_id: dto.user_id,
                password_hash,
                role: (dto.role as UserRole) ?? 'Staff',
                restaurantId: dto.restaurant_id ?? null,
            },
        });
        return user;
    }

    findAll(restaurantId: string) {
        return this.prisma.user.findMany({
            where: { restaurantId },
            select: {
                id: true, name: true, user_id: true, role: true,
                is_active: true, restaurantId: true, createdAt: true,
            },
        });
    }

    async findByUserId(userId: string) {
        return this.prisma.user.findUnique({ where: { user_id: userId } });
    }
}
