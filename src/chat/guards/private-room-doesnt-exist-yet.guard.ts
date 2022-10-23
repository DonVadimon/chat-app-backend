import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatRoomType } from '@prisma/client';

import { CreatePrivateChatRoomDto } from '@/chat/dto/create-private-chat-room.dto';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * You can create new PRIVATE chat room only if it doedn't exist yet
 */
export class PrivateRoomDoesntExistYetGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const dto = context.switchToWs().getData<CreatePrivateChatRoomDto>();

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

            return !isRoomAlreadyExist;
        } catch (error) {
            throw new WsException('Private room with this members already exist');
        }
    }
}
