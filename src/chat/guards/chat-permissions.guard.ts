import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { ChatRoles } from '@prisma/client';

import { SocketWithUser } from '@/auth/auth.types';
import { NotPermittedWsException } from '@/auth/exceptions/not-permitted-ws.exception';
import { RoomIdExtractor } from '@/chat/chat.types';
import { ChatUtilsService } from '@/chat/services/chat.utils.service';

type ChatPermissionsGuardPayload<T> = {
    requiredRoles: ChatRoles[];
    roomIdExtractor: RoomIdExtractor<T>;
};

export const ChatPermissionsGuard = <T>({
    requiredRoles,
    roomIdExtractor,
}: ChatPermissionsGuardPayload<T>): Type<CanActivate> => {
    class ChatPermissionsGuardMixin {
        constructor(private readonly chatUtilsService: ChatUtilsService) {}

        async canActivate(context: ExecutionContext) {
            try {
                const client = context.switchToWs().getClient<SocketWithUser>();

                const roomId = roomIdExtractor(context.switchToWs().getData<T>());

                const userPermissions = await this.chatUtilsService.getUserPermissionsInChatRoom(
                    client.data.user.id,
                    roomId,
                );

                return requiredRoles.some((role) => userPermissions.role === role);
            } catch (error) {
                throw new NotPermittedWsException();
            }
        }
    }

    return mixin(ChatPermissionsGuardMixin);
};
