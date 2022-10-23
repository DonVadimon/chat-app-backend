import { Injectable } from '@nestjs/common';
import { ChatRoles, ChatRoomType, Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateGroupChatRoomDto } from './dto/create-group-chat-room.dto';
import { CreatePrivateChatRoomDto } from './dto/create-private-chat-room.dto';
import { JoinLeaveGroupChatRoomDto } from './dto/join-leave-group-chat-room.dto';
import { NotGroupChatError } from './errors/not-group-chat.error';
import { PrivateRoomAlreadyExistError } from './errors/private-room-already-exist.error';

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

    async createPrivateRoom(dto: CreatePrivateChatRoomDto, includeMembers = false) {
        const isRoomAlreadyExist = await this.prisma.chatRoomEntity.findFirst({
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

        if (isRoomAlreadyExist) {
            throw new PrivateRoomAlreadyExistError();
        }

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
