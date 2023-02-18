export type FaceApiScheduleAnalyzeJobResponse = {
    job_id: string;
};

export const FACE_API_JOB_STATUSES = ['pending', 'cancelled', 'done'] as const;

export type FaceApiJobStatus = typeof FACE_API_JOB_STATUSES[number];

export type FaceApiGender = 'Male' | 'Female';

export type FaceApiCheckAnalyzeJobStatusResponse = {
    status: FaceApiJobStatus;
    result?: {
        age: string;
        eye_color: {
            left_color_name: string;
            right_color_name: string;
        };
        gender: FaceApiGender;
        hair_color: string;
        skin_color: string;
    };
};
