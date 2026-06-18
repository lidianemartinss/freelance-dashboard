import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Goal
  await prisma.goal.create({
    data: {
      name: "Master's in Italy",
      targetAmount: 18000,
      targetDate: new Date(new Date().getFullYear() + 1, 8, 1), // Sept next year
      currency: "EUR",
      notes: "Tuition + visa funds + first 3 months living costs",
    },
  });

  // Projects
  const brandProject = await prisma.project.create({
    data: {
      name: "Brand identity refresh",
      client: "Aurora Skincare",
      status: "ACTIVE",
      budget: 2400,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
      notes: "Logo, color system, packaging mockups. 50% upfront.",
    },
  });

  const webProject = await prisma.project.create({
    data: {
      name: "Portfolio site design",
      client: "Marcus Lindqvist (Photographer)",
      status: "ACTIVE",
      budget: 1100,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
      notes: "Figma file + dev handoff, 6 pages.",
    },
  });

  await prisma.project.create({
    data: {
      name: "Pitch deck design",
      client: "Northwind Ventures",
      status: "LEAD",
      budget: 600,
      notes: "Waiting on signed proposal.",
    },
  });

  // Payments
  await prisma.payment.createMany({
    data: [
      { projectId: brandProject.id, amount: 1200, status: "PAID", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), notes: "Deposit" },
      { projectId: webProject.id, amount: 550, status: "PAID", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), notes: "Deposit" },
      { projectId: webProject.id, amount: 550, status: "INVOICED", date: new Date(), notes: "Final invoice" },
      { projectId: null, amount: 300, status: "PAID", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35), notes: "Logo design, one-off" },
    ],
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      { projectId: brandProject.id, title: "Send packaging mockups for review", priority: "HIGH", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) },
      { projectId: webProject.id, title: "Export dev-ready assets", priority: "HIGH", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4) },
      { projectId: null, title: "Update portfolio with latest projects", priority: "MEDIUM" },
      { projectId: null, title: "Research Italian student visa requirements", priority: "MEDIUM", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) },
      { projectId: null, title: "Send invoice reminder to Marcus", priority: "LOW" },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
