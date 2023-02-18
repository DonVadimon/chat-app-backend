import fs from 'fs';

export const writeFile = (
    path: string,
    data: string | NodeJS.ArrayBufferView,
    options: fs.WriteFileOptions = {},
): Promise<string> =>
    new Promise((resolve, reject) => {
        fs.writeFile(path, data, options, (error) => {
            if (error) {
                reject(error);
            }

            resolve(path);
        });
    });

export const readFile = (
    path: string,
    options: { encoding?: BufferEncoding; flag?: string } = {},
): Promise<string | Buffer> =>
    new Promise((resolve, reject) => {
        fs.readFile(path, options, (error, data) => {
            if (error) {
                reject(error);
            }

            resolve(data);
        });
    });

export const mkdir = (path: string): Promise<string> =>
    new Promise((resolve, reject) => {
        fs.mkdir(path, (error) => {
            if (error) {
                reject(error);
            }

            resolve(path);
        });
    });
