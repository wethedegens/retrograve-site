// app/api/campaign/leaderboard/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dynamic = "force-dynamic";

/** Open (or create) the isolated campaign DB */
async function openDb() {
  const dbPath = path.resolve(process.cwd(), "campaign.db");
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "");
  return open({ filename: dbPath, driver: sqlite3.Database });
}

/**
 * GET /api/campaign/leaderboard?limit=10&offset=0
 * - Paginates results for smoother UI (Top 10 / 100 / 200 + Load more).
 * - Returns { lastUpdate, total, rows }
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = Number(url.searchParams.get("limit") ?? 10);
    const offsetParam = Number(url.searchParams.get("offset") ?? 0);

    // Cap to keep things snappy & safe
    const limit = Math.min(Math.max(limitParam, 1), 500);
    const offset = Math.max(offsetParam, 0);

    const db = await openDb();

    // last update time for the UI
    const meta = await db.get<{ v?: string }>(
      `SELECT v FROM meta WHERE k='last_update' LIMIT 1`
    );
    const lastUpdate = meta?.v ? Number(meta.v) : 0;

    // total count (for "Load more" logic)
    const totalRow = await db.get<{ n: number }>(
      `SELECT COUNT(*) as n FROM leaderboard`
    );
    const total = totalRow?.n ?? 0;

    // Prefer points if present; otherwise fallback to tweets as points.
    const rows = await db.all<{ user: string; tweets: number; points?: number }[]>(
      `
      SELECT user, tweets, COALESCE(points, tweets * 1.0) as points
      FROM leaderboard
      ORDER BY points DESC, tweets DESC, user ASC
      LIMIT ? OFFSET ?
      `,
      limit,
      offset
    );

    await db.close();
    return NextResponse.json({ lastUpdate, total, rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
