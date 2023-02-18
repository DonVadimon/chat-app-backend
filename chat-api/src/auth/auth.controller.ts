import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { classToPlain } from 'class-transformer';
import { CookieOptions, Response } from 'express';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserEntityResponseDto } from '@/users/dto/user-entity-response.dto';
import { ApiUserEntityResponse } from '@/users/users.swagger';
import { constructAuthHeader } from '@/utils/auth-header';

import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UniqueUsernameEmailGuard } from './guards/unique-username-email.guard';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService<AppConfig>) {}

    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ type: ApiUserEntityResponse })
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() request: RequestWithUser, @Res() response: Response) {
        const user = new UserEntityResponseDto(request.user);
        const token = await this.authService.generateJwtToken(user);

        response
            .setHeader(this.configService.get('AUTH_HEADER_NAME'), constructAuthHeader(token))
            .send(classToPlain(user));
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @UseGuards(UniqueUsernameEmailGuard)
    @Post('register')
    async register(@Body() dto: CreateUserDto, @Res() response: Response) {
        const user = await this.authService.registerUser(dto);
        const token = await this.authService.generateJwtToken(user);
        response
            .setHeader(this.configService.get('AUTH_HEADER_NAME'), constructAuthHeader(token))
            .send(classToPlain(new UserEntityResponseDto(user)));
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @UseGuards(JwtAuthGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        return new UserEntityResponseDto(request.user);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Req() { user }: RequestWithUser, dto: ChangePasswordDto) {
        return new UserEntityResponseDto(await this.authService.changePassword(dto, user.email));
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Res() response: Response) {
        response.setHeader(this.configService.get('AUTH_HEADER_NAME'), '').sendStatus(HttpStatus.OK);
    }

    /**
     * @deprecated
     *
     * was used with cookie based authorization
     */
    private getAuthCookieOptions(maxAge: number): CookieOptions {
        const productionOptions: CookieOptions = {
            sameSite: 'none',
            secure: true,
        };

        return Object.assign(
            {
                maxAge,
                httpOnly: true,
                path: '/',
            },
            this.configService.get('NODE_ENV') === 'production' ? productionOptions : {},
        );
    }
}
