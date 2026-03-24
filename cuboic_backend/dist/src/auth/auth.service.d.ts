import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(userId: string, password: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string | null;
        user_id: string;
        password_hash: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null>;
    login(user: any): {
        access_token: string;
        user: {
            id: any;
            name: any;
            userId: any;
            role: any;
            restaurantId: any;
        };
    };
    changePassword(userId: string, oldPass: string, newPass: string): Promise<{
        id: string;
        name: string;
        user_id: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
