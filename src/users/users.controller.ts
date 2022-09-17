import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserRoles } from '@prisma/client';

import { RolesGuard } from '@/auth/guards/roles.guard';

import { CheckUsernameAvailableDto } from './dto/check-username-available.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { UserReq } from './users.types';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('/check-username')
    async checkUsernameAvailable(@Body() dto: CheckUsernameAvailableDto) {
        const findedUser = await this.usersService.getByUsername(dto.username);

        return { available: !findedUser };
    }

    @Post()
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    @Get()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('/self')
    @UseGuards(RolesGuard(UserRoles.ADMIN, UserRoles.REGULAR))
    getSelf(@Req() request: UserReq) {
        return this.usersService.getById(request.user.id);
    }

    @Get(':id')
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    getById(@Param('id') id: number) {
        return this.usersService.getById(id);
    }

    @Patch('/self-update')
    @UseGuards(RolesGuard(UserRoles.ADMIN, UserRoles.REGULAR))
    updateSelf(@Req() request: UserReq, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(request.user.id, dto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    deleteUser(@Param('id') id: number) {
        return this.usersService.deleteUser({ id });
    }
}
