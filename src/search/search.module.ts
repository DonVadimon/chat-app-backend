import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [PrismaModule, UsersModule],
    providers: [SearchService],
    controllers: [SearchController],
})
export class SearchModule {}
