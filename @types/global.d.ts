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
        }

        interface ProcessEnv extends AppConfig {
            NODE_ENV: 'production' | 'development';
        }
    }
}
