import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/auth/auth.types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiFile } from '@/files/decorators/api-file.decorator';

import { UpdateFaceInfoDto } from './dto/update-face-info.dto';
import { FaceService } from './face.service';
import {
    ApiCheckAnalyzeJobStatusSuccessfulResponse,
    ApiFaceInfoEntityResponse,
    ApiScheduleAnalyzeJobResponse,
} from './face.swagger';

@ApiTags('face-analyze')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('face-analyze')
export class FaceController {
    constructor(private readonly faceService: FaceService) {}

    @ApiOkResponse({ type: ApiScheduleAnalyzeJobResponse })
    @ApiConsumes('multipart/form-data')
    @ApiFile('file')
    @UseInterceptors(FileInterceptor('file'))
    @Post('schedule')
    async scheduleFaceAnalyze(@Req() request: RequestWithUser) {
        return this.faceService.scheduleFaceAnalyze(request.file);
    }

    @ApiOkResponse({ type: ApiCheckAnalyzeJobStatusSuccessfulResponse })
    @Get('status/:jobId')
    checkAnalyzeJobStatus(@Param('jobId') jobId: string, @Req() request: RequestWithUser) {
        return this.faceService.checkAnalyzeJobStatus(jobId, request.user.id);
    }

    @ApiOkResponse({ type: ApiFaceInfoEntityResponse })
    @Get()
    findOne(@Req() request: RequestWithUser) {
        return this.faceService.getById(request.user.id);
    }

    @ApiOkResponse({ type: ApiFaceInfoEntityResponse })
    @Patch()
    update(@Req() request: RequestWithUser, @Body() updateFaceDto: UpdateFaceInfoDto) {
        return this.faceService.updateInfoByUserId(request.user.id, updateFaceDto);
    }

    @ApiOkResponse({ type: ApiFaceInfoEntityResponse })
    @Delete()
    remove(@Req() request: RequestWithUser) {
        return this.faceService.deleteInfoByUserId(request.user.id);
    }
}
