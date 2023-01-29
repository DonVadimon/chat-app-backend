import { Gender } from '@prisma/client';

import { CreateFaceInfoDto } from '@/face/dto/create-face-info.dto';
import { FaceApiCheckAnalyzeJobStatusResponse, FaceApiGender, FaceApiJobStatus } from '@/face/face.types';

const mapFaceApiGender = (faceApiGender: FaceApiGender) => {
    switch (faceApiGender) {
        case 'Male':
            return Gender.MALE;
        case 'Female':
            return Gender.FEMALE;
    }
};

export class CheckAnalyzeJobStatusResponse {
    constructor({ status, result }: FaceApiCheckAnalyzeJobStatusResponse) {
        this.status = status;

        if (result) {
            this.result = {
                age: result.age,
                gender: mapFaceApiGender(result.gender),
                hairColor: result.hair_color,
                leftEyeColor: result.eye_color.left_color_name,
                rightEyeColor: result.eye_color.right_color_name,
                skinColor: result.skin_color,
            };
        }
    }

    status: FaceApiJobStatus;
    result?: CreateFaceInfoDto;
}
