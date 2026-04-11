import { PrismaClient, AdSlot } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash(process.env.ADMIN_SEED_PASSWORD || "changeme", 12);
  await prisma.user.upsert({
    where: { email: "admin@sypher.news" },
    create: {
      email: "admin@sypher.news",
      passwordHash,
      role: "ADMIN",
    },
    update: { passwordHash, role: "ADMIN" },
  });

  for (const slot of [AdSlot.header, AdSlot.sidebar, AdSlot.in_article]) {
    await prisma.adPlacement.upsert({
      where: { slot },
      create: { slot, enabled: false },
      update: {},
    });
  }

  const demoSlug = "demo-transmission";
  const existingDemo = await prisma.article.findUnique({ where: { slug: demoSlug } });
  if (!existingDemo) {
    const cat = await prisma.category.upsert({
      where: { slug: "signals" },
      create: { slug: "signals", name: "Signals", description: "Seeded demo category" },
      update: {},
    });
    const topic = await prisma.topic.create({
      data: {
        categoryId: cat.id,
        title: "Demo transmission",
        slug: `ingest-${demoSlug}`.slice(0, 512),
        status: "drafted",
        roundNumber: 1,
      },
    });
    await prisma.article.create({
      data: {
        topicId: topic.id,
        slug: demoSlug,
        title: "Welcome to Sypher News (demo)",
        bodyMarkdown:
          "## Transmission\n\nThis **demo article** ships with the database seed. Replace it via admin or the ingest API.",
        summary: "Demo article for local development.",
        researchMarkdown: "### DISASSEMBLY\n\n```\n> narrative: default headline stack\n> counter: transparent sourcing + alignment telemetry\n```",
        articleAlignmentLabel: "balanced",
        articleAlignmentConfidence: 0.72,
        articleAlignmentRationale: "Synthetic alignment for UI testing.",
        seoMetaTitle: "Sypher News — Demo",
        seoMetaDescription: "Cyberpunk news stack demo article.",
      },
    });
  }

  console.log("Seed OK: admin@sypher.news /", process.env.ADMIN_SEED_PASSWORD || "changeme");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
