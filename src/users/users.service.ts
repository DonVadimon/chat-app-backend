import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles, User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit() {
        try {
            const user = await this.getByUsername(this.configService.get('ROOT_USERNAME'));
            if (!user) {
                const rootUser = await this.createUser({
                    username: this.configService.get('ROOT_USERNAME'),
                    password: this.configService.get('ROOT_PASSWORD'),
                    roles: Object.values(Roles),
                    email: this.configService.get('ROOT_MAIL'),
                    git: this.configService.get('ROOT_GIT'),
                    name: this.configService.get('ROOT_NAME'),
                    phone: this.configService.get('ROOT_PHONE'),
                    telegram: this.configService.get('ROOT_TG'),
                    urlPrefixes: [],
                });
                console.log('ROOT_USER CREATED -> ', rootUser);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async getAllUsers(): Promise<User[]> {
        const users = await this.userModel.find();
        users.forEach((user) => (user.password = undefined));
        return users;
    }

    async getAllUsersCutted() {
        const users = await this.getAllUsers();
        return users.map(({ username, name, roles, _id }) => ({ username, name, roles, _id }));
    }

    async getByUsername(username: string): Promise<User | undefined> {
        return await this.userModel.findOne({ username });
    }

    async getById(id: string): Promise<User | undefined> {
        return await this.userModel.findById(id);
    }

    async createUser({ password, ...rest }: CreateUserDto): Promise<User> {
        const findedUser = await this.getByUsername(rest.username);
        if (findedUser) {
            throw new Error('User with that username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const dto = {
            ...rest,
            password: hashedPassword,
        };
        const createdUser = await this.userModel.create(dto);
        createdUser.password = undefined;
        return createdUser;
    }

    async updateUser(_id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.userModel.findOneAndUpdate({ _id }, dto, { new: true });
        user.password = undefined;
        return user;
    }

    async deleteUser(dto: DeleteUserDto): Promise<User> {
        return await this.userModel.findOneAndDelete(dto);
    }
}
