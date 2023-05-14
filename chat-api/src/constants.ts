// File is unused since CORS settings moved to nginx

export const CORS_ORIGINS = [
    'http://localhost:8100',
    'https://chat-app-frontend-seven.vercel.app',
    'https://chat-app-frontend-git-master-antoffee.vercel.app',
    'https://chat-app-frontend-antoffee.vercel.app',
    'https://hoppscotch.io',
    'capacitor://localhost',
    'http://localhost',
    'ionic://localhost',
];

export const ALLOWED_HEADERS = [
    process.env.AUTH_HEADER_NAME,
    'Accept',
    'Cache-Control',
    'Content-Type',
    'DNT',
    'If-Modified-Since',
    'Keep-Alive',
    'Origin',
    'User-Agent',
    'X-Host',
];

export const EXPOSED_HEADERS = [process.env.AUTH_HEADER_NAME];
