import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Express } from 'express';

import { LocalFilesInterceptor } from './interceptors/local-files.interceptor';

@Controller('files')
export class FilesController {
    @Post()
    @UseInterceptors(
        LocalFilesInterceptor({
            fieldName: 'file',
        }),
    )
    async addAvatar(@UploadedFile() file: Express.Multer.File) {
        return {
            path: file.path,
            filename: file.originalname,
            mimetype: file.mimetype,
        };
    }
}
