import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(userId: string, password: string): Promise<{
        name: string;
        id: string;
        restaurantId: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
        password_hash: string;
    } | null>;
    login(user: any): {
        access_token: string;
        user: {
            id: any;
            name: any;
            user_id: any;
            role: any;
            restaurant_id: any;
        };
    };
}
