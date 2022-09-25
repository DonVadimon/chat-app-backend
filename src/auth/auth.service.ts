import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { UsersService } from '@/users/users.service';

import { UserInReq, ValidationPayload } from './auth.types';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

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

    async generateJwtToken({ id, username }: UserInReq) {
        const payload: ValidationPayload = { username, id };
        return this.jwtService.sign(payload);
    }

    verifyJwtToken(jwtToken: string) {
        return this.jwtService.verifyAsync<ValidationPayload>(jwtToken);
    }
}
