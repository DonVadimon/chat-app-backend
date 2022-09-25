import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserReq } from '@/users/users.types';

import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ChatService } from './chat.service';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('self-rooms')
    getSelfRooms(@Req() request: UserReq) {
        return this.chatService.getUserRooms(request.user.id);
    }

    @Get('room/:id')
    async getRoomDetails(@Req() request: UserReq, @Param('id') roomIdParam: string) {
        const roomId = Number(roomIdParam);
        const isMemberOfRoom = await this.chatService.isMemberOfRoom(request.user.id, roomId);
        if (isMemberOfRoom) {
            return this.chatService.getRoomWithMessages(roomId);
        } else {
            throw new HttpException("You must be a member of room to access it's content", HttpStatus.FORBIDDEN);
        }
    }

    @Post('room')
    createRoom(@Body() dto: CreateChatRoomDto) {
        return this.chatService.createRoom(dto);
    }
}