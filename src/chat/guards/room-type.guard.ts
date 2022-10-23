import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatRoomType } from '@prisma/client';

import { ChatService } from '@/chat/chat.service';

type RoomIdExtractor = (data: any) => number;

export const defaultRoomIdExtractor: RoomIdExtractor = (data) => data?.roomId;

export const RoomTypeGuard = (
    roomIdExtractor = defaultRoomIdExtractor,
    ...allowedRoomTypes: ChatRoomType[]
): Type<CanActivate> => {
    class RoomTypeGuardMixin {
        constructor(private readonly chatService: ChatService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            try {
                const data = context.switchToWs().getData();

                const roomId = roomIdExtractor(data);

                const room = await this.chatService.getRoomType(roomId);

                return allowedRoomTypes.includes(room.type);
            } catch (error) {
                throw new WsException(`Target room has invalid type. Allowed only ${allowedRoomTypes.join(', ')}`);
            }
        }
    }

    return mixin(RoomTypeGuardMixin);
};
