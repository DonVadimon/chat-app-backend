import { Injectable } from '@nestjs/common';
import { ChatRoles, ChatRoomType, Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { CreateGroupChatRoomDto } from '../dto/create-group-chat-room.dto';
import { CreatePrivateChatRoomDto } from '../dto/create-private-chat-room.dto';
import { JoinLeaveGroupChatRoomDto } from '../dto/join-leave-group-chat-room.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    getUserRooms(userId: number) {
        return this.prisma.chatRoomEntity.findMany({
            where: {
                members: {
                    some: {
                        id: userId,
                    },
                },
            },
            include: {
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
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

    async createPrivateRoom(dto: CreatePrivateChatRoomDto, includeMembers = false) {
        return this.prisma.chatRoomEntity.create({
            data: {
                type: ChatRoomType.PRIVATE,
                name: dto.name,
                description: dto.description,
                members: {
                    connect: [{ id: dto.firstMemberId }, { id: dto.secondMemberId }],
                },
                chatPermissions: {
                    createMany: {
                        data: [
                            {
                                role: ChatRoles.OWNER,
                                userEntityId: dto.firstMemberId,
                            },
                            {
                                role: ChatRoles.OWNER,
                                userEntityId: dto.secondMemberId,
                            },
                        ],
                    },
                },
            },
            include: {
                members: includeMembers,
            },
        });
    }

    createGroupRoom(dto: CreateGroupChatRoomDto, ownerId: number, includeMembers = false) {
        const members = dto.members
            .filter((id) => id !== ownerId)
            .map<Prisma.ChatPermissionsEntityCreateManyChatRoomInput>((memberId) => ({
                role: ChatRoles.MEMBER,
                userEntityId: memberId,
            }))
            .concat({
                role: ChatRoles.OWNER,
                userEntityId: ownerId,
            });

        return this.prisma.chatRoomEntity.create({
            data: {
                type: ChatRoomType.GROUP,
                name: dto.name,
                description: dto.description,
                members: {
                    connect: dto.members.map((id) => ({ id })),
                },
                chatPermissions: {
                    createMany: {
                        data: members,
                    },
                },
            },
            include: {
                members: includeMembers,
            },
        });
    }

    addMemberToGroupRoom({ roomId, userId }: JoinLeaveGroupChatRoomDto) {
        return this.prisma.chatRoomEntity.update({
            data: {
                members: {
                    connect: {
                        id: userId,
                    },
                },
                chatPermissions: {
                    create: {
                        role: ChatRoles.MEMBER,
                        userEntityId: userId,
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

    async removeMemberFromGroupRoom({ roomId, userId }: JoinLeaveGroupChatRoomDto) {
        const permission = await this.prisma.chatPermissionsEntity.findFirst({
            where: {
                userEntityId: userId,
                chatRoomEntityId: roomId,
            },
        });

        return this.prisma.chatRoomEntity.update({
            data: {
                members: {
                    disconnect: {
                        id: userId,
                    },
                },
                chatPermissions: {
                    delete: {
                        id: permission.id,
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
