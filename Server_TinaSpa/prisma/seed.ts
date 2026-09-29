import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
  { name: 'ADMIN', description: 'Full system access' },
  { name: 'STAFF', description: 'Staff operations access' },
  { name: 'CUSTOMER', description: 'Default customer access' },
] as const;

async function main() {
  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
