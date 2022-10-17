import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { AuthService } from '@/auth/auth.service';
import { SocketWithUser } from '@/auth/auth.types';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<SocketWithUser>();

            const user = await this.authService.extractUserFromWsClient(client);

            client.data.user = { ...user, password: undefined };

            return !!user;
        } catch (error) {
            const client = context.switchToWs().getClient<SocketWithUser>();
            client.data.user = undefined;

            throw new WsException('Unauthorized');
        }
    }
}
