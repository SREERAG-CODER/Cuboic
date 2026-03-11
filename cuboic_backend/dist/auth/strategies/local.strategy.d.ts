import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(userId: string, password: string): Promise<{
        restaurantId: string | null;
        name: string;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
        user_id: string;
        password_hash: string;
    }>;
}
export {};
