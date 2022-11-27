import { ChatRoles, ChatRoomType, Prisma, PrismaClient, UserEntity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { ADMIN_USERNAME, REGULAR_USERNAME, userData } from './mock/users.mock';

const prisma = new PrismaClient();

const getChatRoomsData = (adminId: number, regularId: number): Prisma.ChatRoomEntityCreateInput[] => [
    {
        type: ChatRoomType.PRIVATE,
        description: 'Mock private chat',
        members: {
            connect: [{ username: ADMIN_USERNAME }, { username: REGULAR_USERNAME }],
        },
        messages: {
            create: [
                {
                    author: {
                        connect: {
                            username: ADMIN_USERNAME,
                        },
                    },
                    content: 'Hello from Admin in private chat',
                },
                {
                    author: {
                        connect: {
                            username: REGULAR_USERNAME,
                        },
                    },
                    content: 'Hello from Regular in private chat',
                },
            ],
        },
        chatPermissions: {
            createMany: {
                data: [
                    {
                        userEntityId: adminId,
                        role: ChatRoles.OWNER,
                    },
                    {
                        userEntityId: regularId,
                        role: ChatRoles.OWNER,
                    },
                ],
            },
        },
    },
    {
        type: ChatRoomType.GROUP,
        name: 'Group chat',
        description: 'Mock group chat',
        members: {
            connect: [{ username: ADMIN_USERNAME }, { username: REGULAR_USERNAME }],
        },
        messages: {
            create: [
                {
                    author: {
                        connect: {
                            username: ADMIN_USERNAME,
                        },
                    },
                    content: 'Hello from Admin in group chat',
                },
                {
                    author: {
                        connect: {
                            username: REGULAR_USERNAME,
                        },
                    },
                    content: 'Hello from Regular in group chat',
                },
            ],
        },
        chatPermissions: {
            createMany: {
                data: [
                    {
                        userEntityId: adminId,
                        role: ChatRoles.OWNER,
                    },
                    {
                        userEntityId: regularId,
                        role: ChatRoles.MEMBER,
                    },
                ],
            },
        },
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
    const users: UserEntity[] = [];

    for (const userDto of userData) {
        const createdUser = await createUser(userDto);
        users.push(createdUser);
        console.log(`Created user ${createdUser.username} with id ${createdUser.id}`);
    }
    const chatRoomsData = getChatRoomsData(
        users.find((user) => user.username === ADMIN_USERNAME).id,
        users.find((user) => user.username === REGULAR_USERNAME).id,
    );
    for (const roomDto of chatRoomsData) {
        const createdRoom = await prisma.chatRoomEntity.create({ data: roomDto });
        console.log(`Created room ${createdRoom.name} with id ${createdRoom.id}`);
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
