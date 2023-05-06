import { Logger, UseGuards } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { ChatRoles, ChatRoomType } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { AuthService } from '@/auth/auth.service';
import { SocketWithUser } from '@/auth/auth.types';
import { WsJwtAuthGuard } from '@/auth/guards/ws-jwt-auth.guard';
import { ALLOWED_HEADERS, CORS_ORIGINS, EXPOSED_HEADERS } from '@/constants';
import { UserEntityResponseDto } from '@/users/dto/user-entity-response.dto';

import { CreateChatMessageEventDto } from './dto/create-chat-message-event.dto';
import { CreateGroupChatRoomDto } from './dto/create-group-chat-room.dto';
import { CreatePrivateChatRoomEventDto } from './dto/create-private-chat-room-event.dto';
import { JoinLeaveGroupChatRoomDto } from './dto/join-leave-group-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { ChatPermissionsGuard } from './guards/chat-permissions.guard';
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
        allowedHeaders: ALLOWED_HEADERS,
        exposedHeaders: EXPOSED_HEADERS,
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

    private logger: Logger = new Logger(ChatGateway.name);

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
            this.logger.log(`New socket connection: user ${user.username}`);
        } catch (error) {
            client.disconnect();
            this.logger.error('Connection error');
        }
    }

    handleDisconnect(client: SocketWithUser) {
        try {
            this.usersToSockets.delete(client.data.user?.id);
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
        const room = await this.chatService.createGroupRoom(dto, client.data.user.id);
        room.members = room.members.map((member) => new UserEntityResponseDto(member).cast());
        this.notifyAboutNewRoomCreate(client, room);
    }

    @SubscribeMessage(ChatIncomingEvents.NEW_PRIVATE_ROOM_CREATE)
    @UseGuards(PrivateRoomDoesntExistYetGuard)
    async handlePrivateRoomCreate(client: SocketWithUser, dto: CreatePrivateChatRoomEventDto) {
        const room = await this.chatService.createPrivateRoom({ ...dto, firstMemberId: client.data.user.id });
        room.members = room.members.map((member) => new UserEntityResponseDto(member).cast());
        this.notifyAboutNewRoomCreate(client, room);
    }

    // ? JOIN/LEAVE GROUP CHAT

    @SubscribeMessage(ChatIncomingEvents.CLIENT_JOIN_GROUP_ROOM)
    @UseGuards(PermittedToAddChatMemberGuard, RoomTypeGuard(joinLeaveRoomIdExtractor, ChatRoomType.GROUP))
    async handleGroupRoomJoin(client: SocketWithUser, dto: JoinLeaveGroupChatRoomDto) {
        const room = await this.chatService.addMemberToGroupRoom(dto);
        room.members = room.members.map((member) => new UserEntityResponseDto(member).cast());
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
        room.members = room.members.map((member) => new UserEntityResponseDto(member).cast());
        this.wss.in(this.usersToSockets.get(dto.userId)).emit(ChatOutgoingEvents.CLIENT_LEAVED_ROOM, room);
        this.wss.in(this.usersToSockets.get(dto.userId)).socketsLeave(this.chatUtilsService.createRoomWsId(room.id));
        this.wss
            .to(this.chatUtilsService.createRoomWsId(room.id))
            .emit(ChatOutgoingEvents.MEMBER_EXCLUDED_FROM_GROUP_ROOM, room);
    }

    @SubscribeMessage(ChatIncomingEvents.CLIENT_LEAVE_PRIVATE_ROOM)
    @UseGuards(PermittedToDeleteChatMemberGuard, RoomTypeGuard(joinLeaveRoomIdExtractor, ChatRoomType.PRIVATE))
    async handlePrivateRoomLeave(client: SocketWithUser, dto: JoinLeaveGroupChatRoomDto) {
        const room = await this.chatService.deletePrivateRoom(dto);
        room.members = room.members.map((member) => new UserEntityResponseDto(member).cast());
        this.wss.to(this.chatUtilsService.createRoomWsId(room.id)).emit(ChatOutgoingEvents.CLIENT_LEAVED_ROOM, room);
        this.wss
            .to(this.chatUtilsService.createRoomWsId(room.id))
            .socketsLeave(this.chatUtilsService.createRoomWsId(room.id));
    }

    // ? UPDATE CHAT ROOM INFO
    @SubscribeMessage(ChatIncomingEvents.UPDATE_ROOM_ENTITY)
    @UseGuards(
        ChatPermissionsGuard<UpdateChatRoomDto>({
            requiredRoles: [ChatRoles.OWNER],
            roomIdExtractor: (data) => data.roomId,
        }),
    )
    async handleUpdateChatRoom(client: SocketWithUser, dto: UpdateChatRoomDto) {
        const room = await this.chatService.updateRoom(dto);
        this.wss.to(this.chatUtilsService.createRoomWsId(room.id)).emit(ChatOutgoingEvents.ROOM_ENTITY_UPDATED, room);
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
