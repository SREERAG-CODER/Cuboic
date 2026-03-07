import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        name: string;
        id: string;
        restaurantId: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        restaurantId: string | null;
        is_active: boolean;
        createdAt: Date;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
}
