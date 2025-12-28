// app/locker/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
export const dynamic = "force-dynamic";

import BackgroundPicker from "../components/BackgroundPicker";
import Composer, {
  type ComposerHandle,
  type SimpleNft,
  type MetaAttribute,
  type BgChoice,
} from "../components/Composer";
import ExportButtons from "../components/ExportButtons";
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

  // "magapixel" (default) or "miners"
  const project = (sp.get("project") || "magapixel").toLowerCase();

  const imageParam = sp.get("image") || "";
  const nameParam = sp.get("name") || "";

  const composerRef = useRef<ComposerHandle | null>(null);

  const initialBg = useMemo<BgChoice>(
    () => ({ kind: "color", value: "#3e2d75" }),
    []
  );

  // Keep bg as a non-null BgChoice to make TS happy
  const [bg, setBg] = useState<BgChoice>(initialBg);

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

  // where "back" should send people if history.back() isn't available
  const gridHref = project === "miners" ? "/my-miners" : "/magapixel-nfts";

  // keep bg in sync with initialBg when it changes
  useEffect(() => {
    setBg(initialBg);
  }, [initialBg]);

  // dev background tester (updates hint, and resets bg when cleared)
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

  // fetch NFT unless image is in URL
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

  const isMiners = project === "miners";
  const isMagapixel = project === "magapixel";

  const pageTitle = isMiners ? "Enchanted Miners Locker" : "MAGApixel Locker";
  const pageSub = isMiners
    ? "Pick a miner wallpaper, drop your NFT on it, and export your lock screen."
    : "Pick a MAGApixel background, drop your NFT on it, and export your lock screen.";

  return (
    <main
      style={{
        // ✅ give breathing room under your fixed nav
        padding: "74px 0 80px",

        ...(isMiners
          ? {
              backgroundColor: "#05020A",
              backgroundImage: 'url("/enchanted-miners-bg.png")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "bottom center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),

        ...(isMagapixel
          ? {
              backgroundColor: "#0078e9",
              backgroundImage: 'url("/bg-ovaloffice.png")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        {/* TOP ROW */}
        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          <a
            href={gridHref}
            style={{
              color: isMagapixel ? "#ffffff" : "#bda9ff",
              opacity: 0.92,
              textShadow: isMagapixel ? "0 2px 10px rgba(0,0,0,0.25)" : "none",
              width: "fit-content",
            }}
          >
            ← back to grid
          </a>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                textShadow: "0 10px 34px rgba(0,0,0,.35)",
              }}
            >
              {pageTitle}
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                maxWidth: 620,
                color: "rgba(255,255,255,.86)",
                textShadow: "0 10px 34px rgba(0,0,0,.25)",
                lineHeight: 1.4,
              }}
            >
              {pageSub}
              {loading ? " (Loading NFT…)" : ""}
            </p>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div
          className="locker-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 360px) 1fr",
            gap: 22,
            alignItems: "start",
          }}
        >
          {/* LEFT PANEL */}
          <div className="left-panel">
            <BackgroundPicker value={bg} onChange={setBg} project={project} />

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

            {hint && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  opacity: 0.92,
                  color: "#ffffff",
                }}
              >
                {hint}
              </p>
            )}
          </div>

          {/* RIGHT PANEL — PHONE PREVIEW */}
          <div className="right-panel">
            <div
              className="phone-frame"
              style={{
                position: "relative",

                // ✅ ~25% larger than your previous min(360px, 78vw)
                width: "min(450px, 86vw)",

                aspectRatio: "9 / 19.5",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 18px 44px rgba(0, 0, 0, 0.45)",
                background: "#221a33",
                margin: "0 auto",
              }}
            >
              {/* Optional dev overlay target */}
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
                  alignContent: "end",
                  justifyItems: "center",
                  padding: "8px 8px 10px 8px",
                  gap: 4,
                  zIndex: 1,
                }}
              >
                <Composer ref={composerRef} nft={nft} bg={bg} />
              </div>

              {/* subtle frame shine */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 28,
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <ClientOnly>
        <DevBgTester />
      </ClientOnly>

      <WalletDebug />

      <style jsx>{`
        .phone-frame {
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 860px) {
          .locker-layout {
            grid-template-columns: 1fr;
          }

          .left-panel {
            order: 2;
            margin-top: 12px;
          }

          .right-panel {
            order: 1;
            width: 100%;
            display: flex;
            justify-content: center;
          }
        }

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
            paddingTop: 84,
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
