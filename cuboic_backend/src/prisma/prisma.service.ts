import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        let retries = 5;
        while (retries > 0) {
            try {
                await this.$connect();
                console.log('✅ Prisma connected to Database');
                break;
            } catch (err) {
                retries--;
                console.error(`❌ Prisma connection failed. Retries left: ${retries}. Waiting for DB wake-up...`);
                if (retries === 0) throw err;
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
