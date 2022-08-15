import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [AuthModule, UsersModule, ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
