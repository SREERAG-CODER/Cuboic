import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(userId: string, password: string) {
        const user = await this.usersService.findByUserId(userId);
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;
        return user;
    }

    login(user: any) {
        const payload = {
            sub: user.id,          // changed from _id to id (Prisma uses .id)
            user_id: user.user_id,
            role: user.role,
            restaurant_id: user.restaurantId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                user_id: user.user_id,
                role: user.role,
                restaurant_id: user.restaurantId,
            },
        };
    }
}
