import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { classToPlain } from 'class-transformer';
import { CookieOptions, Response } from 'express';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserEntityResponseDto } from '@/users/dto/user-entity-response.dto';
import { UsersService } from '@/users/users.service';
import { ApiUserEntityResponse, ApiUserEntityWithFaceInfoResponse } from '@/users/users.swagger';
import { constructAuthHeader } from '@/utils/auth-header';

import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UniqueUsernameEmailGuard } from './guards/unique-username-email.guard';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService<AppConfig>,
    ) {}

    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ type: ApiUserEntityWithFaceInfoResponse })
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() request: RequestWithUser, @Res() response: Response) {
        const user = await this.usersService.getByIdWithFaceInfo(request.user.id);
        const responseUser = new UserEntityResponseDto(user);
        const token = await this.authService.generateJwtToken(responseUser);

        response
            .setHeader(this.configService.get('AUTH_HEADER_NAME'), constructAuthHeader(token))
            .send(classToPlain(responseUser));
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
    @ApiBearerAuth()
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        return new UserEntityResponseDto(request.user);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
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
