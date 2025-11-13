// app/leaderboard/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ===== Types ===== */
type Row = {
  user: string;
  tweets: number;
  points?: number; // shown if present
};

type Api = {
  lastUpdate: number;
  total: number;
  rows: Row[];
  limit: number;
  offset: number;
};

type LeaderRes = {
  rows: Row[];
  lastUpdate: number;
  total: number;
};

const TAGS = ["#RetroGrave", "#RetroGraveLaunch"];
const LIMIT_OPTIONS = [10, 100, 200] as const;

/* ===== Small utils ===== */
function timeAgo(ts: number) {
  if (!ts) return "never";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function copy(text: string) {
  try {
    navigator.clipboard?.writeText(text);
  } catch {}
}

/* ===== Page ===== */
export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [last, setLast] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(LIMIT_OPTIONS[0]);
  const [offset, setOffset] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const cooldownUntil = useRef<number>(0);
  const [cooldownText, setCooldownText] = useState<string>("");

  const pageTitle = "RETROGRAVE LEADERBOARD";

  const showingText = useMemo(() => {
    if (!total) return "";
    const end = Math.min(offset + limit, total);
    return `Showing ${offset + 1}-${end} of ${total}`;
  }, [offset, limit, total]);

  async function load(opts?: { limit?: number; offset?: number }) {
    setLoading(true);
    try {
      const url = new URL("/api/campaign/leaderboard", window.location.origin);
      url.searchParams.set("limit", String(opts?.limit ?? limit));
      url.searchParams.set("offset", String(opts?.offset ?? offset));
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data: Api = await res.json();
      setRows(data.rows || []);
      setLast(data.lastUpdate || 0);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }

  // Gentle UI cooldown message (after we refresh)
  useEffect(() => {
    const id = setInterval(() => {
      const leftMs = cooldownUntil.current - Date.now();
      if (leftMs > 0) {
        const s = Math.ceil(leftMs / 1000);
        setCooldownText(`Cooling down — next check in ${s}s`);
      } else {
        setCooldownText("");
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  async function refreshNow() {
    if (Date.now() < cooldownUntil.current) return;
    setUpdating(true);
    setMsg(null);
    try {
      const r = await fetch("/api/campaign/refresh", { cache: "no-store" });
      let j: any = {};
      const isJson = r.headers.get("content-type")?.includes("application/json");
      if (isJson) j = await r.json();

      if (!r.ok) {
        if (r.status === 429) {
          setMsg("X rate-limited us (429). Your posts will count once the limit cools down—try again later.");
        } else {
          setMsg(j?.error || `HTTP ${r.status}`);
        }
      } else {
        setMsg(j.added ? `Updated! Added ${j.added} post(s).` : "Up to date.");
        await load({ limit, offset });
      }
    } catch (e: any) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setUpdating(false);
      // 25s UI cooldown to discourage hammering
      cooldownUntil.current = Date.now() + 25_000;
      setTimeout(() => setMsg(null), 6000);
    }
  }

  function onPickLimit(next: number) {
    setLimit(next);
    setOffset(0);
    load({ limit: next, offset: 0 });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="lb-wrap">
      <h1 className="title">{pageTitle}</h1>

      <div className="controls">
        <div className="seg">
          {LIMIT_OPTIONS.map((n) => (
            <button
              key={n}
              className={`segbtn ${limit === n ? "on" : ""}`}
              onClick={() => onPickLimit(n)}
            >
              Top {n}
            </button>
          ))}
        </div>

        <div className="meta">
          <button onClick={refreshNow} disabled={updating || Boolean(cooldownText)}>
            {updating ? "Updating…" : "Update Leaderboard"}
          </button>
          <span className="small">
            {msg
              ? msg
              : cooldownText
              ? cooldownText
              : `Last updated: ${timeAgo(last)} · ${showingText || ""}`}
          </span>
        </div>
      </div>

      {/* How to earn points card */}
      <section className="howto">
        <h3>How to earn points</h3>
        <ul>
          <li>
            Make a <strong>post</strong>, <strong>quote</strong>, or <strong>reply</strong> that
            includes both:{" "}
            {TAGS.map((t, i) => (
              <code key={t}>
                {t}
                {i === 0 ? " " : ""}
              </code>
            ))}
            .
          </li>
          <li>
            Scoring: <strong>Originals: 2 pts</strong> · <strong>Quotes: 1.5 pt</strong> ·{" "}
            <strong>Replies: 1 pt</strong> · <strong>Retweets with text: 0.5 pt</strong>.
          </li>
          <li>
            Anti-spam caps (per user, per UTC day): <strong>max 2 posts</strong> +{" "}
            <strong>max 3 retweets</strong>.
          </li>
          <li>
            Tip: Add a short note and both hashtags to score immediately.
          </li>
        </ul>
        <div className="howto-actions">
          <button
            className="copy"
            onClick={() => copy(TAGS.join(" "))}
            aria-label="Copy hashtags"
            title="Copy hashtags"
          >
            Copy hashtags
          </button>
        </div>
      </section>

      {/* Leaderboard table */}
      {loading ? (
        <p className="hint">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="hint">No data yet — check back soon!</p>
      ) : (
        <table className="lb-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Tweets</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const rank = offset + i + 1;
              return (
                <tr key={row.user} className={rank === 1 ? "top" : ""}>
                  <td>{rank === 1 ? "👑 1" : rank}</td>
                  <td>{row.user}</td>
                  <td>{row.tweets}</td>
                  <td>{(row.points ?? Math.max(1, row.tweets)).toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Leaderboard FAQ — matches homepage style */}
      <section className="faq-wrap">
        <h3 className="faq-title">Leaderboard FAQ</h3>

        <FAQ
          title="What gets counted?"
          items={[
            "Any public post, quote, or reply on X that includes both #RetroGrave and #RetroGraveLaunch.",
            "Retweets only count if your retweet includes text (we award partial points for these).",
            "We ignore pure retweets without text to prevent low-effort spam.",
          ]}
        />
        <FAQ
          title="Daily caps & anti-spam"
          items={[
            "Per UTC day, each user can earn points on a maximum of 2 original posts/quotes/replies and 3 retweets-with-text.",
            "We cap daily scoring to reward quality and discourage flooding the feed.",
          ]}
        />
        <FAQ
          title="Scoring breakdown"
          items={[
            "Original post: 2.0 points",
            "Quote post: 1.5 points",
            "Reply: 1.0 point",
            "Retweet with text: 0.5 points",
          ]}
        />
        <FAQ
          title="Why do I sometimes see rate-limited?"
          items={[
            "We're using X’s free API tier, which rate-limits calls. If you hit '429', try again in a bit.",
            "Even if refresh is rate-limited, your posts will still be counted on the next successful refresh.",
          ]}
        />
        <FAQ
          title="Privacy & permissions"
          items={[
            "You don't have to connect anything to appear—if you post publicly with both hashtags, we can see it.",
            "We only store basic leaderboard stats (username, tweet count, points). No DMs, no sensitive data.",
          ]}
        />
        <FAQ
          title="How do I get on the board?"
          items={[
            "Post publicly on X using both #RetroGrave and #RetroGraveLaunch. That's it.",
            "Click 'Update Leaderboard' to refresh, or it will refresh periodically as traffic allows.",
          ]}
        />
        <FAQ
          title="Troubleshooting"
          items={[
            "Make sure your post is public and includes both hashtags.",
            "If you only retweet without adding text, it won’t count.",
            "Wait a moment after posting and then press 'Update Leaderboard'.",
          ]}
        />
        <FAQ
          title="Future perks"
          items={[
            "Top supporters pre-launch can earn OG/WL spots, exclusive raffles, and shout-outs.",
            "We’ll keep iterating—seasonal events, quests, and collabs are on the roadmap.",
          ]}
        />
      </section>

      <style jsx>{`
        /* ===== Layout & headings ===== */
        .lb-wrap {
          display: grid;
          gap: 18px;
          justify-items: center;
          padding: 28px 14px 80px;
          color: #fff;
          text-align: center;
        }
        .title {
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,
            Cantarell, "Helvetica Neue", Arial;
          font-weight: 800;
          font-size: clamp(28px, 4vw, 52px);
          letter-spacing: 0.5px;
          text-shadow:
            0 0 10px rgba(183, 122, 255, 0.75),
            0 0 22px rgba(183, 122, 255, 0.45);
          margin: 6px 0 8px;
        }

        /* ===== Controls row ===== */
        .controls {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 14px;
          align-items: center;
          width: min(100%, 980px);
        }
        .seg {
          display: inline-flex;
          gap: 8px;
        }
        .segbtn {
          padding: 7px 12px;
          border-radius: 12px;
          border: 0;
          background: rgba(183, 122, 255, 0.18);
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow: inset 0 0 0 1px rgba(183, 122, 255, 0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }
        .segbtn:hover { transform: translateY(-1px); }
        .segbtn.on {
          background: rgba(183, 122, 255, 0.32);
          box-shadow:
            inset 0 0 0 1px rgba(183, 122, 255, 0.5),
            0 8px 18px rgba(0,0,0,0.3);
        }

        .meta {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: flex-end;
        }
        .meta button {
          padding: 9px 14px;
          border-radius: 12px;
          border: 0;
          cursor: pointer;
          font-weight: 800;
          background: linear-gradient(180deg, #a983ff, #7a4bff);
          color: #fff;
          box-shadow: 0 10px 20px rgba(0,0,0,0.35);
        }
        .meta button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .small {
          color: #cdb8ff;
          font-size: 13px;
          white-space: nowrap;
        }

        /* ===== How-to card ===== */
        .howto {
          width: min(100%, 980px);
          text-align: left;
          padding: 16px 16px 12px;
          border-radius: 16px;
          background: rgba(183, 122, 255, 0.12);
          box-shadow: inset 0 0 0 1px rgba(183, 122, 255, 0.35);
        }
        .howto h3 {
          margin: 0 0 10px;
          font-size: 18px;
          color: #fff;
        }
        .howto ul {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
          color: #d6c8ff;
          font-size: 14px;
        }
        .howto code {
          background: rgba(183, 122, 255, 0.18);
          padding: 2px 6px;
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px rgba(183, 122, 255, 0.35);
          color: #fff;
          font-size: 13px;
        }
        .howto-actions {
          display: flex;
          justify-content: flex-start;
          margin-top: 12px;
        }
        .howto .copy {
          padding: 6px 10px;
          border: 0;
          border-radius: 10px;
          background: rgba(183, 122, 255, 0.25);
          color: #fff;
          cursor: pointer;
          font-weight: 700;
          box-shadow: inset 0 0 0 1px rgba(183,122,255,0.35);
        }
        .howto .copy:hover { transform: translateY(-1px); }

        /* ===== Table ===== */
        .lb-table {
          border-collapse: collapse;
          width: min(100%, 980px);
          margin-top: 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 12px 26px rgba(0,0,0,0.35);
        }
        thead th {
          padding: 12px 10px;
          color: #bda3ff;
          letter-spacing: 0.06em;
          text-align: left;
          border-bottom: 1px solid rgba(183, 122, 255, 0.35);
          background: rgba(183,122,255,0.08);
        }
        tbody td {
          padding: 12px 10px;
          border-bottom: 1px solid rgba(183, 122, 255, 0.25);
          font-family: "VT323", monospace;
          font-size: 18px;
          color: #fff;
        }
        tr.top {
          background: rgba(183, 122, 255, 0.08);
          box-shadow: inset 0 0 0 1px rgba(183, 122, 255, 0.25);
        }

        .hint { color: #cdb8ff; }

        /* ===== FAQ (matches homepage style) ===== */
        .faq-wrap {
          width: min(100%, 980px);
          display: grid;
          gap: 10px;
          margin-top: 18px;
          text-align: left;
        }
        .faq-title {
          margin: 4px 0 0;
          font-size: 20px;
          color: #fff;
          letter-spacing: 0.02em;
        }
        details {
          background: rgba(12, 8, 22, 0.8);
          border-radius: 16px;
          box-shadow:
            inset 0 0 0 1px rgba(183, 122, 255, 0.18),
            0 12px 28px rgba(0,0,0,0.4);
          overflow: hidden;
        }
        summary {
          list-style: none;
          padding: 16px;
          cursor: pointer;
          position: relative;
          color: #fff;
          font-weight: 700;
        }
        summary::-webkit-details-marker { display: none; }
        .chev {
          position: absolute;
          right: 16px;
          top: 16px;
          color: #cdb8ff;
          text-shadow: 0 0 10px rgba(183,122,255,.65);
        }
        .faq-body {
          padding: 2px 18px 16px;
          color: #d6c8ff;
          font-size: 15px;
        }
        .faq-body li { margin: 6px 0; }

        @media (max-width: 860px) {
          .controls {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .meta { justify-content: center; flex-wrap: wrap; }
        }
      `}</style>
    </main>
  );
}

/* ---------- Small FAQ helper ---------- */
function FAQ({ title, items }: { title: string; items: string[] }) {
  return (
    <details>
      <summary>
        {title}
        <span className="chev">▾</span>
      </summary>
      <div className="faq-body">
        <ul>
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
