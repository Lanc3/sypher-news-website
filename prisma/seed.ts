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

  const sypherDesk = await prisma.author.upsert({
    where: { slug: "sypher-desk" },
    create: {
      slug: "sypher-desk",
      name: "Sypher Desk",
      title: "Editorial Desk",
      bio: "The default Sypher News byline for newsroom analysis, curation, and desk-led coverage.",
    },
    update: {},
  });

  for (const slot of [AdSlot.header, AdSlot.sidebar, AdSlot.in_article]) {
    await prisma.adPlacement.upsert({
      where: { slot },
      create: { slot, enabled: false, providerKey: "google-adsense", format: "auto" },
      update: { providerKey: "google-adsense", format: "auto" },
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
    const article = await prisma.article.create({
      data: {
        topicId: topic.id,
        slug: demoSlug,
        status: "PUBLISHED",
        publishedAt: new Date(),
        featured: true,
        title: "Welcome to Sypher News (demo)",
        bodyMarkdown:
          "## Transmission\n\nThis **demo article** ships with the database seed. Replace it via admin or the ingest API.",
        summary: "Demo article for local development.",
        researchMarkdown: "### DISASSEMBLY\n\n```\n> narrative: default headline stack\n> counter: transparent sourcing + alignment telemetry\n```",
        articleAlignmentLabel: "balanced",
        articleAlignmentConfidence: 0.72,
        articleAlignmentRationale: "Synthetic alignment for UI testing.",
        sourceBalanceSummary: "This seeded article is balanced across one synthetic demo source and one internal desk summary.",
        seoMetaTitle: "Sypher News — Demo",
        seoMetaDescription: "Cyberpunk news stack demo article.",
      },
    });
    await prisma.articleAuthor.create({
      data: {
        articleId: article.id,
        authorId: sypherDesk.id,
        position: 0,
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
