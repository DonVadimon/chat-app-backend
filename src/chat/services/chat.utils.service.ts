import { Injectable } from '@nestjs/common';

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
}
