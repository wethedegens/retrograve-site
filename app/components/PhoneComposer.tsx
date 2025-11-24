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
          align-items: flex-start;
        }

        .side {
          max-width: 320px;
        }

        /* 📱 On mobile: stack vertically (phone on top, buttons below) */
        @media (max-width: 900px) {
          .phone-composer {
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 14px;
          }

          .side {
            order: 2;
            width: 100%;
            max-width: 360px;
          }
        }
      `}</style>
    </div>
  );
}
