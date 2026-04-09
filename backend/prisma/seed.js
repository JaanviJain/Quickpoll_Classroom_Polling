const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = "AdminPassword123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@quickpoll.com" },
    update: {},
    create: {
      email: "admin@quickpoll.com",
      name: "System Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Seed data created successfully:");
  console.log(`Admin User: ${admin.email}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
