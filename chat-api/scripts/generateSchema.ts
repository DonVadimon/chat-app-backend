import path from 'path';

import ora from 'ora';

import * as fsPromises from './fsPromises';
import { globPromise } from './globPromise';

const resolveFromRoot = (...pathSegments: string[]) => path.resolve(__dirname, '..', ...pathSegments);

const BASE_SCHEMA_REGEXP = /(datasource|generator)[^\{\}]*\{(.*?)\}/gms;

const main = async () => {
    const baseSchema = (
        await fsPromises.readFile(resolveFromRoot('prisma', 'baseSchema.prisma'), { encoding: 'utf-8' })
    ).toString();

    const prismaFiles = await globPromise(resolveFromRoot('src', '**', '*.prisma'));

    const mainSchemaContent = [baseSchema]
        .concat(
            await Promise.all(
                prismaFiles.map((schemaPath) =>
                    fsPromises
                        .readFile(schemaPath, { encoding: 'utf-8' })
                        .then((content) => content.toString())
                        .then((content) => content.replace(BASE_SCHEMA_REGEXP, '')),
                ),
            ),
        )
        .join('\n');

    await fsPromises.writeFile(resolveFromRoot('prisma', 'schema.prisma'), mainSchemaContent, { encoding: 'utf-8' });
};

const spinner = ora('Generating Schema File');
spinner.start();

main()
    .then(() => spinner.succeed('Schema File generated'))
    .catch((error) => {
        spinner.fail('Something went wrong!');
        console.error(error);
    });
