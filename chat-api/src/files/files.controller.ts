import { Controller, Delete, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserEntityResponseDto } from '@/users/dto/user-entity-response.dto';
import { UsersService } from '@/users/users.service';
import { ApiUserEntityWithFaceInfoResponse } from '@/users/users.swagger';

import { TransformedUploadedFile } from './decorators/transformed-uploaded-file.decorator';
import { LocalFilesInterceptor } from './interceptors/local-files.interceptor';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOkResponse({ type: ApiUserEntityWithFaceInfoResponse })
    @Post('avatar')
    @UseInterceptors(
        LocalFilesInterceptor({
            fieldName: 'avatar',
            imageFilter: true,
        }),
    )
    async addOrUpdateAvatar(@Req() request: RequestWithUser, @TransformedUploadedFile() avatar: Express.Multer.File) {
        return new UserEntityResponseDto(
            await this.usersService.addOrUpdateAvatar({ avatar, userId: request.user.id }),
        );
    }

    @ApiOkResponse({ type: ApiUserEntityWithFaceInfoResponse })
    @Delete('avatar')
    async deleteAvatar(@Req() request: RequestWithUser) {
        return new UserEntityResponseDto(await this.usersService.deleteAvatar(request.user.id));
    }
}
