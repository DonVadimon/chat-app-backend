import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatRoomType } from '@prisma/client';

import { ChatUtilsService } from '@/chat/services/chat.utils.service';

export type RoomIdExtractor<T> = (data: T) => number;

export const RoomTypeGuard = <T>(
    roomIdExtractor: RoomIdExtractor<T>,
    ...allowedRoomTypes: ChatRoomType[]
): Type<CanActivate> => {
    class RoomTypeGuardMixin {
        constructor(private readonly chatUtilsService: ChatUtilsService) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            try {
                const data = context.switchToWs().getData();

                const roomId = roomIdExtractor(data);

                const room = await this.chatUtilsService.getRoomType(roomId);

                return allowedRoomTypes.includes(room.type);
            } catch (error) {
                throw new WsException(`Target room has invalid type. Allowed only ${allowedRoomTypes.join(', ')}`);
            }
        }
    }

    return mixin(RoomTypeGuardMixin);
};
