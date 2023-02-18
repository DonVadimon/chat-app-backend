declare interface AppConfig {
    NODE_ENV: 'production' | 'development';

    // ? AUTH
    JWT_SECRET: string;
    EXPIRATION_TIME: string;
    AUTH_HEADER_NAME: string;

    // ? DATABASE
    DB_NAME: string;
    DB_USER: string;
    DB_PWD: string;
    DATABASE_URL: string;
    DB_PATH: string;

    // ? PGADMIN
    PGADMIN_PORT: string;
    PGADMIN_UPSTREAM: string;
    PGADMIN_DATA_PATH: string;

    // ? APP
    CHAT_API_PORT: string;
    CHAT_API_UPSTREAM: string;

    // ? EMAIL
    MAIL_TRANSPORT: string;
    MAIL_FROM_NAME: string;
    MAIL_JWT_SECRET: string;
    MAIL_EXPIRATION_TIME: string;
    MAIL_CONFIRM_URL: string;

    // ? FORGOT PASSWORD
    MAIL_FORGOT_PASSWORD_URL: string;

    // ? FILES
    UPLOADED_FILES_DESTINATION: string;

    // ? FACE API
    FACE_API_PORT: string;
    FACE_API_UPSTREAM: string;
    FACE_API_FILE_UPLOAD_DIR: string;

    // ? NGINX
    NGINX_PORT: string;
    NGINX_STATIC_DIR: string;
    NGINX_STATIC_UPSTREAM: string;
}

declare global {
    namespace NodeJS {
        type ProcessEnv = AppConfig;
    }
}
