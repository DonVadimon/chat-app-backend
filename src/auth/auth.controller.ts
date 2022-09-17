import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ApiUserEntityResponse } from '@/users/users.swagger';
import { UserReq } from '@/users/users.types';

import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ type: ApiUserEntityResponse })
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() request: UserReq, @Res() response: Response) {
        const user = request.user;
        const token = await this.authService.generateJwtToken(user);
        response.cookie(this.configService.get('AUTH_COOKIE_NAME'), token, {
            maxAge: this.configService.get('EXPIRATION_TIME'),
            httpOnly: true,
            path: '/',
        });
        return response.send(user);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @UseGuards(JwtAuthGuard)
    @Get()
    authenticate(@Req() request: UserReq) {
        const user = request.user;
        user.password = undefined;
        return user;
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() request: UserReq, @Res() response: Response) {
        response.cookie(this.configService.get('AUTH_COOKIE_NAME'), '', {
            maxAge: 0,
            httpOnly: true,
            path: '/',
        });
        return response.sendStatus(200);
    }
}
