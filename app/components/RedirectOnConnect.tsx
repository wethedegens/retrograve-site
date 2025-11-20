// app/components/RedirectOnConnect.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

/**
 * We USED to auto-redirect on connect (from "/" to "/retrogs"), but that
 * was causing issues on mobile Phantom by interrupting the connect flow.
 *
 * Now this component is a light "monitor" only:
 * - It does NOT redirect anywhere.
 * - It just logs when a wallet connects, so we can keep/extend it later
 *   without breaking mobile.
 */
export default function RedirectOnConnect() {
  const { connected, publicKey } = useWallet();
  const pathname = usePathname();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!hasLogged.current && connected && publicKey) {
      console.log(
        "[RedirectOnConnect] Wallet connected on",
        pathname,
        "as",
        publicKey.toBase58()
      );
      hasLogged.current = true;
    }
  }, [connected, publicKey, pathname]);

  return null;
}
