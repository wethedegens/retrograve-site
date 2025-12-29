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

type NftFetchResp =
  | {
      id: string;
      name?: string;
      image?: string;
      attributes?: MetaAttribute[];
    }
  | null;

function LockerInner() {
  const sp = useSearchParams();
  const mint = sp.get("mint") || "";
  const uri = sp.get("uri") || "";
  const devMode = sp.get("devbg") === "1";

  // "magapixel" (default) or "miners" or "gainz"
  const project = (sp.get("project") || "magapixel").toLowerCase();

  const imageParam = sp.get("image") || "";
  const nameParam = sp.get("name") || "";

  const composerRef = useRef<ComposerHandle | null>(null);

  const initialBg = useMemo<BgChoice>(() => ({ kind: "color", value: "#3e2d75" }), []);

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

  const isMiners = project === "miners";
  const isMagapixel = project === "magapixel";

  return (
    <main
      style={{
        padding: "0 0 80px",

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
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 18px 0" }}>
        <a
          href={gridHref}
          style={{
            color: isMagapixel ? "#ffffff" : "#bda9ff",
            opacity: 0.9,
            textShadow: isMagapixel ? "0 2px 10px rgba(0,0,0,0.25)" : "none",
          }}
        >
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
              <p style={{ marginTop: 10, fontSize: 12, opacity: 0.9, color: "#ffffff" }}>
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
                width: "min(360px, 78vw)",
                aspectRatio: "9 / 19.5",
                borderRadius: 26,
                overflow: "hidden",
                boxShadow: "0 18px 44px rgba(0, 0, 0, 0.45)",
                background: "#221a33",
                margin: "0 auto",
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
                {/* ✅ PASS PROJECT DOWN (Gainz-only rules live in Composer) */}
                <Composer ref={composerRef} nft={nft} bg={bg} project={project} />
              </div>
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
          }

          .right-panel {
            order: 1;
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .phone-frame {
            margin-left: auto;
            margin-right: auto;
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
