import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
    imports: [PrismaModule],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
})
export class ChatModule {}
