import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CookieOptions, Response } from 'express';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { ApiUserEntityResponse } from '@/users/users.swagger';

import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ type: ApiUserEntityResponse })
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() request: RequestWithUser, @Res() response: Response) {
        const user = request.user;
        const token = await this.authService.generateJwtToken(user);
        response.cookie(
            this.configService.get('AUTH_COOKIE_NAME'),
            token,
            this.getAuthCookieOptions(this.configService.get('EXPIRATION_TIME')),
        );
        return response.send(user);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Post()
    async register(@Body() dto: CreateUserDto, @Res() response: Response) {
        const user = await this.authService.registerUser(dto);
        response.cookie(this.configService.get('AUTH_COOKIE_NAME'), '', this.getAuthCookieOptions(0));
        return response.send(user);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @UseGuards(JwtAuthGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;
        return user;
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() request: RequestWithUser, @Res() response: Response) {
        response.cookie(this.configService.get('AUTH_COOKIE_NAME'), '', this.getAuthCookieOptions(0));
        return response.sendStatus(200);
    }

    private getAuthCookieOptions(maxAge: number): CookieOptions {
        return {
            maxAge,
            httpOnly: true,
            path: '/',
        };
    }
}
