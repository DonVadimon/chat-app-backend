import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ValidationPayload } from '@/auth/auth.types';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService, private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request?.cookies?.[this.configService.get('AUTH_COOKIE_NAME')],
            ]),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: ValidationPayload) {
        return await this.usersService.getById(payload.id);
    }
}
