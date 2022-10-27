import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { ChatService } from './services/chat.service';
import { ChatUtilsService } from './services/chat.utils.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [PrismaModule, UsersModule, AuthModule],
    providers: [ChatGateway, ChatService, ChatUtilsService],
    controllers: [ChatController],
})
export class ChatModule {}
