import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ChatRoles } from '@prisma/client';

import { SocketWithUser } from '@/auth/auth.types';
import { NotPermittedWsException } from '@/auth/exceptions/not-permitted-ws.exception';
import { JoinLeaveGroupChatRoomDto } from '@/chat/dto/join-leave-group-chat-room.dto';
import { ChatUtilsService } from '@/chat/services/chat.utils.service';

/**
 * You can exclude member from chat if you have OWNER permissions or if you want to exclude yourself
 */
@Injectable()
export class PermittedToDeleteChatMemberGuard implements CanActivate {
    constructor(private readonly chatUtilsService: ChatUtilsService) {}

    private logger: Logger = new Logger(PermittedToDeleteChatMemberGuard.name);

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
            this.logger.error(error);

            throw new NotPermittedWsException();
        }
    }
}
