import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';

import { RolesGuard } from '@/auth/guards/roles.guard';

import { CheckUsernameAvailableDto } from './dto/check-username-available.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiCheckUsernameAvailableResponse, ApiUserEntityResponse } from './users.swagger';
import { UserReq } from './users.types';

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

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Post()
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse, isArray: true })
    @Get()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Get('self')
    @UseGuards(RolesGuard(UserRoles.ADMIN, UserRoles.REGULAR))
    getSelf(@Req() request: UserReq) {
        return this.usersService.getById(request.user.id);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Get(':id')
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    getById(@Param('id') id: number) {
        return this.usersService.getById(id);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Patch('self-update')
    @UseGuards(RolesGuard(UserRoles.ADMIN, UserRoles.REGULAR))
    updateSelf(@Req() request: UserReq, @Body() dto: UpdateUserDto) {
        // ? dont allow to change roles
        dto.roles = undefined;

        return this.usersService.updateUser(request.user.id, dto);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Patch(':id')
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(id, dto);
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Delete(':id')
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    deleteUser(@Param('id') id: number) {
        return this.usersService.deleteUser({ id });
    }
}
