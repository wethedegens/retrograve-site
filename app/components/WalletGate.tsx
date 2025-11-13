"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

/**
 * Floating wallet button (top-right). Uses your existing wallet providers.
 * - Shows "Select Wallet" when not connected (opens modal if available).
 * - Shows "Disconnect" when connected.
 */
export default function WalletGate() {
  const { connected, connect, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    try {
      setBusy(true);
      if (connected) {
        await disconnect();
      } else {
        // Prefer the wallet modal if present; otherwise call connect() directly
        if (setVisible) setVisible(true);
        else await connect();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wallet-fixed">
      <button className="wallet-btn" onClick={onClick} disabled={busy}>
        {connected ? "Disconnect" : "Select Wallet"}
      </button>
    </div>
  );
}
