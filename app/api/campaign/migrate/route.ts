import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function openDb() {
  const dbPath = path.resolve(process.cwd(), "campaign.db");
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "");
  return open({ filename: dbPath, driver: sqlite3.Database });
}

export async function GET() {
  try {
    const db = await openDb();

    // base tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        user TEXT PRIMARY KEY,
        tweets INTEGER DEFAULT 0,
        points REAL DEFAULT 0,
        rt_today INTEGER DEFAULT 0,
        orig_today INTEGER DEFAULT 0,
        quote_today INTEGER DEFAULT 0,
        reply_today INTEGER DEFAULT 0,
        last_ts INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS seen (
        id TEXT PRIMARY KEY
      );
      CREATE TABLE IF NOT EXISTS meta (
        k TEXT PRIMARY KEY,
        v TEXT
      );
    `);

    // safe "add column if missing" helpers
    const pragma = await db.all<{name:string}>(`PRAGMA table_info(leaderboard)`);
    const col = (n:string)=> pragma.some(p=>p.name===n);
    const add = async (n:string,def:string)=> { await db.exec(`ALTER TABLE leaderboard ADD COLUMN ${n} ${def};`); };

    if (!col("points")) await add("points", "REAL DEFAULT 0");
    if (!col("rt_today")) await add("rt_today", "INTEGER DEFAULT 0");
    if (!col("orig_today")) await add("orig_today", "INTEGER DEFAULT 0");
    if (!col("quote_today")) await add("quote_today", "INTEGER DEFAULT 0");
    if (!col("reply_today")) await add("reply_today", "INTEGER DEFAULT 0");
    if (!col("last_ts")) await add("last_ts", "INTEGER DEFAULT 0");

    await db.close();
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
