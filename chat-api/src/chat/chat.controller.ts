import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateChatMessageEventDto } from './dto/create-chat-message-event.dto';
import { CreateGroupChatRoomDto, CreateGroupChatRoomMemberDto } from './dto/create-group-chat-room.dto';
import { CreatePrivateChatRoomDto } from './dto/create-private-chat-room.dto';
import { CreatePrivateChatRoomEventDto } from './dto/create-private-chat-room-event.dto';
import { JoinLeaveGroupChatRoomDto } from './dto/join-leave-group-chat-room.dto';
import { ChatService } from './services/chat.service';
import { ChatUtilsService } from './services/chat.utils.service';
import { ApiChatRoomEntityDetailsResponse, ApiChatRoomEntityWithMembersResponse } from './chat.swagger';

@ApiTags('chat')
@ApiExtraModels(
    CreateChatMessageDto,
    CreateChatMessageEventDto,
    CreateGroupChatRoomDto,
    CreateGroupChatRoomMemberDto,
    CreatePrivateChatRoomDto,
    CreatePrivateChatRoomEventDto,
    JoinLeaveGroupChatRoomDto,
)
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService, private readonly chatUtilsService: ChatUtilsService) {}

    @ApiOkResponse({ type: ApiChatRoomEntityWithMembersResponse, isArray: true })
    @Get('self-rooms')
    getSelfRooms(@Req() request: RequestWithUser) {
        return this.chatService.getUserRooms(request.user.id);
    }

    @Get('room/:id')
    @ApiOkResponse({ type: ApiChatRoomEntityDetailsResponse })
    async getRoomDetails(@Req() request: RequestWithUser, @Param('id') roomIdParam: string) {
        const roomId = Number(roomIdParam);
        const isMemberOfRoom = await this.chatUtilsService.isMemberOfRoom(request.user.id, roomId);
        if (isMemberOfRoom) {
            return this.chatService.getRoomWithMessages(roomId);
        } else {
            throw new HttpException("You must be a member of room to access it's content", HttpStatus.FORBIDDEN);
        }
    }
}
