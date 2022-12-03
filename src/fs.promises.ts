import fs from 'fs';

import { glob } from 'glob';

export const writeFile = (path: string, data: string | NodeJS.ArrayBufferView, options: fs.WriteFileOptions = {}) =>
    new Promise<string>((resolve, reject) => {
        fs.writeFile(path, data, options, (error) => {
            if (error) {
                return reject(error);
            }

            resolve(path);
        });
    });

export const readFile = (path: string, options: { encoding?: BufferEncoding; flag?: string } = {}) =>
    new Promise<string | Buffer>((resolve, reject) => {
        fs.readFile(path, options, (error, data) => {
            if (error) {
                return reject(error);
            }

            resolve(data);
        });
    });

export const mkdir = (path: string) =>
    new Promise<string>((resolve, reject) => {
        fs.mkdir(path, (error) => {
            if (error) {
                return reject(error);
            }

            resolve(path);
        });
    });

export const unlink = (path: string) =>
    new Promise<string>((resolve, reject) =>
        fs.unlink(path, (error) => {
            if (error) {
                return reject(error);
            }

            resolve(path);
        }),
    );

export const globPromise = (pattern: string) =>
    new Promise<string[]>((resolve, reject) =>
        glob(pattern, (error, matches) => {
            if (error) {
                reject(error);
            } else {
                resolve(matches);
            }
        }),
    );
