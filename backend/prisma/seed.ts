import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Сид первого superadmin из SUPERADMIN_EMAIL/PASSWORD (или локальные дефолты).
 * Upsert — повторный seed не ломает стенд и обновляет пароль/роль.
 */
async function main() {
  const email = process.env.SUPERADMIN_EMAIL || 'admin@quranplus.local';
  const password = process.env.SUPERADMIN_PASSWORD || 'Admin123!';

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.superadmin,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      displayName: 'Super Admin',
      role: Role.superadmin,
    },
  });

  console.log(`Superadmin ready: ${user.email} (${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
