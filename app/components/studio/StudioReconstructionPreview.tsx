// app/components/studio/StudioReconstructionPreview.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { STORAGE_BUCKETS } from "../../lib/lockscreened/storagePaths";
import { downloadStorageBlob } from "../../lib/lockscreened/studioStorageClient";

type MatchedTraitLike = {
  traitType: string;
  traitValue: string;
  asset: { relativePath: string };
};

type Props = {
  session: LockScreenedSession;
  nft: { id: string; name: string; image?: string };
  matched: MatchedTraitLike[];
};

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Could not decode a trait layer image."));
    image.src = url;
  });
}

export default function StudioReconstructionPreview({
  session,
  nft,
  matched,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
      objectUrlsRef.current = [];
    };
  }, []);

  async function rebuild() {
    setBusy(true);
    setReady(false);
    setMessage("");

    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current = [];

    try {
      if (!matched.length) {
        throw new Error(
          "No matched trait layers are available for reconstruction."
        );
      }

      const decoded: Array<{
        traitType: string;
        traitValue: string;
        image: HTMLImageElement;
      }> = [];

      for (const item of matched) {
        const blob = await downloadStorageBlob({
          session,
          bucket: STORAGE_BUCKETS.creatorSourcePrivate,
          path: item.asset.relativePath,
        });

        const objectUrl = URL.createObjectURL(blob);
        objectUrlsRef.current.push(objectUrl);

        decoded.push({
          traitType: item.traitType,
          traitValue: item.traitValue,
          image: await loadImage(objectUrl),
        });
      }

      const first = decoded[0]?.image;
      if (!first?.naturalWidth || !first?.naturalHeight) {
        throw new Error("The first trait layer has no usable dimensions.");
      }

      const width = first.naturalWidth;
      const height = first.naturalHeight;
      const mismatch = decoded.find(
        (item) =>
          item.image.naturalWidth !== width ||
          item.image.naturalHeight !== height
      );

      if (mismatch) {
        throw new Error(
          mismatch.traitType +
            ": " +
            mismatch.traitValue +
            " is " +
            mismatch.image.naturalWidth +
            "×" +
            mismatch.image.naturalHeight +
            "; all source layers must match " +
            width +
            "×" +
            height +
            "."
        );
      }

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Reconstruction canvas is unavailable.");

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2D canvas is unavailable.");

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      for (const item of decoded) {
        ctx.drawImage(item.image, 0, 0, width, height);
      }

      setDimensions({ width, height });
      setReady(true);
      setMessage(
        "Rebuilt from " +
          decoded.length +
          " private source layer" +
          (decoded.length === 1 ? "" : "s") +
          " at " +
          width +
          "×" +
          height +
          "."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Reconstruction failed."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={topRow}>
        <div>
          <strong style={{ display: "block", fontSize: 10 }}>
            Visual reconstruction
          </strong>
          <span style={subtle}>
            Private founder layers · browser canvas only · not published
          </span>
        </div>

        <button
          onClick={rebuild}
          disabled={busy || !matched.length}
          style={button}
        >
          {busy ? "REBUILDING…" : ready ? "REBUILD AGAIN" : "PREVIEW REBUILD"}
        </button>
      </div>

      <div style={grid}>
        <PreviewCard label="MINTED NFT">
          {nft.image ? (
            <img src={nft.image} alt={nft.name} style={media} />
          ) : (
            <div style={empty}>No original image URL returned.</div>
          )}
        </PreviewCard>

        <PreviewCard label="LOCKSCREENED REBUILD">
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: dimensions
                ? String(dimensions.width) + " / " + String(dimensions.height)
                : "1 / 1",
              display: "grid",
              placeItems: "center",
              background: "#090910",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: ready ? "block" : "none",
                imageRendering: "pixelated",
              }}
            />
            {!ready ? (
              <div style={empty}>
                Run the private-layer rebuild to compare this NFT.
              </div>
            ) : null}
          </div>
        </PreviewCard>
      </div>

      {message ? (
        <div
          style={{
            marginTop: 8,
            color: ready ? "#a9ffd2" : "#ffd49e",
            fontSize: 8,
            lineHeight: 1.45,
          }}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}

function PreviewCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={card}>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

const wrap = {
  marginTop: 9,
  borderRadius: 14,
  border: "1px solid rgba(142,231,255,.12)",
  background: "rgba(77,185,224,.035)",
  padding: 10,
} as const;

const topRow = {
  display: "flex",
  gap: 8,
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
} as const;

const subtle = {
  display: "block",
  marginTop: 2,
  fontSize: 8,
  color: "rgba(255,255,255,.42)",
} as const;

const grid = {
  marginTop: 10,
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 8,
} as const;

const card = {
  minWidth: 0,
  overflow: "hidden",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(0,0,0,.2)",
} as const;

const labelStyle = {
  padding: "7px 8px",
  fontSize: 7,
  fontWeight: 900,
  letterSpacing: ".12em",
  color: "rgba(255,255,255,.42)",
  borderBottom: "1px solid rgba(255,255,255,.06)",
} as const;

const button = {
  minHeight: 32,
  borderRadius: 999,
  padding: "0 10px",
  border: "1px solid rgba(142,231,255,.16)",
  background: "rgba(77,185,224,.09)",
  color: "#fff",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".08em",
  cursor: "pointer",
} as const;

const media = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "contain",
  display: "block",
  background: "#090910",
} as const;

const empty = {
  minHeight: 120,
  padding: 12,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "rgba(255,255,255,.34)",
  fontSize: 8,
  lineHeight: 1.45,
} as const;
