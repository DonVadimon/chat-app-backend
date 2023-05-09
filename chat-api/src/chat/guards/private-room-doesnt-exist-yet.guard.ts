import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';

import { SocketWithUser } from '@/auth/auth.types';
import { CreatePrivateChatRoomDto } from '@/chat/dto/create-private-chat-room.dto';
import { PrivateRoomAlreadyExistWsException } from '@/chat/exceptions/private-room-already-exist-ws.exception';
import { ChatUtilsService } from '@/chat/services/chat.utils.service';

/**
 * You can create new PRIVATE chat room only if it doedn't exist yet
 */
@Injectable()
export class PrivateRoomDoesntExistYetGuard implements CanActivate {
    constructor(private readonly chatUtilsService: ChatUtilsService) {}

    private logger: Logger = new Logger(PrivateRoomDoesntExistYetGuard.name);

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<SocketWithUser>();
            const dto = context.switchToWs().getData<CreatePrivateChatRoomDto>();

            const isRoomAlreadyExist = await this.chatUtilsService.isPrivateRoomAlreadyExist({
                firstMemberId: client.data.user.id,
                secondMemberId: dto.secondMemberId,
            });

            return !isRoomAlreadyExist;
        } catch (error) {
            this.logger.error(error);

            throw new PrivateRoomAlreadyExistWsException();
        }
    }
}
