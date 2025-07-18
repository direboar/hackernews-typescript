import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// Prismaのテスト実行。
async function main() {
    const newLink = await prisma.link.create({
        data: {
            description: "Prisma with Nexus",
            url: "https://prisma.io",
        },
    });

    const allLinks = await prisma.link.findMany();
}

// 4
main()
    .catch((e) => {
        throw e;
    })
    // 5
    .finally(async () => {
        await prisma.$disconnect();
    });