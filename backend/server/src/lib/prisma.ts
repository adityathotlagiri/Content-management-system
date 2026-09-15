// server/src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma v7 requires an explicit driver adapter instead of a bare
// connection string — this adapter wraps the standard `pg` driver.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Single shared instance — prevents exhausting DB connections from
// creating a new PrismaClient on every import.
export const prisma = new PrismaClient({ adapter });