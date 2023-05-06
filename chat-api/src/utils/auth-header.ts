import { IncomingHttpHeaders } from 'http';

export const constructAuthHeader = (token: string) => `Bearer ${token}`;

export const extractAuthTokenFromHeader = (header: string | string[] | undefined) =>
    (header?.toString() || '').replace('Bearer ', '');

export const extractAuthHeader = (headers: IncomingHttpHeaders, authHeaderName: string) =>
    headers?.[authHeaderName] || headers?.[authHeaderName.toString().toLowerCase()];
