import { PrismaClient } from '@prisma/client';

export default async function prismaLoader(): Promise<PrismaClient> {
    const prisma = new PrismaClient();
    await prisma.$connect();
    return prisma;
}
