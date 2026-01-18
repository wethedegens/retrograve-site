// app/doge-miners/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_INSCRIPTION =
  "f362c61d2d77abea3fff98f86ef2c45f13710692d38f13740f74d2f7ca6063b2i0";

function shortId(id: string) {
  if (!id) return "";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export default function DogeMinersInscriptionLoaderPage() {
  const router = useRouter();
  const [inscription, setInscription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const clean = useMemo(() => (inscription || "").trim(), [inscription]);

  const canLoad = clean.length > 10 && status !== "loading";

  const handlePasteExample = () => {
    setInscription(EXAMPLE_INSCRIPTION);
    setStatus("idle");
    setErr(null);
  };

  const handleLoad = async () => {
    const id = (clean || "").trim();
    if (!id) return;

    // We don’t actually need to fetch here — the /doge-miners-nfts page
    // will handle validation + preview. This keeps it fast + avoids CORS surprises.
    setStatus("loading");
    setErr(null);

    try {
      // ✅ Correct route (NOT /project-nft)
      router.push(`/doge-miners-nfts?inscription=${encodeURIComponent(id)}`);
      setStatus("ready");
    } catch (e: any) {
      setStatus("error");
      setErr(e?.message || "Failed to open Doge Miners preview page.");
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden="true" />
      <div style={styles.overlay} aria-hidden="true" />

      <section style={styles.wrap}>
        <h1 style={styles.h1}>DOGE MINERS</h1>
        <h2 style={styles.h2}>INSCRIPTION LOADER</h2>

        <p style={styles.p}>
          Paste a Doge inscription ID and we’ll load the image from Doggy Market, then send it into your Locker flow.
          <br />
          <span style={{ opacity: 0.8 }}>(No wallet connect needed for this mode.)</span>
        </p>

        <div style={styles.row}>
          <input
            value={inscription}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="Paste Inscription ID..."
            style={styles.input}
          />

          <button
            type="button"
            onClick={handleLoad}
            disabled={!canLoad}
            style={{
              ...styles.btn,
              ...(canLoad ? styles.btnOn : styles.btnOff),
            }}
          >
            {status === "loading" ? "Loading..." : "Load Inscription →"}
          </button>

          <button type="button" onClick={handlePasteExample} style={styles.btnGhost}>
            Paste Example
          </button>
        </div>

        <div style={styles.tip}>
          Tip: In Doggy Market, open an item → NFT Details → copy “Inscription ID”. Paste it here.
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Example: <span style={styles.mono}>{shortId(EXAMPLE_INSCRIPTION)}</span>
          </div>
        </div>

        {err ? <div style={styles.err}>{err}</div> : null}

        {/* small “phone” placeholder area just like your other pages */}
        <div style={styles.previewCard}>
          <div style={styles.previewPhone}>
            <div style={styles.previewTextTop}>LOCKSCREENED</div>
            <div style={styles.previewTextMid}>Doge Miners</div>
            <div style={styles.previewTextBot}>Paste inscription → preview → open in locker</div>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, any> = {
  page: {
    minHeight: "calc(100vh - 0px)",
    position: "relative",
    padding: "26px 18px 60px",
    overflow: "hidden",
  },
  // ✅ Use your new project bg image in /public/doge-miners-bg.png
  bg: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url("/doge-miners-bg.png")`,
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    transform: "scale(1.02)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)",
  },
  wrap: {
    position: "relative",
    maxWidth: 1100,
    margin: "0 auto",
  },
  h1: {
    fontSize: 38,
    letterSpacing: "0.02em",
    margin: 0,
    color: "white",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  h2: {
    fontSize: 18,
    letterSpacing: "0.18em",
    margin: "10px 0 12px",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    textTransform: "uppercase",
  },
  p: {
    margin: "0 0 16px",
    color: "rgba(255,255,255,0.90)",
    maxWidth: 780,
    lineHeight: 1.35,
    fontSize: 14,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  input: {
    width: "min(520px, 92vw)",
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10, 8, 20, 0.55)",
    color: "white",
    padding: "0 12px",
    outline: "none",
    fontSize: 13,
  },
  btn: {
    height: 40,
    borderRadius: 12,
    padding: "0 14px",
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontSize: 11,
  },
  btnOn: {
    background: "rgba(140, 90, 255, 0.30)",
    color: "white",
    cursor: "pointer",
  },
  btnOff: {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.55)",
    cursor: "not-allowed",
  },
  btnGhost: {
    height: 40,
    borderRadius: 12,
    padding: "0 14px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontSize: 11,
  },
  tip: {
    marginTop: 8,
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
  },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  err: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255, 60, 120, 0.14)",
    border: "1px solid rgba(255, 60, 120, 0.25)",
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    maxWidth: 780,
  },
  previewCard: {
    marginTop: 18,
    width: "min(360px, 92vw)",
    borderRadius: 18,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: 12,
  },
  previewPhone: {
    height: 260,
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  previewTextTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 18,
    textAlign: "center",
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    letterSpacing: "0.18em",
    fontWeight: 800,
    textTransform: "uppercase",
  },
  previewTextMid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 40,
    textAlign: "center",
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    fontWeight: 800,
  },
  previewTextBot: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    textAlign: "center",
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
  },
};
