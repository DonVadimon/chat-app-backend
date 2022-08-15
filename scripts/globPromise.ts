import glob from 'glob';

export const globPromise = (pattern: string) =>
    new Promise<string[]>((resolve, reject) =>
        glob(pattern, (error, matches) => {
            if (error) {
                reject(error);
            }

            resolve(matches);
        }),
    );
