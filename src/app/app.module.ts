import path from 'path';

import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from '@/auth/auth.module';
import { ChatModule } from '@/chat/chat.module';
import { FilesModule } from '@/files/files.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SearchModule } from '@/search/search.module';
import { UsersModule } from '@/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        ChatModule,
        SearchModule,
        FilesModule,
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        LoggerModule.forRoot({
            pinoHttp: {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        singleLine: true,
                    },
                },
                quietReqLogger: true,
            },
        }),
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '..', '..', '..', 'static'),
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
    ],
})
export class AppModule {}
