// app/api/campaign/refresh/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dynamic = "force-dynamic";

/* ---------- DB helpers ---------- */
async function openDb() {
  const dbPath = path.resolve(process.cwd(), "campaign.db");
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "");
  return open({ filename: dbPath, driver: sqlite3.Database });
}

/** create/repair schema every call so we never 500 on missing columns */
async function ensureSchema(db: any) {
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
    CREATE TABLE IF NOT EXISTS seen ( id TEXT PRIMARY KEY );
    CREATE TABLE IF NOT EXISTS meta ( k TEXT PRIMARY KEY, v TEXT );
  `);

  const cols = await db.all<{ name: string }>(`PRAGMA table_info(leaderboard)`);
  const has = (n: string) => cols.some(c => c.name === n);
  const add = async (n: string, def: string) =>
    db.exec(`ALTER TABLE leaderboard ADD COLUMN ${n} ${def};`);

  if (!has("points")) await add("points", "REAL DEFAULT 0");
  if (!has("rt_today")) await add("rt_today", "INTEGER DEFAULT 0");
  if (!has("orig_today")) await add("orig_today", "INTEGER DEFAULT 0");
  if (!has("quote_today")) await add("quote_today", "INTEGER DEFAULT 0");
  if (!has("reply_today")) await add("reply_today", "INTEGER DEFAULT 0");
  if (!has("last_ts")) await add("last_ts", "INTEGER DEFAULT 0");
}

/* ---------- X API ---------- */
function buildQuery() {
  const hashtags = (process.env.PROMO_HASHTAGS ?? "#RetroGrave #RetroGraveLaunch")
    .split(/\s+/).filter(Boolean).map(h => (h.startsWith("#") ? h : `#${h}`))
    .join(" OR ");
  const mention = (process.env.PROMO_MENTION ?? "").trim();

  const base = `(${hashtags})${mention ? ` ${mention}` : ""}`;
  // include Originals / Replies / Quotes / Retweets as separate unions
  return `(${base} -is:reply -is:quote -is:retweet) OR (${base} is:reply) OR (${base} is:quote) OR (${base} is:retweet)`;
}

async function fetchTweets() {
  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) return { error: "Missing X_BEARER_TOKEN" };

  const url =
    "https://api.x.com/2/tweets/search/recent" +
    `?query=${encodeURIComponent(buildQuery())}` +
    "&max_results=25" +
    "&tweet.fields=created_at,public_metrics,author_id,referenced_tweets" +
    "&expansions=author_id" +
    "&user.fields=username";

  const r = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (r.status === 429) return { error: "rate_limited", status: 429 };
  if (!r.ok) return { error: `HTTP ${r.status}` };

  let data: any;
  try { data = await r.json(); } catch { return { error: "Invalid JSON from X" }; }

  const users: Record<string, string> = {};
  for (const u of data.includes?.users ?? []) users[u.id] = u.username;

  const tweets = (data.data ?? []).map((t: any) => {
    const ref = t?.referenced_tweets?.[0]?.type;
    const kind =
      ref === "retweeted" ? "RETWEET" :
      ref === "quoted"    ? "QUOTE" :
      ref === "replied_to"? "REPLY"  : "ORIGINAL";
    return { id: t.id, user: users[t.author_id] || "unknown", kind };
  });

  return { tweets };
}

/* ---------- Points + caps ---------- */
const W_ORIG = 2.0, W_QUOTE = 1.5, W_REPLY = 1.0, W_RT = 0.5;
const CAP_TOTAL = Number(process.env.PROMO_DAILY_TOTAL_CAP ?? 2);
const CAP_RT    = Number(process.env.PROMO_DAILY_RETWEET_CAP ?? 3);

function todayStartTs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/* ---------- Route ---------- */
export async function GET() {
  try {
    const db = await openDb();
    await ensureSchema(db);

    // cooldown window to shield free plan
    const COOLDOWN = 60; // seconds
    const last = await db.get<{ v: string }>(`SELECT v FROM meta WHERE k='cooldown_until'`);
    const until = Number(last?.v || 0);
    const now = Date.now();
    if (until && now < until) {
      await db.close();
      const retry_after = Math.ceil((until - now) / 1000);
      return NextResponse.json({ error: "cooldown", retry_after }, { status: 429 });
    }

    const res = await fetchTweets();
    if ("error" in res) {
      // set short cooldown on failure/rate-limit
      await db.run(
        `INSERT INTO meta (k, v) VALUES ('cooldown_until', ?)
         ON CONFLICT(k) DO UPDATE SET v = excluded.v`,
        [String(Date.now() + COOLDOWN * 1000)]
      );
      await db.close();
      const status = (res as any).status === 429 ? 429 : 200;
      return NextResponse.json({ error: (res as any).error }, { status });
    }

    const tweets = (res as any).tweets as Array<{ id: string; user: string; kind: string }>;
    let added = 0;
    const start = todayStartTs();

    await db.exec("BEGIN");
    // reset daily counters per user if last activity was before today
    await db.run(
      `UPDATE leaderboard SET rt_today=0, orig_today=0, quote_today=0, reply_today=0
       WHERE last_ts < ?`,
      [start]
    );

    for (const t of tweets) {
      // skip duplicates
      const seen = await db.get(`SELECT 1 as x FROM seen WHERE id = ?`, [t.id]);
      if (seen?.x) continue;

      // current user row
      let row = await db.get<any>(`SELECT * FROM leaderboard WHERE user = ?`, [t.user]);
      if (!row) {
        await db.run(
          `INSERT INTO leaderboard(user,tweets,points,rt_today,orig_today,quote_today,reply_today,last_ts)
           VALUES(?,0,0,0,0,0,0,0)`,
          [t.user]
        );
        row = await db.get<any>(`SELECT * FROM leaderboard WHERE user = ?`, [t.user]);
      }

      // enforce per-day caps
      const totalToday = row.orig_today + row.quote_today + row.reply_today + row.rt_today;
      if (totalToday >= CAP_TOTAL) { continue; }
      if (t.kind === "RETWEET" && row.rt_today >= CAP_RT) { continue; }

      // apply weights + counters
      let pts = 0;
      if (t.kind === "ORIGINAL") { pts = W_ORIG;  row.orig_today += 1; }
      else if (t.kind === "QUOTE") { pts = W_QUOTE; row.quote_today += 1; }
      else if (t.kind === "REPLY") { pts = W_REPLY; row.reply_today += 1; }
      else { pts = W_RT; row.rt_today += 1; }

      row.tweets += 1;
      row.points += pts;
      row.last_ts = Date.now();

      await db.run(
        `UPDATE leaderboard
         SET tweets=?, points=?, rt_today=?, orig_today=?, quote_today=?, reply_today=?, last_ts=?
         WHERE user=?`,
        [row.tweets, row.points, row.rt_today, row.orig_today, row.quote_today, row.reply_today, row.last_ts, t.user]
      );

      await db.run(`INSERT INTO seen(id) VALUES(?)`, [t.id]);
      added++;
    }
    await db.exec("COMMIT");

    // last_update for UI + short cooldown to avoid hammering
    await db.run(
      `INSERT INTO meta(k,v) VALUES('last_update',?)
       ON CONFLICT(k) DO UPDATE SET v=excluded.v`,
      [String(Date.now())]
    );
    await db.run(
      `INSERT INTO meta(k,v) VALUES('cooldown_until',?)
       ON CONFLICT(k) DO UPDATE SET v=excluded.v`,
      [String(Date.now() + COOLDOWN * 1000)]
    );

    await db.close();
    return NextResponse.json({ ok: true, added });
  } catch (err: any) {
    console.error("refresh error", err);
    // return JSON so the UI shows the message instead of blank 500
    return NextResponse.json({ error: err.message || "server_error" }, { status: 500 });
  }
}
