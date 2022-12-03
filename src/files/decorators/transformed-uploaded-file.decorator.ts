import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

export const TransformedUploadedFile = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const file = request.file;
    if (!file) {
        throw new HttpException('Cant save file', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    file.path = request.file.path.slice(process.cwd().length);

    return file;
});
