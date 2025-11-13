// app/components/DropCountdown.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diffParts(targetISO: string): Parts {
  const t = new Date(targetISO).getTime();
  const now = Date.now();
  let d = Math.max(0, Math.floor((t - now) / 1000));
  const days = Math.floor(d / 86400); d -= days * 86400;
  const hours = Math.floor(d / 3600); d -= hours * 3600;
  const minutes = Math.floor(d / 60); d -= minutes * 60;
  const seconds = d;
  return { days, hours, minutes, seconds };
}

export default function DropCountdown({
  target,
  title = "Launch",
  liveCtaText = "Live Now",
  liveCtaHref = "/",
  compact = false,
}: {
  target: string;
  title?: string;
  liveCtaText?: string;
  liveCtaHref?: string;
  compact?: boolean;
}) {
  const [parts, setParts] = useState<Parts>(() => diffParts(target));
  const done = useMemo(
    () => parts.days + parts.hours + parts.minutes + parts.seconds <= 0,
    [parts]
  );

  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (done) {
    return (
      <div className={compact ? "dc live compact" : "dc live"}>
        <a className="cta" href={liveCtaHref}>{liveCtaText}</a>
        <style jsx>{`
          .dc.live {
            display: grid;
            place-items: center;
            gap: 10px;
            background: rgba(30, 20, 50, 0.7);
            border: 1px solid rgba(183, 122, 255, 0.35);
            border-radius: 14px;
            padding: ${compact ? "6px 10px" : "12px 16px"};
            box-shadow: 0 0 22px rgba(183,122,255,0.25) inset;
          }
          .cta {
            font-family: "VT323", monospace;
            font-size: ${compact ? "13px" : "15px"};
            letter-spacing: .06em;
            text-decoration: none;
            color: #fff;
            background: linear-gradient(180deg, rgba(140,98,255,.55), rgba(104,64,210,.55));
            padding: ${compact ? "6px 10px" : "8px 12px"};
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(183,122,255,.35);
            transition: transform .16s ease, box-shadow .16s ease;
          }
          .cta:hover { transform: translateY(-1px); box-shadow: 0 0 14px rgba(183,122,255,.65); }
        `}</style>
      </div>
    );
  }

  return (
    <div className={compact ? "dc compact" : "dc"}>
      {!compact && <div className="t">{title}</div>}
      {compact && <div className="t tiny">{title}</div>}

      <div className={compact ? "grid tiny" : "grid"}>
        <Tile value={parts.days} label="DAYS" compact={compact} />
        <Tile value={parts.hours} label="HOURS" compact={compact} />
        <Tile value={parts.minutes} label="MINUTES" compact={compact} />
        <Tile value={parts.seconds} label="SECONDS" compact={compact} />
      </div>

      <style jsx>{`
        .dc {
          display: grid;
          gap: 10px;
          color: #fff;
          background: rgba(12, 8, 18, 0.6);
          border: 1px solid rgba(183,122,255,.18);
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 0 22px rgba(183,122,255,.18) inset;
        }
        .dc.compact {
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(12,8,18,0.58);
          width: max-content;             /* ⬅ grow to fit tiles, no overlap */
        }
        .t {
          text-align: center;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto, Ubuntu;
          letter-spacing: .06em;
          text-transform: uppercase;
          font-size: 16px;
          opacity: .9;
          text-shadow: 0 0 10px rgba(183,122,255,.4);
        }
        .t.tiny {
          font-size: 12px;
          text-align: left;
          opacity: .85;
          text-shadow: none;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .grid.tiny {
          display: grid;
          grid-auto-flow: column;                         /* ⬅ lay out in columns */
          grid-template-columns: repeat(4, minmax(72px, auto)); /* ⬅ fixed safe width */
          gap: 10px;                                      /* ⬅ extra separation */
        }
      `}</style>
    </div>
  );
}

function Tile({ value, label, compact }: { value: number; label: string; compact?: boolean }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className={compact ? "tile tiny" : "tile"}>
      <div className={compact ? "num tiny" : "num"}>{v}</div>
      <div className={compact ? "lab tiny" : "lab"}>{label}</div>

      <style jsx>{`
        .tile {
          display: grid;
          place-items: center;
          gap: 6px;
          background: rgba(30, 22, 48, 0.9);
          border: 1px solid rgba(183,122,255,.28);
          border-radius: 14px;
          padding: 16px 10px;
          box-shadow: 0 0 18px rgba(183,122,255,.12) inset;
        }
        .tile.tiny {
          gap: 4px;
          border-radius: 12px;
          padding: 10px 10px;
          min-width: 72px;                 /* ⬅ enough for “SECONDS” */
          background: rgba(30,22,48,.88);
        }
        .num {
          font-family: "VT323", monospace;
          font-size: 34px;
          line-height: 1;
          text-shadow: 0 0 12px rgba(183,122,255,.55);
        }
        .num.tiny {
          font-size: 20px;
          text-shadow: 0 0 9px rgba(183,122,255,.45);
        }
        .lab {
          font-size: 11px;
          letter-spacing: .12em;
          opacity: .85;
        }
        .lab.tiny {
          font-size: 10px;
          letter-spacing: .14em;
          opacity: .8;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
