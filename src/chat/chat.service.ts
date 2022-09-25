import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { JoinLeaveChatRoomDto } from './dto/join-leave-chat-room.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

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

    getUserRooms(userId: number) {
        return this.prisma.chatRoomEntity.findMany({
            where: {
                members: {
                    some: {
                        id: userId,
                    },
                },
            },
        });
    }

    getRoomWithMessages(roomId: number) {
        return this.prisma.chatRoomEntity.findFirst({
            where: {
                id: roomId,
            },
            include: {
                members: {
                    select: {
                        username: true,
                        name: true,
                    },
                },
                messages: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    createRoom(dto: CreateChatRoomDto) {
        return this.prisma.chatRoomEntity.create({
            data: {
                type: dto.type,
                name: dto.name,
                description: dto.description,
                members: {
                    connect: dto.members.map((id) => ({ id })),
                },
            },
        });
    }

    addMemberToRoom({ roomId, userId }: JoinLeaveChatRoomDto) {
        return this.prisma.chatRoomEntity.update({
            data: {
                members: {
                    connect: {
                        id: userId,
                    },
                },
            },
            where: {
                id: roomId,
            },
            include: {
                members: true,
            },
        });
    }

    removeMemberFromRoom({ roomId, userId }: JoinLeaveChatRoomDto) {
        return this.prisma.chatRoomEntity.update({
            data: {
                members: {
                    disconnect: {
                        id: userId,
                    },
                },
            },
            where: {
                id: roomId,
            },
            include: {
                members: true,
            },
        });
    }

    createMessage(dto: CreateChatMessageDto) {
        return this.prisma.chatMessageEntity.create({
            data: {
                content: dto.content,
                author: {
                    connect: {
                        id: dto.authorId,
                    },
                },
                room: {
                    connect: {
                        id: dto.roomId,
                    },
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });
    }
}
