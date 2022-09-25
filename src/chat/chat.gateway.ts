import { Logger, UseGuards } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { SocketWithUser } from '@/auth/auth.types';
import { WsJwtAuthGuard } from '@/auth/guards/ws-jwt-auth.guard';
import { CORS_ORIGINS } from '@/constants';

import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JoinLeaveChatRoomDto } from './dto/join-leave-chat-room.dto';
import { ChatService } from './chat.service';
import { ChatIncomingEvents, ChatOutgoingEvents } from './chat.types';

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: CORS_ORIGINS,
    },
})
@UseGuards(WsJwtAuthGuard)
export class ChatGateway implements OnGatewayInit {
    constructor(private readonly chatService: ChatService) {}

    @WebSocketServer() wss: Server;

    private logger: Logger = new Logger('ChatGateway');

    afterInit() {
        this.logger.log('Initialized!');
    }

    @SubscribeMessage(ChatIncomingEvents.SEND_MESSAGE_TO_SERVER)
    async handleMessage(client: SocketWithUser, dto: CreateChatMessageDto) {
        const message = await this.chatService.createMessage(dto);
        this.wss
            .to(this.chatService.createRoomWsId(dto.roomId))
            .emit(ChatOutgoingEvents.SEND_MESSAGE_TO_CLIENT, message);
    }

    @SubscribeMessage(ChatIncomingEvents.CLIENT_JOIN_ROOM)
    async handleRoomJoin(client: SocketWithUser, dto: JoinLeaveChatRoomDto) {
        const room = await this.chatService.addMemberToRoom(dto);
        client.join(this.chatService.createRoomWsId(room.id));
        client.emit(ChatOutgoingEvents.CLIENT_JOINED_ROOM, room);
    }

    @SubscribeMessage(ChatIncomingEvents.CLIENT_LEAVE_ROOM)
    async handleRoomLeave(client: SocketWithUser, dto: JoinLeaveChatRoomDto) {
        const room = await this.chatService.removeMemberFromRoom(dto);
        client.leave(this.chatService.createRoomWsId(room.id));
        client.emit(ChatOutgoingEvents.CLIENT_LEAVED_ROOM, room);
    }
}
