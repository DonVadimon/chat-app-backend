import { faker } from '@faker-js/faker';
import { Prisma, UserRoles } from '@prisma/client';

export const ADMIN_USERNAME = 'admin';
export const REGULAR_USERNAME = 'regular';

export const userData: Prisma.UserEntityCreateInput[] = [
    // ? users for use
    {
        username: ADMIN_USERNAME,
        password: ADMIN_USERNAME,
        name: ADMIN_USERNAME,
        email: 'admin@admin.com',
        isEmailConfirmed: true,
        roles: [UserRoles.REGULAR, UserRoles.ADMIN],
    },
    {
        username: REGULAR_USERNAME,
        password: REGULAR_USERNAME,
        name: REGULAR_USERNAME,
        email: 'regular@regular.com',
        isEmailConfirmed: true,
        roles: [UserRoles.REGULAR],
    },
    // ? more data
    ...Array.from<unknown, Prisma.UserEntityCreateInput>({ length: 20 }, () => ({
        username: faker.internet.userName(),
        password: 'sanya_lox',
        name: faker.name.fullName(),
        email: faker.internet.email(),
        isEmailConfirmed: false,
        roles: [UserRoles.REGULAR],
    })),
];
