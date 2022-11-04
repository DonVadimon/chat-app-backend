import { Logger, UseGuards } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { ChatRoomType } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { AuthService } from '@/auth/auth.service';
import { SocketWithUser } from '@/auth/auth.types';
import { UnauthorizedWsException } from '@/auth/exceptions/unauthorized-ws.exception';
import { WsJwtAuthGuard } from '@/auth/guards/ws-jwt-auth.guard';
import { CORS_ORIGINS } from '@/constants';

import { CreateChatMessageEventDto } from './dto/create-chat-message-event.dto';
import { CreateGroupChatRoomDto } from './dto/create-group-chat-room.dto';
import { CreatePrivateChatRoomEventDto } from './dto/create-private-chat-room-event.dto';
import { JoinLeaveGroupChatRoomDto } from './dto/join-leave-group-chat-room.dto';
import { PermittedToAddChatMemberGuard } from './guards/permitted-to-add-chat-member.guard';
import { PermittedToDeleteChatMemberGuard } from './guards/permitted-to-delete-chat-member.guard';
import { PrivateRoomDoesntExistYetGuard } from './guards/private-room-doesnt-exist-yet.guard';
import { RoomTypeGuard } from './guards/room-type.guard';
import { ChatService } from './services/chat.service';
import { ChatUtilsService } from './services/chat.utils.service';
import { ChatIncomingEvents, ChatOutgoingEvents, ChatRoomWithMembers } from './chat.types';
import { joinLeaveRoomIdExtractor } from './chat.utils';

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: CORS_ORIGINS,
        credentials: true,
    },
})
@UseGuards(WsJwtAuthGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatUtilsService: ChatUtilsService,
        private readonly authService: AuthService,
    ) {}

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
            client.join(userRooms.map(({ id }) => this.chatUtilsService.createRoomWsId(id)));
            client.emit(ChatOutgoingEvents.CLIENT_CONNECTED, { rooms: userRooms });
        } catch (error) {
            throw new UnauthorizedWsException();
        }
    }

    handleDisconnect(client: SocketWithUser) {
        try {
            this.usersToSockets.delete(client.data.user.id);
        } catch (error) {
            this.logger.error(error);
        }
    }

    // ? MESSAGES

    @SubscribeMessage(ChatIncomingEvents.SEND_MESSAGE_TO_SERVER)
    async handleMessage(client: SocketWithUser, dto: CreateChatMessageEventDto) {
        const message = await this.chatService.createMessage({ ...dto, authorId: client.data.user.id });
        this.wss
            .to(this.chatUtilsService.createRoomWsId(dto.roomId))
            .emit(ChatOutgoingEvents.SEND_MESSAGE_TO_CLIENT, message);
    }

    // ? CREATE

    @SubscribeMessage(ChatIncomingEvents.NEW_GROUP_ROOM_CREATE)
    async handleGroupRoomCreate(client: SocketWithUser, dto: CreateGroupChatRoomDto) {
        const room = await this.chatService.createGroupRoom(dto, client.data.user.id, true);
        this.notifyAboutNewRoomCreate(client, room);
    }

    @SubscribeMessage(ChatIncomingEvents.NEW_PRIVATE_ROOM_CREATE)
    @UseGuards(PrivateRoomDoesntExistYetGuard)
    async handlePrivateRoomCreate(client: SocketWithUser, dto: CreatePrivateChatRoomEventDto) {
        const room = await this.chatService.createPrivateRoom({ ...dto, firstMemberId: client.data.user.id }, true);
        this.notifyAboutNewRoomCreate(client, room);
    }

    // ? JOIN/LEAVE GROUP CHAT

    @SubscribeMessage(ChatIncomingEvents.CLIENT_JOIN_GROUP_ROOM)
    @UseGuards(PermittedToAddChatMemberGuard, RoomTypeGuard(joinLeaveRoomIdExtractor, ChatRoomType.GROUP))
    async handleGroupRoomJoin(client: SocketWithUser, dto: JoinLeaveGroupChatRoomDto) {
        const room = await this.chatService.addMemberToGroupRoom(dto);
        client.join(this.chatUtilsService.createRoomWsId(room.id));
        client.emit(ChatOutgoingEvents.CLIENT_JOINED_ROOM, room);
        this.wss
            .to(this.chatUtilsService.createRoomWsId(room.id))
            .emit(ChatOutgoingEvents.NEW_MEMBER_ADDED_TO_GROUP_ROOM, room);
    }

    @SubscribeMessage(ChatIncomingEvents.CLIENT_LEAVE_GROUP_ROOM)
    @UseGuards(PermittedToDeleteChatMemberGuard, RoomTypeGuard(joinLeaveRoomIdExtractor, ChatRoomType.GROUP))
    async handleGroupRoomLeave(client: SocketWithUser, dto: JoinLeaveGroupChatRoomDto) {
        const room = await this.chatService.removeMemberFromGroupRoom(dto);
        client.leave(this.chatUtilsService.createRoomWsId(room.id));
        this.wss.in(this.usersToSockets.get(dto.userId)).emit(ChatOutgoingEvents.CLIENT_LEAVED_ROOM, room);
        this.wss
            .to(this.chatUtilsService.createRoomWsId(room.id))
            .emit(ChatOutgoingEvents.MEMBER_EXCLUDED_FROM_GROUP_ROOM, room);
    }

    // ? UTILS

    private notifyAboutNewRoomCreate(client: SocketWithUser, room: ChatRoomWithMembers) {
        room.members.forEach((member) => {
            this.wss.in(this.usersToSockets.get(member.id)).socketsJoin(this.chatUtilsService.createRoomWsId(room.id));
        });
        this.wss.to(this.chatUtilsService.createRoomWsId(room.id)).emit(ChatOutgoingEvents.CLIENT_JOINED_ROOM, room);
        client.emit(ChatOutgoingEvents.NEW_ROOM_CREATED, room);
    }
}
