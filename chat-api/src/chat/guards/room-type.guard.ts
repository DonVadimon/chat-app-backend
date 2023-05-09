import { CanActivate, ExecutionContext, Injectable, Logger, mixin, Type } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatRoomType } from '@prisma/client';

import { RoomIdExtractor } from '@/chat/chat.types';
import { ChatUtilsService } from '@/chat/services/chat.utils.service';

export const RoomTypeGuard = <T>(
    roomIdExtractor: RoomIdExtractor<T>,
    ...allowedRoomTypes: ChatRoomType[]
): Type<CanActivate> => {
    @Injectable()
    class RoomTypeGuardMixin {
        constructor(private readonly chatUtilsService: ChatUtilsService) {}

        private logger: Logger = new Logger(RoomTypeGuardMixin.name);

        async canActivate(context: ExecutionContext): Promise<boolean> {
            try {
                const data = context.switchToWs().getData();

                const roomId = roomIdExtractor(data);

                const room = await this.chatUtilsService.getRoomType(roomId);

                return allowedRoomTypes.includes(room.type);
            } catch (error) {
                this.logger.error(error);

                throw new WsException(`Target room has invalid type. Allowed only ${allowedRoomTypes.join(', ')}`);
            }
        }
    }

    return mixin(RoomTypeGuardMixin);
};
