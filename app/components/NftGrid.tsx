"use client";

export type NFT = {
  id: string;
  name?: string;
  image?: string;
  uri?: string | null;
};

export default function NftGrid({ nfts }: { nfts: NFT[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 14,
        padding: "0 18px",
      }}
    >
      {nfts.map((n) => {
        const href =
          `/locker?mint=${encodeURIComponent(n.id)}` +
          (n.uri ? `&uri=${encodeURIComponent(n.uri)}` : "");

        return (
          <a
            key={n.id}
            href={href}
            style={{
              display: "grid",
              gap: 8,
              textDecoration: "none",
              color: "inherit",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: 10,
              background: "rgba(0,0,0,.25)",
            }}
          >
            <div
              style={{
                aspectRatio: "1/1",
                overflow: "hidden",
                borderRadius: 8,
                background: "rgba(255,255,255,.03)",
                display: "grid",
                placeItems: "center",
              }}
            >
              {n.image ? (
                <img
                  src={n.image}
                  alt={n.name || n.id}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    imageRendering: "pixelated",
                  }}
                />
              ) : (
                <div style={{ opacity: 0.6, fontSize: 12 }}>No image</div>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.2,
                wordBreak: "break-word",
                opacity: 0.9,
              }}
            >
              {n.name || n.id}
            </div>
          </a>
        );
      })}
    </div>
  );
}
