import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        user_id: string;
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
}
