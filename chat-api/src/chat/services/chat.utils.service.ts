import { Injectable } from '@nestjs/common';
import { ChatRoomType } from '@prisma/client';

import { CreatePrivateChatRoomDto } from '@/chat/dto/create-private-chat-room.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ChatUtilsService {
    constructor(private readonly prisma: PrismaService) {}

    createRoomWsId(roomId: number): string {
        return roomId.toString();
    }

    async isMemberOfRoom(userId: number, roomId: number) {
        const member = await this.prisma.userEntity.findFirst({
            where: {
                id: userId,
                rooms: {
                    some: {
                        id: roomId,
                    },
                },
            },
        });

        return !!member;
    }

    getRoomType(roomId: number) {
        return this.prisma.chatRoomEntity.findFirst({
            where: {
                id: roomId,
            },
            select: {
                type: true,
            },
        });
    }

    getUserPermissionsInChatRoom(userId: number, roomId: number) {
        return this.prisma.chatPermissionsEntity.findFirst({
            where: {
                userEntityId: userId,
                chatRoomEntityId: roomId,
            },
        });
    }

    isPrivateRoomAlreadyExist(dto: Pick<CreatePrivateChatRoomDto, 'firstMemberId' | 'secondMemberId'>) {
        return this.prisma.chatRoomEntity.findFirst({
            where: {
                type: ChatRoomType.PRIVATE,
                members: {
                    every: {
                        id: {
                            in: [dto.firstMemberId, dto.secondMemberId],
                        },
                    },
                },
            },
        });
    }
}
