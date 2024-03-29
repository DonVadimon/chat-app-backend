import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';

import { RequestWithUser } from '@/auth/auth.types';
import { RolesGuard } from '@/auth/guards/roles.guard';

import { CheckUsernameAvailableDto } from './dto/check-username-available.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntityResponseDto } from './dto/user-entity-response.dto';
import { UsersService } from './users.service';
import {
    ApiCheckUsernameAvailableResponse,
    ApiUserEntityResponse,
    ApiUserEntityWithFaceInfoResponse,
} from './users.swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOkResponse({ type: ApiCheckUsernameAvailableResponse })
    @Post('check-username')
    async checkUsernameAvailable(@Body() dto: CheckUsernameAvailableDto) {
        const findedUser = await this.usersService.getByUsername(dto.username);

        return { available: !findedUser };
    }

    @ApiOkResponse({ type: ApiUserEntityResponse, isArray: true })
    @Get()
    @ApiBearerAuth()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    async getAllUsers() {
        const users = await this.usersService.getAllUsers();

        return users.map((user) => new UserEntityResponseDto(user));
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Get('self')
    @ApiBearerAuth()
    @UseGuards(RolesGuard(UserRoles.ADMIN, UserRoles.REGULAR))
    async getSelf(@Req() request: RequestWithUser) {
        return new UserEntityResponseDto(await this.usersService.getById(request.user.id));
    }

    @ApiOkResponse({ type: ApiUserEntityWithFaceInfoResponse })
    @Get('self-face-info')
    @ApiBearerAuth()
    @UseGuards(RolesGuard(UserRoles.ADMIN, UserRoles.REGULAR))
    async getSelfFaceInfo(@Req() request: RequestWithUser) {
        return new UserEntityResponseDto(await this.usersService.getByIdWithFaceInfo(request.user.id));
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    async getById(@Param('id') id: number) {
        return new UserEntityResponseDto(await this.usersService.getById(id));
    }

    @ApiOkResponse({ type: ApiUserEntityWithFaceInfoResponse })
    @Patch('self-update')
    @ApiBearerAuth()
    @UseGuards(RolesGuard(UserRoles.ADMIN, UserRoles.REGULAR))
    async updateSelf(@Req() request: RequestWithUser, @Body() dto: UpdateUserDto) {
        // ? dont allow to change self roles
        dto.roles = undefined;

        return new UserEntityResponseDto(await this.usersService.updateUser(request.user.id, dto));
    }

    @ApiOkResponse({ type: ApiUserEntityWithFaceInfoResponse })
    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    async updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        return new UserEntityResponseDto(await this.usersService.updateUser(id, dto));
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    async deleteUser(@Param('id') id: number) {
        return new UserEntityResponseDto(await this.usersService.deleteUser({ id }));
    }
}
