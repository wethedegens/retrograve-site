// app/components/PhoneComposer.tsx
"use client";

import { useRef } from "react";
import Composer, {
  type ComposerHandle,
  type SimpleNft,
  type BgChoice,
} from "./Composer";
import ExportButtons from "./ExportButtons";

export default function PhoneComposer({
  nft,
  bg,
}: {
  nft: SimpleNft | null;
  bg: BgChoice | null;
}) {
  // ✅ must be "ComposerHandle | null" so it matches ExportButtons + ShareActions
  const composerRef = useRef<ComposerHandle | null>(null);

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
          width: 280px;
        }

        @media (max-width: 900px) {
          .phone-composer {
            grid-template-columns: 1fr;
          }
          .side {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
