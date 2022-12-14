import { Controller, Delete, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserEntityResponseDto } from '@/users/dto/user-entity-response.dto';
import { UsersService } from '@/users/users.service';
import { ApiUserEntityResponse } from '@/users/users.swagger';

import { TransformedUploadedFile } from './decorators/transformed-uploaded-file.decorator';
import { LocalFilesInterceptor } from './interceptors/local-files.interceptor';

@ApiTags('files')
@Controller('files')
export class FilesController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Post('avatar')
    @UseInterceptors(
        LocalFilesInterceptor({
            fieldName: 'avatar',
            imageFilter: true,
        }),
    )
    @UseGuards(JwtAuthGuard)
    async addOrUpdateAvatar(@Req() request: RequestWithUser, @TransformedUploadedFile() avatar: Express.Multer.File) {
        return new UserEntityResponseDto(
            await this.usersService.addOrUpdateAvatar({ avatar, userId: request.user.id }),
        );
    }

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Delete('avatar')
    @UseGuards(JwtAuthGuard)
    async deleteAvatar(@Req() request: RequestWithUser) {
        return new UserEntityResponseDto(await this.usersService.deleteAvatar(request.user.id));
    }
}
