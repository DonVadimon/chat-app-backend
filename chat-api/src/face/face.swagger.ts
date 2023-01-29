import { ApiProperty } from '@nestjs/swagger';
import { FaceInfoEntity, Gender } from '@prisma/client';

import { CheckAnalyzeJobStatusSuccessfulResponse } from './entities/check-analyze-job-status-successful.entity';
import { ScheduleAnalyzeJobResponse } from './entities/schedule-analyze-job.entity';
import { FACE_API_JOB_STATUSES, FaceApiJobStatus } from './face.types';

export class ApiFaceInfoEntityResponse implements FaceInfoEntity {
    @ApiProperty()
    id: number;
    @ApiProperty()
    age: string;
    @ApiProperty({ enum: Gender })
    gender: Gender;
    @ApiProperty()
    leftEyeColor: string;
    @ApiProperty()
    rightEyeColor: string;
    @ApiProperty()
    hairColor: string;
    @ApiProperty()
    skinColor: string;
    @ApiProperty()
    userId: number;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}

export class ApiScheduleAnalyzeJobResponse implements ScheduleAnalyzeJobResponse {
    @ApiProperty()
    jobId: string;
}

export class ApiCheckAnalyzeJobStatusSuccessfulResponse implements CheckAnalyzeJobStatusSuccessfulResponse {
    @ApiProperty({ enum: FACE_API_JOB_STATUSES })
    status: FaceApiJobStatus;
    @ApiProperty()
    result: ApiFaceInfoEntityResponse;
}
