import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const bearer = process.env.X_BEARER_TOKEN!;
  const hashtags = (process.env.PROMO_HASHTAGS ?? "#RetroGrave")
    .split(/\s+/).filter(Boolean)
    .map(h => (h.startsWith("#") ? h : `#${h}`))
    .join(" OR ");
  const mention = (process.env.PROMO_MENTION ?? "").trim();

  const base = mention ? `((${hashtags}) OR ${mention})` : `(${hashtags})`;
  const query =
    `(${base} -is:reply -is:quote -is:retweet)` +
    ` OR (${base} is:reply)` +
    ` OR (${base} is:quote)` +
    ` OR (${base} is:retweet)`;

  const url =
    "https://api.x.com/2/tweets/search/recent" +
    `?query=${encodeURIComponent(query)}` +
    "&max_results=10" +
    "&tweet.fields=created_at,referenced_tweets,author_id" +
    "&expansions=author_id" +
    "&user.fields=username";

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
    const ok = res.ok;
    const ct = res.headers.get("content-type") || "";
    let body: any = ok && ct.includes("application/json") ? await res.json() : null;

    const users: Record<string,string> = {};
    for (const u of body?.includes?.users ?? []) users[u.id] = u.username;

    const out = (body?.data ?? []).map((t: any) => ({
      id: t.id,
      user: users[t.author_id] || t.author_id,
      kind:
        t?.referenced_tweets?.[0]?.type === "retweeted" ? "RETWEET" :
        t?.referenced_tweets?.[0]?.type === "quoted"    ? "QUOTE"   :
        t?.referenced_tweets?.[0]?.type === "replied_to"? "REPLY"   : "ORIGINAL",
      text: t.text,
      created_at: t.created_at,
    }));

    return NextResponse.json({ ok, query, count: out.length, tweets: out });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
