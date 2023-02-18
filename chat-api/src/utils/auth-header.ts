export const constructAuthHeader = (token: string) => `Bearer ${token}`;

export const extractAuthTokenFromHeader = (header: string | string[] | undefined) =>
    (header?.toString() || '').replace('Bearer ', '');
