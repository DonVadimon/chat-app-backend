import { Prisma, PrismaClient, UserRoles } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const userData: Prisma.UserEntityCreateInput[] = [
    {
        username: 'admin',
        password: 'admin',
        name: 'admin',
        email: 'admin@admin.com',
        roles: [UserRoles.REGULAR, UserRoles.ADMIN],
    },
    {
        username: 'regular',
        password: 'regular',
        name: 'regular',
        email: 'regular@regular.com',
        roles: [UserRoles.REGULAR],
    },
];

const createUser = async ({ password, ...rest }: Prisma.UserEntityCreateInput) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const dto: Prisma.UserEntityCreateInput = {
        ...rest,
        password: hashedPassword,
    };
    const createdUser = await prisma.userEntity.create({
        data: dto,
    });

    return createdUser;
};

async function main() {
    console.log(`Start seeding ...`);
    for (const userDto of userData) {
        const createdUser = await createUser(userDto);
        console.log(`Created user ${createdUser.username} with id ${createdUser.id}`);
    }
    console.log(`Seeding finished.`);
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
