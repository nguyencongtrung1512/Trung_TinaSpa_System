import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedBranches } from './branch.seed.js';
import { seedServiceCatalog } from './service-catalog.seed.js';
import { seedProducts } from './product.seed.js';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 12;

async function seedAdmin() {
  const phone = process.env.SEED_ADMIN_PHONE;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_FULLNAME ?? 'Administrator';

  if (!phone || !password) {
    console.log('Skip seeding admin: SEED_ADMIN_PHONE / SEED_ADMIN_PASSWORD not set');
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { phone },
    update: { role: 'ADMIN' },
    create: { phone, passwordHash, fullName, role: 'ADMIN' },
  });

  console.log(`Seeded admin account: ${phone}`);
}

try {
  await seedAdmin();
  await seedServiceCatalog(prisma);
  await seedBranches(prisma);
  await seedProducts(prisma);
} finally {
  await prisma.$disconnect();
}
