import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        restaurantId: string | null;
        name: string;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
        user_id: string;
    }>;
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        restaurantId: string | null;
        name: string;
        id: string;
        is_active: boolean;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
        user_id: string;
    }[]>;
}
