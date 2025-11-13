// app/components/PhoneComposer.tsx
"use client";

import { useRef } from "react";
import Composer, { ComposerHandle, SimpleNft, BgChoice } from "./Composer";
import ExportButtons from "./ExportButtons";

export default function PhoneComposer({
  nft,
  bg,
}: {
  nft: SimpleNft | null;
  bg: BgChoice | null;
}) {
  const composerRef = useRef<ComposerHandle>(null);

  return (
    <div className="phone-composer">
      <Composer ref={composerRef} nft={nft} bg={bg} />
      <div className="side">
        <ExportButtons composerRef={composerRef} />
      </div>

      <style jsx>{`
        .phone-composer {
          display: grid;
          grid-template-columns: auto 280px;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .phone-composer { grid-template-columns: 1fr; }
          .side { order: 2; }
        }
      `}</style>
    </div>
  );
}
