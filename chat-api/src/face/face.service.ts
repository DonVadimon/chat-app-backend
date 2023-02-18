import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateFaceInfoDto } from './dto/create-face-info.dto';
import { UpdateFaceInfoDto } from './dto/update-face-info.dto';
import { CheckAnalyzeJobStatusResponse } from './entities/check-analyze-job-status';
import { CheckAnalyzeJobStatusSuccessfulResponse } from './entities/check-analyze-job-status-successful.entity';
import { ScheduleAnalyzeJobResponse } from './entities/schedule-analyze-job.entity';
import { FaceApiCheckAnalyzeJobStatusResponse, FaceApiScheduleAnalyzeJobResponse } from './face.types';

@Injectable()
export class FaceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService<AppConfig>,
        private readonly httpService: HttpService,
    ) {}

    private get faceApiHost() {
        return `http://${this.configService.get('FACE_API_UPSTREAM')}:${this.configService.get('FACE_API_PORT')}`;
    }

    async scheduleFaceAnalyze(file: Express.Multer.File): Promise<ScheduleAnalyzeJobResponse> {
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname);
        const faceApiResponse = await this.httpService.axiosRef
            .post<FaceApiScheduleAnalyzeJobResponse>(`${this.faceApiHost}/schedule`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    // get the POST content length
                    'Content-Length': formData.getLengthSync(),
                },
            })
            .then((response) => response.data);

        return new ScheduleAnalyzeJobResponse(faceApiResponse);
    }

    async checkAnalyzeJobStatus(jobId: string, userId: number) {
        try {
            const faceApiResponse = await this.httpService.axiosRef
                .get<FaceApiCheckAnalyzeJobStatusResponse>(`${this.faceApiHost}/status/${jobId}`)
                .then((response) => response.data);

            const response = new CheckAnalyzeJobStatusResponse(faceApiResponse);

            switch (response.status) {
                case 'pending':
                case 'cancelled':
                    return response;
                case 'done':
                    return new CheckAnalyzeJobStatusSuccessfulResponse(await this.createInfo(response.result, userId));
            }
        } catch (error) {
            return new CheckAnalyzeJobStatusResponse({ status: 'cancelled' });
        }
    }

    createInfo(dto: CreateFaceInfoDto, userId: number) {
        return this.prisma.faceInfoEntity.create({
            data: {
                ...dto,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    getById(id: number) {
        return this.prisma.faceInfoEntity.findFirst({
            where: {
                id,
            },
        });
    }

    getByUserId(userId: number) {
        return this.prisma.faceInfoEntity.findFirst({
            where: {
                userId,
            },
        });
    }

    updateInfoByUserId(userId: number, dto: UpdateFaceInfoDto) {
        return this.prisma.faceInfoEntity.update({
            where: {
                userId,
            },
            data: dto,
        });
    }

    deleteInfoByUserId(userId: number) {
        return this.prisma.faceInfoEntity.delete({
            where: {
                userId,
            },
        });
    }
}
