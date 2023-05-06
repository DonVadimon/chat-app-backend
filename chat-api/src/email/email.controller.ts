import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserExistGuard } from '@/auth/guards/user-exist.guard';
import { ChangePasswordDto } from '@/email/dto/change-password.dto';
import { UserEntityResponseDto } from '@/users/dto/user-entity-response.dto';
import { ApiUserEntityResponse } from '@/users/users.swagger';

import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { EmailConfirmedGuard } from './guards/email-confirmed.guard';
import { EqualEmailsGuard } from './guards/equal-emails.guard';
import { EmailService } from './services/email.service';

@ApiTags('email')
@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @ApiOkResponse({ type: ApiUserEntityResponse })
    @ApiBearerAuth()
    @Post('confirm')
    @UseGuards(JwtAuthGuard, EqualEmailsGuard)
    async confirmEmail(@Body() dto: ConfirmEmailDto) {
        return new UserEntityResponseDto(await this.emailService.confirmEmail(dto));
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('resend-confirmation')
    async resendConfirmationLink(@Req() request: RequestWithUser) {
        this.emailService.resendConfirmationLink(request.user.id);
    }

    @UseGuards(UserExistGuard({ email: 'email' }), EmailConfirmedGuard)
    @Post('forgot-password')
    async forgotPassword(@Req() request: RequestWithUser, @Body() dto: ForgotPasswordDto) {
        await this.emailService.sendForgotPasswordEmail(dto);
    }

    @Post('change-password')
    async changePassword(@Body() dto: ChangePasswordDto) {
        await this.emailService.changePassword(dto);
    }
}
