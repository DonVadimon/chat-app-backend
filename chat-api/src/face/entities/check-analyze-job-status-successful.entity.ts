import { FaceInfoEntity } from '@prisma/client';

import { FaceApiJobStatus } from '@/face/face.types';

export class CheckAnalyzeJobStatusSuccessfulResponse {
    constructor(faceInfo: FaceInfoEntity) {
        this.status = 'done';
        this.result = faceInfo;
    }

    status: FaceApiJobStatus;
    result: FaceInfoEntity;
}
