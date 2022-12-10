import path from 'path';

import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';

import { ALL_IMAGE_MIME_TYPES, ImageMimeTypes } from '@/files/files.types';

type LocalFilesInterceptorOptions = {
    fieldName: string;
    path?: string;
    imageFilter?: boolean | ImageMimeTypes[];
};

export function LocalFilesInterceptor(options: LocalFilesInterceptorOptions): Type<NestInterceptor> {
    @Injectable()
    class Interceptor implements NestInterceptor {
        fileInterceptor: NestInterceptor;

        constructor(configService: ConfigService) {
            const multerOptions: MulterOptions = {
                storage: diskStorage({
                    destination: path.resolve(configService.get('UPLOADED_FILES_DESTINATION'), options.path ?? ''),
                    filename: (req, file, cb) =>
                        cb(null, `${file.fieldname}_${req.id}_${Date.now()}${path.extname(file.originalname)}`),
                }),
                fileFilter: (_, file, cb) => {
                    let accepted = true;
                    switch (typeof options.imageFilter) {
                        case 'boolean':
                            accepted =
                                options.imageFilter && ALL_IMAGE_MIME_TYPES.includes(file.mimetype as ImageMimeTypes);
                            break;
                        case 'object':
                            accepted = options.imageFilter.includes(file.mimetype as ImageMimeTypes);
                            break;
                    }
                    cb(null, accepted);
                },
            };

            this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions))();
        }

        async intercept(...args: Parameters<NestInterceptor['intercept']>) {
            return this.fileInterceptor.intercept(...args);
        }
    }

    return mixin(Interceptor);
}
