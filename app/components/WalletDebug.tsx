"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export default function WalletDebug() {
  const { connected, wallet, publicKey } = useWallet();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        left: 8,
        padding: "6px 8px",
        fontSize: 10,
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        borderRadius: 4,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div>connected: {String(connected)}</div>
      <div>wallet: {wallet?.adapter?.name || "none"}</div>
      <div>
        pk: {publicKey ? publicKey.toBase58().slice(0, 6) + "…" : "–"}
      </div>
    </div>
  );
}
