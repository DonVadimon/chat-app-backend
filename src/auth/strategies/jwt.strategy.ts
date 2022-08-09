import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '@/users/users.service';

export type ValidationPayload = {
    username: string;
    _id: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UsersService, private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request?.cookies?.[this.configService.get('AUTH_COOKIE_NAME')],
            ]),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: ValidationPayload) {
        return await this.userService.getById(payload._id);
    }
}
