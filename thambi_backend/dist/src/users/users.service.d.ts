import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        user_id: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        restaurantId: string | null;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    findByUserId(userId: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        user_id: string;
        outletId: string | null;
        password_hash: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null>;
    updatePassword(id: string, hash: string): Promise<{
        id: string;
        name: string;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        user_id: string;
        outletId: string | null;
        password_hash: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
