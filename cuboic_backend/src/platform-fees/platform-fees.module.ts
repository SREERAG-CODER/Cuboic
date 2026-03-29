import { Module } from '@nestjs/common';
import { PlatformFeesService } from './platform-fees.service';
import { PlatformFeesController } from './platform-fees.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PlatformFeesController],
    providers: [PlatformFeesService],
    exports: [PlatformFeesService],
})
export class PlatformFeesModule { }
