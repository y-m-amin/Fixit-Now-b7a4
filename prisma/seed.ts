import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@fixitnow.com';
const ADMIN_PASSWORD = 'Admin@12345';

async function main() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: 'FixItNow Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin user ready: ${admin.email}`);

  const categories = [
    { name: 'Plumbing', description: 'Pipe repairs, leaks, installations' },
    { name: 'Electrical', description: 'Wiring, fixtures, electrical repairs' },
    { name: 'Cleaning', description: 'Home and office cleaning services' },
    { name: 'Painting', description: 'Interior and exterior painting' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log(`✅ Seeded ${categories.length} service categories`);
  console.log('----------------------------------------');
  console.log('Admin login credentials:');
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log('----------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
