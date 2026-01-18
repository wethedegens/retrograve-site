"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_INSCRIPTION =
  "f362c61d2d77abea3fff98f86ef2c45f13710692d38f13740f74d2f7ca6063b2i0";

export default function DogeMinersPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const trimmed = useMemo(() => value.trim(), [value]);

  function go() {
    const id = trimmed;
    if (!id) return;
    router.push(`/doge-miners-nfts?inscription=${encodeURIComponent(id)}`);
  }

  function pasteExample() {
    setValue(EXAMPLE_INSCRIPTION);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "0 0 80px",
        backgroundColor: "#05020A",
        backgroundImage: 'url("/doge-miners-bg.png")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 18px 0" }}>
        <header style={{ color: "white" }}>
          <h1 style={{ fontSize: 40, margin: "0 0 14px", letterSpacing: "0.02em" }}>
            DOGE MINERS
          </h1>

          <h2 style={{ margin: "0 0 12px", fontSize: 18, opacity: 0.92 }}>
            INSCRIPTION LOADER
          </h2>

          <p style={{ margin: "0 0 18px", opacity: 0.9, maxWidth: 720 }}>
            Paste a Doge inscription ID and we&apos;ll load the image from Doggy Market,
            then send it into your Locker flow.
            <br />
            <span style={{ opacity: 0.8 }}>
              (No wallet connect needed for this mode.)
            </span>
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 520px) 1fr",
            gap: 22,
            alignItems: "start",
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(10, 8, 20, 0.55)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              color: "white",
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Paste Inscription ID..."
                style={{
                  flex: "1 1 320px",
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(0,0,0,0.25)",
                  color: "white",
                  outline: "none",
                }}
              />

              <button
                onClick={go}
                disabled={!trimmed}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: trimmed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                  color: trimmed ? "white" : "rgba(255,255,255,0.55)",
                  cursor: trimmed ? "pointer" : "not-allowed",
                  fontWeight: 700,
                }}
              >
                Load Inscription →
              </button>

              <button
                onClick={pasteExample}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(0,0,0,0.25)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Paste Example
              </button>
            </div>

            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
              Tip: In Doggy Market, open an item → NFT Details → copy “Inscription ID”. Paste it here.
            </p>
          </div>

          <div
            style={{
              minHeight: 260,
              borderRadius: 26,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.22)",
              boxShadow: "0 18px 44px rgba(0,0,0,0.25)",
              display: "grid",
              placeItems: "center",
              color: "rgba(255,255,255,0.75)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ textAlign: "center", padding: 18, maxWidth: 520 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
                LOCKSCREENED
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>
                Doge Miners
              </div>
              <div style={{ fontSize: 12, marginTop: 8, opacity: 0.85 }}>
                Paste inscription → preview → open in locker
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
