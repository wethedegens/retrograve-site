// app/components/WalletGate.tsx
"use client";

import { ReactNode } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type WalletGateProps = {
  children?: ReactNode;
};

export default function WalletGate({ children }: WalletGateProps) {
  return (
    <>
      {/* This renders the purple Connect/Disconnect button */}
      <WalletMultiButton />

      {/* If anything is wrapped in <WalletGate> ... </WalletGate>, it still works */}
      {children}
    </>
  );
}
