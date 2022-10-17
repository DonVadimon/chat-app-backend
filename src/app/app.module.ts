import path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AuthModule } from '@/auth/auth.module';
import { ChatModule } from '@/chat/chat.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        ChatModule,
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '..', '..', '..', 'static'),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
