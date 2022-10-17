import { Logger, UseGuards } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthService } from '@/auth/auth.service';
import { SocketWithUser } from '@/auth/auth.types';
import { WsJwtAuthGuard } from '@/auth/guards/ws-jwt-auth.guard';
import { CORS_ORIGINS } from '@/constants';

import { CreateChatMessageEventDto } from './dto/create-chat-message-event.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
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
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly chatService: ChatService, private readonly authService: AuthService) {}

    @WebSocketServer() wss: Server;

    private logger: Logger = new Logger('ChatGateway');

    private usersToSockets: Map<number, string> = new Map();

    afterInit() {
        this.logger.log('Initialized!');
    }

    async handleConnection(client: Socket) {
        try {
            const user = await this.authService.extractUserFromWsClient(client);
            this.usersToSockets.set(user.id, client.id);
            const userRooms = await this.chatService.getUserRooms(user.id);
            userRooms.forEach((room) => {
                client.join(this.chatService.createRoomWsId(room.id));
                this.wss.to(this.chatService.createRoomWsId(room.id)).emit(ChatOutgoingEvents.CLIENT_JOINED_ROOM, room);
            });
        } catch (error) {
            throw new WsException('Unauthorized');
        }
    }

    handleDisconnect(client: SocketWithUser) {
        this.usersToSockets.delete(client.data.user.id);
    }

    @SubscribeMessage(ChatIncomingEvents.SEND_MESSAGE_TO_SERVER)
    async handleMessage(client: SocketWithUser, dto: CreateChatMessageEventDto) {
        const message = await this.chatService.createMessage({ ...dto, authorId: client.data.user.id });
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

    @SubscribeMessage(ChatIncomingEvents.NEW_ROOM_CREATE)
    async handleRoomCreate(client: SocketWithUser, dto: CreateChatRoomDto) {
        const room = await this.chatService.createRoom(dto, true);
        room.members.forEach((member) => {
            this.wss.in(this.usersToSockets.get(member.id)).socketsJoin(this.chatService.createRoomWsId(room.id));
        });
        this.wss.to(this.chatService.createRoomWsId(room.id)).emit(ChatOutgoingEvents.CLIENT_JOINED_ROOM, room);
        client.emit(ChatOutgoingEvents.NEW_ROOM_CREATED, room);
    }
}
