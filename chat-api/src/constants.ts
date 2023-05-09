export const CORS_ORIGINS = [
    'http://localhost:8100',
    'https://chat-app-frontend-seven.vercel.app',
    'https://chat-app-frontend-git-master-antoffee.vercel.app',
    'https://chat-app-frontend-antoffee.vercel.app',
];

export const ALLOWED_HEADERS = [process.env.AUTH_HEADER_NAME, 'Content-Type'];

export const EXPOSED_HEADERS = [process.env.AUTH_HEADER_NAME];
