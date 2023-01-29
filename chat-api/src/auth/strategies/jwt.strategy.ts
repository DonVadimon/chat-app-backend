import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ValidationPayload } from '@/auth/auth.types';
import { UsersService } from '@/users/users.service';
import { extractAuthTokenFromHeader } from '@/utils/auth-header';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService<NodeJS.ProcessEnv>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) =>
                    extractAuthTokenFromHeader(request?.headers?.[this.configService.get('AUTH_HEADER_NAME')]),
            ]),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: ValidationPayload) {
        return await this.usersService.getById(payload.id);
    }
}
