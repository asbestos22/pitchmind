import { getDb } from "../api/queries/connection";
import { matches } from "./schema";

async function seed() {
  const db = getDb();

  const existing = await db.select().from(matches);
  if (existing.length > 0) {
    console.log("Matches already seeded, skipping.");
    process.exit(0);
  }

  const worldCupMatches = [
    {
      teamA: "Brazil", teamB: "Argentina", teamAFlag: "BR", teamBFlag: "AR",
      matchDate: new Date("2026-06-15T18:00:00Z"), stage: "Group A", status: "upcoming" as const,
    },
    {
      teamA: "Germany", teamB: "France", teamAFlag: "DE", teamBFlag: "FR",
      matchDate: new Date("2026-06-15T21:00:00Z"), stage: "Group B", status: "upcoming" as const,
    },
    {
      teamA: "Spain", teamB: "Portugal", teamAFlag: "ES", teamBFlag: "PT",
      matchDate: new Date("2026-06-16T18:00:00Z"), stage: "Group C", status: "upcoming" as const,
    },
    {
      teamA: "England", teamB: "Italy", teamAFlag: "GB", teamBFlag: "IT",
      matchDate: new Date("2026-06-16T21:00:00Z"), stage: "Group D", status: "upcoming" as const,
    },
    {
      teamA: "Netherlands", teamB: "Belgium", teamAFlag: "NL", teamBFlag: "BE",
      matchDate: new Date("2026-06-17T18:00:00Z"), stage: "Group E", status: "upcoming" as const,
    },
    {
      teamA: "Uruguay", teamB: "Colombia", teamAFlag: "UY", teamBFlag: "CO",
      matchDate: new Date("2026-06-17T21:00:00Z"), stage: "Group F", status: "upcoming" as const,
    },
    {
      teamA: "Croatia", teamB: "Denmark", teamAFlag: "HR", teamBFlag: "DK",
      matchDate: new Date("2026-06-18T18:00:00Z"), stage: "Group G", status: "upcoming" as const,
    },
    {
      teamA: "Mexico", teamB: "USA", teamAFlag: "MX", teamBFlag: "US",
      matchDate: new Date("2026-06-18T21:00:00Z"), stage: "Group H", status: "upcoming" as const,
    },
    {
      teamA: "Japan", teamB: "South Korea", teamAFlag: "JP", teamBFlag: "KR",
      matchDate: new Date("2026-06-19T18:00:00Z"), stage: "Group A", status: "upcoming" as const,
    },
    {
      teamA: "Morocco", teamB: "Senegal", teamAFlag: "MA", teamBFlag: "SN",
      matchDate: new Date("2026-06-19T21:00:00Z"), stage: "Group B", status: "upcoming" as const,
    },
    {
      teamA: "Switzerland", teamB: "Austria", teamAFlag: "CH", teamBFlag: "AT",
      matchDate: new Date("2026-06-20T18:00:00Z"), stage: "Round of 16", status: "upcoming" as const,
    },
    {
      teamA: "Poland", teamB: "Wales", teamAFlag: "PL", teamBFlag: "GB-WLS",
      matchDate: new Date("2026-06-20T21:00:00Z"), stage: "Round of 16", status: "upcoming" as const,
    },
  ];

  for (const match of worldCupMatches) {
    await db.insert(matches).values(match);
  }

  console.log(`Seeded ${worldCupMatches.length} World Cup matches.`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
