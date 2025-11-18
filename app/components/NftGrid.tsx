"use client";

import Link from "next/link";

export type NFT = {
  id: string;
  name?: string | null;
  image?: string | null;
  uri?: string | null;
};

export default function NftGrid({ nfts }: { nfts: NFT[] }) {
  if (!nfts || nfts.length === 0) {
    return (
      <p style={{ margin: "0 18px 18px", opacity: 0.75 }}>
        No NFTs found for this wallet / collection.
      </p>
    );
  }

  return (
    <div className="nft-grid">
      {nfts.map((n) => {
        const href =
          `/locker?mint=${encodeURIComponent(n.id)}` +
          `&image=${encodeURIComponent(n.image || "")}` +
          `&name=${encodeURIComponent(n.name || "")}` +
          (n.uri ? `&uri=${encodeURIComponent(n.uri)}` : "");

        return (
          <Link key={n.id} href={href} className="nft-card">
            <div className="thumb-wrap">
              {n.image ? (
                <img
                  src={n.image}
                  alt={n.name || n.id}
                  className="thumb"
                  loading="lazy"
                />
              ) : (
                <div className="thumb placeholder">No image</div>
              )}
            </div>
            <div className="meta">
              <div className="name">{n.name || n.id}</div>
            </div>
          </Link>
        );
      })}

      <style jsx>{`
        .nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 14px;
          padding: 0 18px 40px;
        }
        .nft-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #f3ebff;
          background: #111016;
          border-radius: 18px;
          padding: 10px;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04);
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            background 0.12s ease;
        }
        .nft-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 30px rgba(0, 0, 0, 0.45);
          background: #181623;
        }
        .thumb-wrap {
          border-radius: 12px;
          overflow: hidden;
          background: #1f1b33;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          image-rendering: pixelated;
        }
        .placeholder {
          font-size: 12px;
          opacity: 0.7;
        }
        .meta {
          margin-top: 6px;
          font-size: 11px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .name {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
