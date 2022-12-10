import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
    imports: [PrismaModule, UsersModule],
    providers: [FilesService],
    controllers: [FilesController],
})
export class FilesModule {}
