// app/components/WalletGate.tsx
"use client";

import { ReactNode } from "react";

type WalletGateProps = {
  children?: ReactNode;
};

export default function WalletGate({ children }: WalletGateProps) {
  // ✅ Wallet button lives in TopNav only.
  // WalletGate should just wrap children (and you can add gating logic later if needed).
  return <>{children}</>;
}
