import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserEntity, UserRoles } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';

import { EmailService } from '@/email/email.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';
import { parseCookieString } from '@/utils/parse-cookie-string';

import { ValidationPayload } from './auth.types';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService<NodeJS.ProcessEnv>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    async validateUser(username: string, password: string): Promise<Omit<UserEntity, 'password'> | null> {
        try {
            const user = await this.usersService.getByUsername(username);
            const isPasswordMatching = await bcrypt.compare(password, user.password);
            if (!isPasswordMatching) {
                throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
            }
            user.password = undefined;
            return user;
        } catch (error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }

    async registerUser(dto: CreateUserDto) {
        dto.roles = [UserRoles.REGULAR];

        const user = await this.usersService.createUser(dto);

        await this.emailService.sendConfirmEmailMessage(user);

        return user;
    }

    generateJwtToken({ id, username }: ValidationPayload) {
        const payload = { username, id };
        return this.jwtService.signAsync(payload);
    }

    verifyJwtToken(jwtToken: string) {
        return this.jwtService.verifyAsync<ValidationPayload>(jwtToken);
    }

    async extractUserFromWsClient(client: Socket) {
        const jwtToken = parseCookieString(client.handshake.headers.cookie)[this.configService.get('AUTH_COOKIE_NAME')];
        const userInfo = await this.verifyJwtToken(jwtToken);
        const user = await this.usersService.getById(userInfo.id);
        client.data.user = { ...user, password: undefined };
        return user;
    }
}
