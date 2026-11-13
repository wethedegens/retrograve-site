"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { WalletError } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const studio = pathname === "/studio" || pathname?.startsWith("/studio/") || pathname === "/projects" || pathname?.startsWith("/projects/");
  const [connectionError, setConnectionError] = useState<{path:string;message:string} | null>(null);
  const onWalletError = useCallback((error: WalletError) => {
    if (!studio) {
      console.error(error);
      return;
    }
    // Expected wallet cancellation must not become a full-screen Next dev
    // overlay. Keep the failure visible without treating it as a login.
    const code = error.error?.code;
    const rejected = code === 4001 || /rejected|denied/i.test(error.message);
    setConnectionError({path:pathname || "",message:rejected
      ? "Phantom did not complete the wallet request. Tap Connect to request approval again."
      : "The wallet could not connect. Please reopen this page in your wallet browser and try again."});
  }, [studio, pathname]);
  // Browser wallet plumbing must never depend on a server-only secret.
  // Secure Helius authority checks remain server-side in Studio API routes.
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
    "https://api.mainnet-beta.solana.com";

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={Boolean(pathname) && !studio} onError={onWalletError}>
        <WalletModalProvider>
          {children}
          {studio && connectionError?.path === pathname ? <div role="alert" className="wallet-error">
            <p>{connectionError.message}</p>
            <button type="button" onClick={() => setConnectionError(null)}>Dismiss</button>
          </div> : null}
          <style jsx>{`
            .wallet-error{position:fixed;bottom:18px;left:18px;z-index:1100;box-sizing:border-box;max-width:min(420px,calc(100vw - 36px));padding:16px;border:1px solid #777;border-radius:12px;background:#191919;color:#eee;box-shadow:0 8px 32px #0008;font-size:14px;line-height:1.5}
            .wallet-error p{margin:0 0 10px}.wallet-error button{font:inherit;color:#eee;background:#333;border:1px solid #777;border-radius:7px;padding:7px 12px;cursor:pointer}
          `}</style>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
