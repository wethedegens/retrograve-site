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

/** ===== Doge color helper (stable per inscription) ===== */
function hashToHue(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function dogeBgFromId(id: string) {
  const base = (id || "").trim();
  if (!base) return "#0b0816";
  const hue = hashToHue(base);
  return `hsl(${hue} 55% 18%)`;
}

function extractDogeIdFromImageUrl(url: string) {
  const u = (url || "").trim();
  if (!u) return "";
  const idx = u.indexOf("/content/");
  if (idx === -1) return "";
  const tail = u.slice(idx + "/content/".length);
  return tail.split("?")[0] || "";
}

function LockerInner() {
  const sp = useSearchParams();
  const mint = sp.get("mint") || "";
  const uri = sp.get("uri") || "";
  const devMode = sp.get("devbg") === "1";

  // "magapixel" (default), "miners", "dogeminers", "gainz", "midevils", "meowga", "zeromonkebiz", "sagamonkes"
  const project = (sp.get("project") || "magapixel").toLowerCase();

  const imageParam = sp.get("image") || "";
  const nameParam = sp.get("name") || "";
  const idParam = sp.get("id") || "";

  const composerRef = useRef<ComposerHandle | null>(null);

  const dogeId = useMemo(() => {
    if (project !== "dogeminers") return "";
    return idParam || extractDogeIdFromImageUrl(imageParam);
  }, [project, idParam, imageParam]);

  const dogePageBg = useMemo(() => {
    if (project !== "dogeminers") return "";
    // If you want to FORCE orange always, change to "#a55a00"
    return dogeBgFromId(dogeId);
  }, [project, dogeId]);

  const initialBg = useMemo<BgChoice>(() => {
    if (project === "dogeminers") return { kind: "color", value: "#2f2a45" };
    return { kind: "color", value: "#3e2d75" };
  }, [project]);

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

  const gridHref =
    project === "dogeminers"
      ? "/doge-miners"
      : project === "miners"
      ? "/enchanted-miners-nfts"
      : project === "gainz"
      ? "/gainz-nft"
      : project === "midevils"
      ? "/midevils-nfts"
      : project === "meowga"
      ? "/meowga-nfts"
      : project === "zeromonkebiz"
      ? "/zeromonkebiz-nfts"
      : project === "sagamonkes"
      ? "/saga-monkes-nfts"
      : "/magapixel-nfts";

  const backLabel = project === "dogeminers" ? "← back to miner finder" : "← back to grid";

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

  const isDogeminers = project === "dogeminers";
  const isMiners = project === "miners";
  const isMagapixel = project === "magapixel";
  const isGainz = project === "gainz";
  const isMidevils = project === "midevils";
  const isMeowga = project === "meowga";
  const isZeromonkebiz = project === "zeromonkebiz";
  const isSagamonkes = project === "sagamonkes";

  return (
    <main
      className="locker-page"
      style={{
        // ✅ IMPORTANT: forces background to fill entire viewport width/height like before
        minHeight: "100vh",
        width: "100%",
        padding: "0 0 80px",

        ...(isDogeminers
          ? {
              backgroundColor: dogePageBg || "#0b0816",
              backgroundImage: "none",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),

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

        ...(isGainz
          ? {
              backgroundColor: "#05020A",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),

        ...(isMidevils
          ? {
              backgroundColor: "#05020A",
              backgroundImage: 'url("/midevils-project-page-bg.jpg")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),

        ...(isMeowga
          ? {
              backgroundColor: "#0b0b12",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),

        ...(isZeromonkebiz
          ? {
              backgroundColor: "#0b0b12",
              backgroundImage: 'url("/zeromonkebiz-bg.png")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),

        ...(isSagamonkes
          ? {
              backgroundColor: "#0b0b12",
              backgroundImage: 'url("/saga-monkes-bg.jpg")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }
          : {}),
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 18px 0" }}>
        <a
          href={gridHref}
          className="back-link"
          style={{
            color: "#ffffff",
            opacity: 0.95,
            textShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}
        >
          {backLabel}
        </a>

        <div
          className="locker-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 360px) 1fr",
            gap: 22,
            marginTop: 12,
            alignItems: "start",
          }}
        >
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
              <p style={{ marginTop: 10, fontSize: 12, opacity: 0.95, color: "#ffffff" }}>
                {hint}
              </p>
            )}

            {loading ? (
              <p style={{ marginTop: 10, fontSize: 12, opacity: 0.9, color: "#ffffff" }}>
                Loading NFT…
              </p>
            ) : null}
          </div>

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
        .left-panel {
          position: relative;
          padding: 14px 14px 16px;
          border-radius: 18px;
          background: rgba(10, 8, 20, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .back-link {
          display: inline-block;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(10, 8, 20, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          text-decoration: none;
        }

        .back-link:hover {
          background: rgba(10, 8, 20, 0.45);
        }

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
