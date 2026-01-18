// app/doge-miners-nfts/page.tsx
"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DOGGY_CONTENT = (id: string) => `https://cdn.doggy.market/content/${id}`;

function shortId(id: string) {
  if (!id) return "";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export default function DogeMinersNftPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const inscription = useMemo(() => {
    const v =
      sp?.get("inscription") ||
      sp?.get("id") ||
      sp?.get("inscriptionId") ||
      "";
    return (v || "").trim();
  }, [sp]);

  const imageUrl = useMemo(() => {
    if (!inscription) return "";
    return DOGGY_CONTENT(inscription);
  }, [inscription]);

  const displayName = useMemo(() => {
    if (!inscription) return "DOGE MINERS";
    return `DOGE MINERS ${shortId(inscription)}`;
  }, [inscription]);

  const handleUseInLocker = () => {
    if (!inscription || !imageUrl) return;

    // ✅ Send into your existing locker flow
    const qs = new URLSearchParams();
    qs.set("project", "dogeminers");
    qs.set("name", displayName);
    qs.set("image", imageUrl);
    // optional: keep the id too
    qs.set("id", inscription);

    router.push(`/locker?${qs.toString()}`);
  };

  return (
    <main style={styles.page}>
      <div style={styles.inner}>
        <p style={styles.backRow}>
          <a href="/doge-miners" style={styles.backLink}>
            ← BACK TO DOGE MINERS
          </a>
        </p>

        <h1 style={styles.h1}>DOGE MINERS</h1>

        {!inscription ? (
          <div style={styles.notice}>No inscription found in URL.</div>
        ) : (
          <>
            <div style={styles.titleRow}>
              <div style={styles.title}>{displayName}</div>
            </div>

            <div style={styles.card}>
              <div style={styles.phoneWrap}>
                <div style={styles.phone}>
                  {/* image */}
                  <img
                    src={imageUrl}
                    alt={displayName}
                    style={styles.img}
                    onError={(e) => {
                      // fallback message if doggy content fails
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const el = document.getElementById("doge-img-err");
                      if (el) el.style.display = "block";
                    }}
                  />
                  <div id="doge-img-err" style={styles.imgErr}>
                    Could not load image from Doggy CDN.
                    <div style={{ marginTop: 6, opacity: 0.85 }}>
                      Check inscription ID is correct.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseInLocker}
                  disabled={!inscription}
                  style={{
                    ...styles.useBtn,
                    ...(inscription ? styles.useBtnOn : styles.useBtnOff),
                  }}
                >
                  Use this in Locker →
                </button>
              </div>

              <div style={styles.meta}>
                <div style={styles.metaLabel}>Inscription</div>
                <div style={styles.mono}>{inscription}</div>
                <div style={{ height: 10 }} />
                <div style={styles.metaLabel}>Image URL</div>
                <div style={styles.mono}>{imageUrl}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, any> = {
  // ✅ “bg-5” vibe (solid, no gradients)
  page: {
    minHeight: "100vh",
    padding: "18px 16px 60px",
    background: "#2f2a45",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  backRow: { margin: "6px 0 10px" },
  backLink: {
    color: "rgba(255,255,255,0.75)",
    textDecoration: "underline",
    textUnderlineOffset: 4,
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: 800,
  },
  h1: {
    margin: "10px 0 14px",
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: "0.02em",
    color: "white",
    textTransform: "uppercase",
  },
  notice: {
    padding: "14px 14px",
    borderRadius: 14,
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.9)",
  },
  titleRow: {
    display: "flex",
    justifyContent: "center",
    margin: "6px 0 12px",
  },
  title: {
    color: "rgba(255,255,255,0.95)",
    fontWeight: 900,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontSize: 13,
  },
  card: {
    borderRadius: 22,
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: 16,
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: 18,
    alignItems: "start",
  },
  phoneWrap: {
    display: "grid",
    gap: 12,
    justifyItems: "center",
  },
  phone: {
    width: 340,
    height: 620,
    borderRadius: 28,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imgErr: {
    display: "none",
    padding: 16,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  useBtn: {
    width: 340,
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 900,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontSize: 11,
  },
  useBtnOn: {
    background: "rgba(140, 90, 255, 0.30)",
    color: "white",
    cursor: "pointer",
  },
  useBtnOff: {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.55)",
    cursor: "not-allowed",
  },
  meta: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  metaLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  mono: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    lineHeight: 1.35,
    wordBreak: "break-all",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};
