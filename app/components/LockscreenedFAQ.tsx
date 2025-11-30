// app/components/LockscreenedFAQ.tsx
"use client";

import { useState } from "react";

type Item = {
  q: string;
  a: string;
};

const FAQ_ITEMS: Item[] = [
  {
    q: "What is LockScreened?",
    a: "LockScreened is a customizable wallpaper engine for NFT collections. Holders can connect their wallet, choose an NFT, and export perfectly sized lock screens for phones, tablets, and desktops."
  },
  {
    q: "Is LockScreened free to use?",
    a: "Yes. If you hold a supported NFT, the export tools are free. Partner projects may offer optional premium backgrounds or themes, but the core engine is always free."
  },
  {
    q: "Do I need to connect my wallet?",
    a: "Only if you want LockScreened to automatically detect your NFTs. You can browse partner projects and preview public backgrounds without connecting."
  },
  {
    q: "Is connecting my wallet safe?",
    a: "Yes. LockScreened only checks your public wallet address to verify the NFTs you hold. It never requests transfers, approvals, or spending permissions."
  },
  {
    q: "Which wallets are supported?",
    a: "Phantom, Backpack, Solflare, OKX, Ledger via browser, and all Wallet Standard compatible wallets."
  },
  {
    q: "What happens to my NFTs when I use the locker?",
    a: "Nothing changes. Your NFTs remain in your wallet. LockScreened never modifies, transfers, lists, or stakes any assets. It simply reads metadata client-side to render your export."
  },
  {
    q: "Can I upload my own backgrounds?",
    a: "Yes. Every locker allows custom background uploads. Images are rendered locally behind your NFT at perfect device resolution."
  },
  {
    q: "What devices are supported?",
    a: "iPhone, Android, iPad, desktop widescreen, and full-resolution master exports."
  },
  {
    q: "Will more projects be added?",
    a: "Yes. LockScreened is built to onboard new partner collections easily. When a project is activated, its locker appears automatically on the homepage grid."
  },
  {
    q: "Where can I get help if something looks off?",
    a: "You can reach out through our Discord or X profile. Screenshots help us troubleshoot device-specific issues quickly."
  }
];

export default function LockscreenedFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq-wrap">
      <h2 className="faq-title">FAQ</h2>

      <div className="faq-list">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div
              key={idx}
              className={`faq-item ${isOpen ? "open" : ""}`}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <div className="faq-q">{item.q}</div>
              {isOpen && <div className="faq-a">{item.a}</div>}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .faq-wrap {
          margin-top: 40px;
        }

        .faq-title {
          text-align: center;
          font-size: 22px;
          margin-bottom: 20px;
          color: #f4ecff;
          text-shadow: 0 0 12px rgba(186, 137, 255, 0.45);
        }

        .faq-list {
          display: grid;
          gap: 10px;
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-item {
          border-radius: 14px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .faq-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .faq-q {
          font-size: 15px;
          color: #f8f1ff;
        }

        .faq-a {
          margin-top: 10px;
          color: #cfc3ec;
          font-size: 14px;
          line-height: 1.5;
        }

        .open {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.22);
        }
      `}</style>
    </div>
  );
}
