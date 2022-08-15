import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRoles } from '@prisma/client';

import { RolesGuard } from '@/auth/guards/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    @Get()
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get(':id')
    @UseGuards(RolesGuard(UserRoles.ADMIN))
    getById(@Param('id') id: number) {
        return this.usersService.getById(id);
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
