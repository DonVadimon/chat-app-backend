import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly configService: ConfigService<AppConfig>) {}

    @Get('ping')
    getPing(): string {
        return this.appService.getPong();
    }
}
