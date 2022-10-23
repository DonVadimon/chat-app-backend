import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatRoles } from '@prisma/client';

import { SocketWithUser } from '@/auth/auth.types';
import { ChatUtilsService } from '@/chat/chat.utils.service';
import { JoinLeaveGroupChatRoomDto } from '@/chat/dto/join-leave-group-chat-room.dto';

/**
 * You can exclude member from chat if you have OWNER permissions or if you want to exclude yourself
 */
export class PermittedToDeleteChatMemberGuard implements CanActivate {
    constructor(private readonly chatUtilsService: ChatUtilsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<SocketWithUser>();
            const dto = context.switchToWs().getData<JoinLeaveGroupChatRoomDto>();

            const userPermissions = await this.chatUtilsService.getUserPermissionsInChatRoom(
                client.data.user.id,
                dto.roomId,
            );

            return userPermissions.role === ChatRoles.OWNER || dto.userId === client.data.user.id;
        } catch (error) {
            throw new WsException('Not permitted for action');
        }
    }
}
