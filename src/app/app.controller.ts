import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getClient(@Res() response: Response) {
        response.redirect('/client');
    }

    @Get('hello')
    getHello(): string {
        return this.appService.getHello();
    }
}
