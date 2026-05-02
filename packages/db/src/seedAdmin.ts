import 'dotenv/config';
import argon2 from 'argon2';
import prisma from './index';

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrator';
  const force = process.env.SEED_ADMIN_FORCE === 'true';

  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables. Aborting.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Provided ADMIN_PASSWORD is too short (min 8 characters). Aborting.');
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing && existing.role === 'ADMIN' && !force) {
      console.log('Admin user already exists. Use SEED_ADMIN_FORCE=true to overwrite.');
      return;
    }

    const hashed = await argon2.hash(password);

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: {
          password: hashed,
          role: 'ADMIN',
          isActive: true,
          name,
        },
      });
      console.log('Existing user updated to ADMIN.');
    } else {
      await prisma.user.create({
        data: {
          email,
          password: hashed,
          name,
          role: 'ADMIN',
          isActive: true,
        },
      });
      console.log('Admin user created.');
    }
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
