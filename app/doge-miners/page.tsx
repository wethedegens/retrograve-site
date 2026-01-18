// app/doge-miners/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const PASTE_EXAMPLE =
  "f362c61d2d77abea3fff98f86ef2c45f13710692d38f13740f74d2f7ca6063b2i0";

function cleanInscription(raw: string) {
  return (raw || "").trim();
}

export default function DogeMinersPage() {
  const router = useRouter();
  const [inscription, setInscription] = useState("");

  const canLoad = useMemo(() => cleanInscription(inscription).length > 0, [inscription]);

  const goToPreviewPage = (id: string) => {
    const cleaned = cleanInscription(id);
    if (!cleaned) return;

    const qs = new URLSearchParams();
    qs.set("inscription", cleaned);

    // ✅ This is the "page like before"
    router.push(`/doge-miners-nfts?${qs.toString()}`);
  };

  return (
    <main style={styles.page}>
      <div style={styles.overlay} />

      <section style={styles.inner}>
        <h1 style={styles.h1}>DOGE MINERS</h1>
        <h2 style={styles.h2}>INSCRIPTION LOADER</h2>

        <p style={styles.p}>
          Paste a Doge inscription ID and we’ll load the image from Doggy Market,
          then send it into your Locker flow.
          <br />
          <span style={{ opacity: 0.8 }}>(No wallet connect needed for this mode.)</span>
        </p>

        <div style={styles.row}>
          <input
            value={inscription}
            onChange={(e) => setInscription(e.target.value)}
            placeholder="Paste Inscription ID..."
            style={styles.input}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />

          <button
            type="button"
            onClick={() => goToPreviewPage(inscription)}
            disabled={!canLoad}
            style={{
              ...styles.btn,
              ...(canLoad ? styles.btnOn : styles.btnOff),
            }}
          >
            Load Inscription →
          </button>

          <button
            type="button"
            onClick={() => {
              setInscription(PASTE_EXAMPLE);
              goToPreviewPage(PASTE_EXAMPLE);
            }}
            style={{ ...styles.btn, ...styles.btnGhost }}
          >
            Paste Example
          </button>
        </div>

        <div style={styles.tip}>
          Tip: In Doggy Market, open an item → NFT Details → copy “Inscription ID”. Paste it here.
        </div>

        {/* Little “phone card” like your screenshot (cosmetic) */}
        <div style={styles.previewCard}>
          <div style={styles.previewPhone}>
            <div style={styles.previewPhoneInner}>
              <div style={styles.previewKicker}>LOCKSCREENED</div>
              <div style={styles.previewTitle}>Doge Miners</div>
              <div style={styles.previewSub}>Paste inscription → preview → open in locker</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, any> = {
  page: {
    minHeight: "100vh",
    padding: "26px 18px 80px",
    position: "relative",
    backgroundImage: "url(/doge-miners-bg.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
  },
  inner: {
    position: "relative",
    maxWidth: 1200,
    margin: "0 auto",
    color: "white",
  },
  h1: {
    margin: "0 0 8px",
    fontSize: 42,
    fontWeight: 1000,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  h2: {
    margin: "0 0 10px",
    fontSize: 18,
    fontWeight: 1000,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    opacity: 0.95,
  },
  p: {
    margin: "0 0 18px",
    maxWidth: 740,
    lineHeight: 1.35,
    opacity: 0.92,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 560px) auto auto",
    gap: 10,
    alignItems: "center",
    maxWidth: 980,
  },
  input: {
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    padding: "0 12px",
    outline: "none",
    fontSize: 13,
  },
  btn: {
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 1000,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontSize: 11,
    padding: "0 14px",
    whiteSpace: "nowrap",
  },
  btnOn: {
    background: "rgba(140, 90, 255, 0.35)",
    color: "white",
    cursor: "pointer",
  },
  btnOff: {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.55)",
    cursor: "not-allowed",
  },
  btnGhost: {
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
  },
  tip: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.85,
  },
  previewCard: {
    marginTop: 22,
    width: 360,
    maxWidth: "100%",
    borderRadius: 22,
    background: "rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: 14,
  },
  previewPhone: {
    width: "100%",
    height: 430,
    borderRadius: 26,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "grid",
    placeItems: "center",
  },
  previewPhoneInner: {
    textAlign: "center",
    opacity: 0.9,
  },
  previewKicker: {
    fontSize: 11,
    fontWeight: 1000,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    opacity: 0.85,
  },
  previewTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: 1000,
    letterSpacing: "0.04em",
  },
  previewSub: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.85,
  },
};
