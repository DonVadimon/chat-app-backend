import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

import { UsersService } from '@/users/users.service';
import { parseCookieString } from '@/utils/parse-cookie-string';

import { AuthService } from '../auth.service';
import { SocketWithUser } from '../auth.types';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<SocketWithUser>();
            const jwtToken = parseCookieString(client.handshake.headers.cookie)[
                this.configService.get('AUTH_COOKIE_NAME')
            ];

            const userInfo = await this.authService.verifyJwtToken(jwtToken);

            const user = await this.usersService.getById(userInfo.id);

            client.data.user = { ...user, password: undefined };

            return !!user;
        } catch (error) {
            const client = context.switchToWs().getClient<SocketWithUser>();
            client.data.user = undefined;

            throw new WsException('Unauthorized');
        }
    }
}
