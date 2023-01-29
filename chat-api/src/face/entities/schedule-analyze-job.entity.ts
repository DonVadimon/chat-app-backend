import { FaceApiScheduleAnalyzeJobResponse } from '@/face/face.types';

export class ScheduleAnalyzeJobResponse {
    constructor(faceApiResponse: FaceApiScheduleAnalyzeJobResponse) {
        this.jobId = faceApiResponse.job_id;
    }

    jobId: string;
}
