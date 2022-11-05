declare global {
    namespace NodeJS {
        interface AppConfig {
            // ? AUTH
            JWT_SECRET: string;
            EXPIRATION_TIME: string;
            AUTH_COOKIE_NAME: string;

            // ? DATABASE
            DB_NAME: string;
            DB_USER: string;
            DB_PWD: string;
            DATABASE_URL: string;
            DB_PATH: string;

            // ? PGADMIN
            PGADMIN_PORT: string;
            PGADMIN_DATA_PATH: string;

            // ? APP
            APP_PORT: string;

            // ? EMAIL
            MAIL_TRANSPORT: string;
            MAIL_FROM_NAME: string;
            MAIL_JWT_SECRET: string;
            MAIL_EXPIRATION_TIME: string;
            MAIL_CONFIRM_URL: string;

            // ? FORGOT PASSWORD
            MAIL_FORGOT_PASSWORD_URL: string;
        }

        interface ProcessEnv extends AppConfig {
            NODE_ENV: 'production' | 'development';
        }
    }
}
