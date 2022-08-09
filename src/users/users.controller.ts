import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { RolesGuard } from '@/auth/guards/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @UseGuards(RolesGuard(Roles.ADMIN))
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    @Get()
    @UseGuards(RolesGuard(Roles.ADMIN))
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('cutted')
    @UseGuards(RolesGuard(Roles.ADMIN, Roles.EMPLOYEE))
    getAllUsersCutted() {
        return this.usersService.getAllUsersCutted();
    }

    @Get(':id')
    @UseGuards(RolesGuard(Roles.ADMIN))
    getById(@Param('id') _id: string) {
        return this.usersService.getById(_id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard(Roles.ADMIN))
    updateUser(@Param('id') _id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(_id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard(Roles.ADMIN))
    deleteUser(@Param('id') _id: string) {
        return this.usersService.deleteUser({ _id });
    }
}
