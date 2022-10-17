import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
    imports: [PrismaModule, UsersModule, AuthModule],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
})
export class ChatModule {}
