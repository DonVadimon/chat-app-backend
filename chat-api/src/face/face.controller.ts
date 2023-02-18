import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { UpdateFaceInfoDto } from './dto/update-face-info.dto';
import { FaceService } from './face.service';
import {
    ApiCheckAnalyzeJobStatusSuccessfulResponse,
    ApiFaceInfoEntityResponse,
    ApiScheduleAnalyzeJobResponse,
} from './face.swagger';

@ApiTags('face-analyze')
@Controller('face-analyze')
export class FaceController {
    constructor(private readonly faceService: FaceService) {}

    @ApiOkResponse({ type: ApiScheduleAnalyzeJobResponse })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post('schedule')
    async scheduleFaceAnalyze(@Req() request: RequestWithUser) {
        return this.faceService.scheduleFaceAnalyze(request.file);
    }

    @ApiOkResponse({ type: ApiCheckAnalyzeJobStatusSuccessfulResponse })
    @UseGuards(JwtAuthGuard)
    @Get('status/:jobId')
    checkAnalyzeJobStatus(@Param('jobId') jobId: string, @Req() request: RequestWithUser) {
        return this.faceService.checkAnalyzeJobStatus(jobId, request.user.id);
    }

    @ApiOkResponse({ type: ApiFaceInfoEntityResponse })
    @UseGuards(JwtAuthGuard)
    @Get()
    findOne(@Req() request: RequestWithUser) {
        return this.faceService.getById(request.user.id);
    }

    @ApiOkResponse({ type: ApiFaceInfoEntityResponse })
    @UseGuards(JwtAuthGuard)
    @Patch()
    update(@Req() request: RequestWithUser, @Body() updateFaceDto: UpdateFaceInfoDto) {
        return this.faceService.updateInfoByUserId(request.user.id, updateFaceDto);
    }

    @ApiOkResponse({ type: ApiFaceInfoEntityResponse })
    @UseGuards(JwtAuthGuard)
    @Delete()
    remove(@Req() request: RequestWithUser) {
        return this.faceService.deleteInfoByUserId(request.user.id);
    }
}
