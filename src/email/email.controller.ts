import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiUserEntityResponse } from '@/users/users.swagger';

import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { EmailService } from './email.service';

@ApiTags('email')
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @Post('confirm')
    confirmEmail(@Body() dto: ConfirmEmailDto) {
        return this.emailService.confirmEmail(dto);
    }

    @Post('resend-confirmation')
    async resendConfirmationLink(@Req() request: RequestWithUser) {
        this.emailService.resendConfirmationLink(request.user.id);
    }
}
