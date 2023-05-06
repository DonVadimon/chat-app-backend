import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { SocketWithUser } from '@/auth/auth.types';
import { UnauthorizedWsException } from '@/auth/exceptions/unauthorized-ws.exception';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    private logger: Logger = new Logger(WsJwtAuthGuard.name);

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<SocketWithUser>();

            const user = await this.authService.extractUserFromWsClient(client);

            client.data.user = { ...user, password: undefined };

            return !!user;
        } catch (error) {
            const client = context.switchToWs().getClient<SocketWithUser>();
            client.data.user = undefined;

            this.logger.error(error);

            throw new UnauthorizedWsException();
        }
    }
}
