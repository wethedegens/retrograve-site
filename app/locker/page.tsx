// app/locker/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import BackgroundPicker, { BgChoice } from "../components/BackgroundPicker";
import ExportButtons from "../components/ExportButtons";
import Composer, {
  type ComposerHandle,
  type SimpleNft,
  type MetaAttribute,
} from "../components/Composer";
import ShareActions from "../components/ShareActions";
import DevBgTester from "../components/DevBgTester";
import ClientOnly from "../components/ClientOnly";
import WalletDebug from "../components/WalletDebug";

type NftFetchResp = {
  id: string;
  name?: string;
  image?: string;
  attributes?: MetaAttribute[];
} | null;

function LockerInner() {
  const sp = useSearchParams();
  const mint = sp.get("mint") || "";
  const uri = sp.get("uri") || "";
  const devMode = sp.get("devbg") === "1";

  const imageParam = sp.get("image") || "";
  const nameParam = sp.get("name") || "";

  const composerRef = useRef<ComposerHandle | null>(null);

  const initialBg = useMemo<BgChoice>(
    () => ({ kind: "color", value: "#3e2d75" }),
    []
  );

  const [bg, setBg] = useState<BgChoice | null>(initialBg);
  const [nft, setNft] = useState<SimpleNft | null>(() => {
    if (!mint && !imageParam) return null;
    return {
      id: mint || "unknown",
      name: nameParam || undefined,
      image: imageParam || undefined,
    };
  });

  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<null | string>(null);

  useEffect(() => {
    setBg(initialBg);
  }, [initialBg]);

  useEffect(() => {
    if (!devMode) return;

    const onDevBg = (e: Event) => {
      const ev = e as CustomEvent<string | null>;
      const url = ev.detail;

      if (url) {
        setHint("Using dev background (local file)");
      } else {
        setBg(initialBg);
        setHint(null);
      }
    };

    window.addEventListener("devbg:change", onDevBg);
    return () => window.removeEventListener("devbg:change", onDevBg);
  }, [devMode, initialBg]);

  useEffect(() => {
    let cancelled = false;

    if (imageParam) {
      const fromParams: SimpleNft = {
        id: mint || "unknown",
        name: nameParam || undefined,
        image: imageParam,
      };
      setNft(fromParams);
      setLoading(false);
      return;
    }

    if (!mint) {
      setNft(null);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams({ mint });
        if (uri) qs.set("uri", uri);
        const r = await fetch(`/api/nft-by-mint?${qs.toString()}`, {
          cache: "no-store",
        });
        const j = (await r.json()) as NftFetchResp;

        if (!cancelled) {
          if (j) {
            setNft({
              id: j.id,
              name: j.name,
              image: j.image,
              attributes: Array.isArray(j.attributes) ? j.attributes : [],
            });
          } else {
            setNft(null);
          }
        }
      } catch {
        if (!cancelled) setNft(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mint, uri, imageParam, nameParam]);

  return (
    <main style={{ padding: "18px 0 80px" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        <a href="/retrogs" style={{ color: "#bda9ff", opacity: 0.85 }}>
          ← back to grid
        </a>

        <div
          className="locker-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 340px) 1fr",
            gap: 22,
            marginTop: 12,
            alignItems: "start",
          }}
        >
          {/* LEFT PANEL */}
          <div className="left-panel">
            <BackgroundPicker value={bg || initialBg} onChange={setBg} />
            <div style={{ height: 12 }} />
            <ExportButtons composerRef={composerRef} />
            <div style={{ height: 12 }} />
            <ClientOnly>
              <ShareActions
                composerRef={composerRef}
                nftName={nft?.name || nft?.id || "RetroGrave"}
                onUsing={(msg) => setHint(msg)}
              />
            </ClientOnly>
          </div>

          {/* RIGHT PANEL — PHONE */}
          <div className="right-panel">
            <div
              className="phone-frame"
              style={{
                position: "relative",
                width: "min(360px, 78vw)",
                aspectRatio: "9 / 19.5",
                borderRadius: 26,
                overflow: "hidden",
                boxShadow: "0 18px 44px rgba(0, 0, 0, 0.45)",
                background: "#221a33",
              }}
            >
              <div
                className="dev-bg"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />

              <div
                className="phone-surface"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  gridTemplateRows: "auto 1fr",
                  alignContent: "end",
                  justifyItems: "center",
                  padding: "8px 8px 10px 8px",
                  gap: 4,
                  zIndex: 1,
                }}
              >
                <div
                  className="phone-hint"
                  style={{
                    alignSelf: "start",
                    justifySelf: "center",
                    fontSize: 11,
                    lineHeight: 1,
                    color: "#cfc2ff",
                    background: "rgba(0,0,0,0.35)",
                    padding: "6px 8px",
                    borderRadius: 999,
                    backdropFilter: "blur(2px)",
                    pointerEvents: "none",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading
                    ? "Loading image…"
                    : hint || "Preview is scaled; exports are full size."}
                </div>

                <Composer ref={composerRef} nft={nft} bg={bg || initialBg} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClientOnly>
        <DevBgTester />
      </ClientOnly>

      <WalletDebug />

      {/* ======= RESPONSIVE FIXES ======= */}
      <style jsx>{`
        /* MOBILE — STACK EVERYTHING */
        @media (max-width: 860px) {
          .locker-layout {
            grid-template-columns: 1fr;
          }
          .left-panel {
            order: 2;
          }
          .right-panel {
            order: 1;
            display: flex;
            justify-content: center;
          }
        }

        /* DESKTOP — CENTER PHONE IN RIGHT COLUMN */
        @media (min-width: 861px) {
          .right-panel {
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

export default function LockerPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
            color: "#cfc2ff",
          }}
        >
          Loading locker…
        </main>
      }
    >
      <LockerInner />
    </Suspense>
  );
}
