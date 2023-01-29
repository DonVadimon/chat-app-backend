import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ChatRoles } from '@prisma/client';

import { SocketWithUser } from '@/auth/auth.types';
import { NotPermittedWsException } from '@/auth/exceptions/not-permitted-ws.exception';
import { JoinLeaveGroupChatRoomDto } from '@/chat/dto/join-leave-group-chat-room.dto';
import { ChatUtilsService } from '@/chat/services/chat.utils.service';

/**
 * You can add new member to room only if you have OWNER permissions
 */
export class PermittedToAddChatMemberGuard implements CanActivate {
    constructor(private readonly chatUtilsService: ChatUtilsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<SocketWithUser>();
            const dto = context.switchToWs().getData<JoinLeaveGroupChatRoomDto>();

            const userPermissions = await this.chatUtilsService.getUserPermissionsInChatRoom(
                client.data.user.id,
                dto.roomId,
            );

            return userPermissions.role === ChatRoles.OWNER;
        } catch (error) {
            throw new NotPermittedWsException();
        }
    }
}
