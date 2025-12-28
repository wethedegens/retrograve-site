// app/components/WalletGate.tsx
"use client";

import { ReactNode } from "react";

type WalletGateProps = {
  children?: ReactNode;
};

/**
 * WalletGate is ONLY a wrapper now.
 *
 * ✅ IMPORTANT:
 * - Do NOT render WalletMultiButton here.
 * - The wallet button lives in TopNav only.
 * - This prevents "two wallets" + the black bar / extra top element.
 */
export default function WalletGate({ children }: WalletGateProps) {
  return <>{children}</>;
}
