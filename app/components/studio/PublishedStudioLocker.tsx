// app/components/studio/PublishedStudioLocker.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Composer, {
  type BgChoice,
  type ComposerHandle,
  type SimpleNft,
} from "../Composer";
import ExportButtons from "../ExportButtons";
import ShareActions from "../ShareActions";
import ClientOnly from "../ClientOnly";
import PublishedBackgroundPicker from "./PublishedBackgroundPicker";
import PublishedUniversalComposer from "./PublishedUniversalComposer";

type Background = {
  id: string;
  name: string;
  deviceAssets: Record<string, string>;
};

export default function PublishedStudioLocker({
  project,
}: {
  project: {
    slug: string;
    name: string;
    render_mode: string;
    render_profile?: any;
    backgrounds: Background[];
    layers: any[];
    publishedTraitAssets: any[];
  };
}) {
  const search = useSearchParams();
  const mint = search.get("mint") || "";
  const uri = search.get("uri") || "";

  const composerRef = useRef<ComposerHandle | null>(null);
  const [nft, setNft] = useState<SimpleNft | null>(null);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(Boolean(mint));
  const [message, setMessage] = useState("");

  const firstBackground = useMemo<BgChoice>(() => {
    const item = project.backgrounds.find(
      (background) => background.deviceAssets?.phone
    );

    if (!item) return { kind: "color", value: "#241c38" };

    return {
      kind: "image",
      image: item.deviceAssets.phone,
      deviceAssets: {
        phone: item.deviceAssets.phone,
        ipad: item.deviceAssets.ipad,
        desktop: item.deviceAssets.desktop,
      },
      backgroundId: item.id,
    };
  }, [project.backgrounds]);

  const [background, setBackground] = useState<BgChoice>(firstBackground);

  useEffect(() => {
    setBackground(firstBackground);
  }, [firstBackground]);

  useEffect(() => {
    let cancelled = false;

    if (!mint) {
      setNft(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setMessage("");

      try {
        const query = new URLSearchParams({ mint });
        if (uri) query.set("uri", uri);

        const response = await fetch(
          "/api/nft-by-mint?" + query.toString(),
          { cache: "no-store" }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Could not load this NFT.");
        }

        if (!cancelled) {
          // Deliberately omit metadata attributes here. The legacy Composer's
          // layered mode is MAGApixel-specific. Creator Studio public lockers
          // use the flattened NFT image until derived universal render layers
          // are published separately.
          setNft({
            id: String(data.id || mint),
            name: data.name || undefined,
            image: data.image || undefined,
            uri: uri || null,
          });
          setAttributes(
            Array.isArray(data.attributes) ? data.attributes : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error ? error.message : "Could not load NFT."
          );
          setNft(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mint, uri]);

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "#fff",
        background:
          "radial-gradient(900px 520px at 50% 0, rgba(93,68,174,.16), transparent 70%), #08070f",
        padding: "72px 18px 90px",
      }}
    >
      <section style={{ width: "min(1120px,100%)", margin: "0 auto" }}>
        <a
          href={"/projects/" + project.slug + "/collection"}
          style={{
            color: "#cdbbff",
            textDecoration: "none",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".1em",
          }}
        >
          ← BACK TO {project.name.toUpperCase()}
        </a>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "minmax(260px,360px) minmax(0,1fr)",
            gap: 22,
            alignItems: "start",
          }}
        >
          <aside
            style={{
              borderRadius: 19,
              padding: 14,
              border: "1px solid rgba(255,255,255,.09)",
              background: "rgba(12,9,24,.7)",
              display: "grid",
              gap: 13,
            }}
          >
            <div>
              <div
                style={{
                  color: "#c9b7ff",
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: ".14em",
                }}
              >
                CREATOR STUDIO LOCKER
              </div>
              <h1 style={{ margin: "5px 0 0", fontSize: 22 }}>
                {project.name}
              </h1>
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: 9,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,.45)",
                }}
              >
                Published creator backgrounds with LockScreened device exports.
              </p>
            </div>

            <PublishedBackgroundPicker
              backgrounds={project.backgrounds}
              value={background}
              onChange={setBackground}
            />

            <ExportButtons composerRef={composerRef} />

            <ClientOnly>
              <ShareActions
                composerRef={composerRef}
                nftName={nft?.name || nft?.id || project.name}
                onUsing={setMessage}
              />
            </ClientOnly>

            {loading ? (
              <div style={notice}>Loading NFT…</div>
            ) : null}

            {message ? <div style={notice}>{message}</div> : null}
          </aside>

          <div
            style={{
              display: "grid",
              justifyItems: "center",
              gap: 9,
            }}
          >
            {project.render_mode === "layered_traits" &&
            project.publishedTraitAssets.length ? (
              <PublishedUniversalComposer
                ref={composerRef}
                attributes={attributes}
                layers={project.layers}
                assets={project.publishedTraitAssets}
                bg={background}
                nftName={nft?.name || project.name}
                renderProfile={project.render_profile}
              />
            ) : (
              <Composer
                ref={composerRef}
                nft={nft}
                bg={background}
                project={"studio:" + project.slug}
              />
            )}

            <div
              style={{
                maxWidth: 520,
                textAlign: "center",
                color: "rgba(255,255,255,.38)",
                fontSize: 8,
                lineHeight: 1.5,
              }}
            >
              {project.render_mode === "layered_traits" &&
              project.publishedTraitAssets.length
                ? "Universal trait reconstruction is active from published render derivatives. Private founder source files remain inaccessible."
                : "This project is using the NFT's minted composite artwork with published device backgrounds."}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const notice = {
  borderRadius: 12,
  padding: 9,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.025)",
  color: "rgba(255,255,255,.58)",
  fontSize: 9,
} as const;
