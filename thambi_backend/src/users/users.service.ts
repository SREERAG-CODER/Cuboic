import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({ where: { user_id: dto.userId } });
        if (existing) throw new ConflictException('User ID already taken');

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const { password_hash: _, ...user } = await this.prisma.user.create({
            data: {
                name: dto.name,
                user_id: dto.userId,
                password_hash: passwordHash,
                role: (dto.role as UserRole) ?? 'Staff',
                restaurantId: dto.restaurantId ?? null,
                dashboard_config: dto.dashboard_config ?? ["Pending", "Preparing", "Completed", "Robots"],
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
                dashboard_config: true, email: true, phone: true,
            },
        });
    }

    async findByUserId(userId: string) {
        return this.prisma.user.findUnique({ where: { user_id: userId } });
    }

    async updatePassword(id: string, hash: string) {
        return this.prisma.user.update({
            where: { id },
            data: { password_hash: hash },
            select: { id: true, name: true, user_id: true, role: true, dashboard_config: true, email: true, phone: true }
        });
    }

    async updateProfile(id: string, dto: { email?: string; phone?: string }) {
        return this.prisma.user.update({
            where: { id },
            data: { email: dto.email, phone: dto.phone },
            select: { id: true, name: true, user_id: true, role: true, restaurantId: true, email: true, phone: true, dashboard_config: true },
        });
    }

    async update(id: string, dto: UpdateUserDto) {
        const data: any = { ...dto };
        if (dto.password) {
            data.password_hash = await bcrypt.hash(dto.password, 10);
        }
        delete data.password;
        
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, user_id: true, role: true, is_active: true, dashboard_config: true }
        });
    }

    async remove(id: string) {
        // Soft delete user
        return this.prisma.user.update({
            where: { id },
            data: { is_active: false },
        });
    }
}
