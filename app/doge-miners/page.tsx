// app/doge-miners/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function normalizeInscriptionId(raw: string) {
  return raw.trim();
}

export default function DogeMinersLandingPage() {
  const router = useRouter();
  const [inscription, setInscription] = useState("");

  const cleaned = useMemo(
    () => normalizeInscriptionId(inscription),
    [inscription]
  );

  const canSearch = cleaned.length >= 20;

  function goSearch() {
    if (!canSearch) return;
    router.push(`/doge-miners-nfts?inscription=${encodeURIComponent(cleaned)}`);
  }

  return (
    <main className="lp-wrap">
      <section className="lp-inner">
        <div className="lp-left">
          <h1 className="lp-title">DOGE MINERS</h1>
          <h2 className="lp-subtitle">INSCRIPTION LOADER</h2>

          <p className="lp-copy">
            Paste a <span className="lp-copy-strong">Doge inscription ID</span>{" "}
            and we’ll load the image from Doggy Market, then send it into your
            Locker flow.
            <br />
            <span style={{ opacity: 0.85 }}>
              (No wallet connect needed for this mode.)
            </span>
          </p>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              value={inscription}
              onChange={(e) => setInscription(e.target.value)}
              placeholder="Paste Inscription ID…"
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              style={{
                width: "min(560px, 92vw)",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.35)",
                color: "white",
                outline: "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") goSearch();
              }}
            />

            <button
              onClick={goSearch}
              disabled={!canSearch}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: canSearch
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.06)",
                color: canSearch ? "white" : "rgba(255,255,255,0.55)",
                cursor: canSearch ? "pointer" : "not-allowed",
              }}
            >
              Load Inscription →
            </button>

            <button
              onClick={() =>
                setInscription(
                  "a03d4c509d286db0f570b717b6ab08e691188d3b1ae22d61628ac50a9064014li0"
                )
              }
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.25)",
                color: "rgba(255,255,255,0.9)",
                cursor: "pointer",
              }}
            >
              Paste Example
            </button>
          </div>

          <p style={{ marginTop: 14, opacity: 0.75, maxWidth: 720 }}>
            Tip: In Doggy Market, open an item → NFT Details → copy “Inscription
            ID”. Paste it here.
          </p>
        </div>

        <div className="lp-right">
          <div
            style={{
              width: 320,
              maxWidth: "92vw",
              height: 640,
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.14)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.25))",
              boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
              display: "grid",
              placeItems: "center",
              padding: 18,
              textAlign: "center",
            }}
          >
            <div style={{ opacity: 0.85 }}>
              <div style={{ fontSize: 14, letterSpacing: 2 }}>LOCKSCREENED</div>
              <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700 }}>
                Doge Miners
              </div>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                Paste inscription → preview → open in locker
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
