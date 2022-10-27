import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { ChatService } from './services/chat.service';
import { ChatUtilsService } from './services/chat.utils.service';
import { ApiChatRoomEntityDetailsResponse, ApiChatRoomEntityResponse } from './chat.swagger';

@ApiTags('chat')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService, private readonly chatUtilsService: ChatUtilsService) {}

    @ApiOkResponse({ type: ApiChatRoomEntityResponse, isArray: true })
    @Get('self-rooms')
    getSelfRooms(@Req() request: RequestWithUser) {
        return this.chatService.getUserRooms(request.user.id);
    }

    @Get('room/:id')
    @ApiOkResponse({ type: ApiChatRoomEntityDetailsResponse, isArray: true })
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
