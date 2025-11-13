// app/components/RedirectOnConnect.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

/**
 * Home-only redirect: when a user CONNECTS a wallet on the homepage (/),
 * immediately send them to /retrogs. Never runs on other routes.
 */
export default function RedirectOnConnect() {
  const { connected, wallet, wallets, publicKey } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const armed = useRef(false); // we arm when on "/" so event handlers only redirect from home

  // Arm the redirect only on "/"
  useEffect(() => {
    armed.current = pathname === "/";
  }, [pathname]);

  useEffect(() => {
    // If we're not on home, do nothing at all.
    if (pathname !== "/") return;

    // Prefer the adapter event for a "newly connected" signal.
    const adapter = wallet?.adapter;

    const handleConnect = () => {
      if (armed.current) {
        armed.current = false; // prevent any double-fires
        router.replace("/retrogs");
      }
    };

    if (adapter && "on" in adapter) {
      // Subscribe to 'connect' so we trigger only on a new connection
      // @ts-ignore - wallet adapters are event emitters
      adapter.on("connect", handleConnect);
      return () => {
        // @ts-ignore
        adapter.off?.("connect", handleConnect);
      };
    }

    // Fallback: if we landed on "/" already connected (e.g., page refresh)
    if (connected && publicKey && armed.current) {
      armed.current = false;
      router.replace("/retrogs");
    }
  }, [connected, wallet, publicKey, pathname, router, wallets]);

  return null;
}
