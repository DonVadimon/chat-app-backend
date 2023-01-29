import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '@/prisma/prisma.module';

import { FaceController } from './face.controller';
import { FaceService } from './face.service';

@Module({
    controllers: [FaceController],
    providers: [FaceService],
    imports: [PrismaModule, HttpModule, ConfigModule],
})
export class FaceModule {}
