export const parseCookieString = (cookie: string | undefined): Record<string, string> =>
    (cookie ?? '').split('; ').reduce<Record<string, string>>((accum, cookiePair) => {
        const [key, value] = cookiePair.split('=');
        return Object.assign(accum, { [key]: value });
    }, {});
