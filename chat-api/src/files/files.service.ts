import path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { globPromise } from 'scripts/globPromise';

import { unlink } from '@/fs.promises';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FilesService {
    constructor(private readonly configService: ConfigService<AppConfig>, private readonly prisma: PrismaService) {}
    private logger = new Logger(FilesService.name);

    deleteFile(filePath: string) {
        return unlink(
            path.resolve(process.cwd(), this.configService.get('UPLOADED_FILES_DESTINATION'), filePath ?? ''),
        ).catch((error) => {
            this.logger.error(`No such file or directory by path ${filePath}`, error);
        });
    }

    /**
     * Clean up uploaded files every day at 04:00
     */
    @Cron('0 4 * * * *')
    async cleanUploadedFiles() {
        this.logger.log(`🛠 - Starting uploads clean up - 🛠`);

        const globPattern = path.resolve(
            process.cwd(),
            this.configService.get('UPLOADED_FILES_DESTINATION'),
            '**',
            '*',
        );

        const filePaths = await globPromise(globPattern);

        const savedFiles = await this.prisma.fileEntity.findMany({
            select: {
                path: true,
            },
        });
        const savedFilesPaths = new Set(savedFiles.map((file) => path.join(process.cwd(), file.path)));

        const filesToRemove = filePaths.filter((filePath) => !savedFilesPaths.has(filePath));

        filesToRemove.forEach((filePath) => {
            this.logger.log(`🛠 - Deleting file by path ${filePath} - 🛠`);
            unlink(filePath).catch((error) =>
                this.logger.error(`🔥 - Error occured deleting file by path ${filePath} - 🔥`, error),
            );
        });

        this.logger.log(`🛠 - End of uploads clean up - 🛠`);
    }
}
