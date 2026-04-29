const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const result = await prisma.$runCommandRaw({
      insert: "User",
      documents: [{
        name: "test",
        email: "testraw@example.com",
        password: "123"
      }]
    });
    console.log("Success:", result);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
