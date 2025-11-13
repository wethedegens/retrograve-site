import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function isDev() {
  return process.env.NODE_ENV !== "production";
}
async function openDb() {
  const dbPath = path.resolve(process.cwd(), "campaign.db");
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "");
  return open({ filename: dbPath, driver: sqlite3.Database });
}

/**
 * DEV ONLY: /api/campaign/dev-add?user=YourHandle&points=2&tweets=1
 * Guarded to non-production so it can't run on your live site.
 */
export async function GET(req: Request) {
  if (!isDev()) {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const user = (searchParams.get("user") || "").trim();
  const tweets = Number(searchParams.get("tweets") || "0");
  const points = Number(searchParams.get("points") || "0");
  if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 });

  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      user   TEXT PRIMARY KEY,
      tweets INTEGER DEFAULT 0,
      points REAL    DEFAULT 0
    );
  `);
  await db.exec(`CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);`);

  await db.run(
    `INSERT INTO leaderboard (user, tweets, points)
     VALUES (?, ?, ?)
     ON CONFLICT(user) DO UPDATE SET
       tweets = tweets + excluded.tweets,
       points = points + excluded.points`,
    [user, tweets, points]
  );

  await db.run(
    `INSERT INTO meta (k, v) VALUES ('last_update', ?)
     ON CONFLICT(k) DO UPDATE SET v = excluded.v`,
    [String(Date.now())]
  );

  const row = await db.get(`SELECT user, tweets, points FROM leaderboard WHERE user = ?`, [user]);
  await db.close();

  return NextResponse.json({ ok: true, row });
}
