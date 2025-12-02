// app/components/LockscreenedFAQ.tsx
"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is LockScreened?",
    answer:
      "LockScreened is a holder-first toolkit that turns partner NFT collections into perfectly sized, crisp wallpapers for phones, tablets, and desktops. You connect a supported wallet, open a project’s locker, and export device-ready backgrounds.",
  },
  {
    question: "Is LockScreened free to use?",
    answer:
      "Yes. Browsing, swapping backgrounds, and exporting wallpapers from live partner lockers is free for eligible holders. Some partners may offer premium traits or upgrades separately.",
  },
  {
    question: "Do I need to connect my wallet?",
    answer:
      "You only need to connect a wallet when you want to unlock holder-only features in a partner locker (like seeing your NFTs or accessing holder-only backgrounds). You can still read about projects without connecting.",
  },
  {
    question: "Is connecting my wallet safe?",
    answer:
      "Yes. LockScreened is view-only and does not request any transfer permissions. Always double-check you are on the official RetroGrave / LockScreened URLs before connecting, and never approve transactions you don’t recognize.",
  },
  {
    question: "Which wallets are supported?",
    answer:
      "We currently support major Solana wallets that work with the standard wallet adapter (like Phantom and similar wallets). Support may expand over time as we add new partner projects and ecosystems.",
  },
  {
    question: "What happens to my NFTs when I use the locker?",
    answer:
      "Nothing is moved or changed on-chain. We simply read which NFTs you hold from a partner collection so we can display them in the locker and render wallpapers around them.",
  },
  {
    question: "Can I upload my own backgrounds?",
    answer:
      "Yes. Most lockers will let you upload your own custom backgrounds so you can match your NFT to your personal style. Just be sure to use high-resolution images for the best results.",
  },
  {
    question: "What devices are supported?",
    answer:
      "LockScreened focuses on phones first, with exports sized for common iPhone and Android devices. Many lockers will also include tablet and desktop-friendly versions.",
  },
  {
    question: "Will more projects be added?",
    answer:
      "That’s the plan. LockScreened is built as a multi-project ecosystem. As new partners join, they’ll get their own lockers and appear in the Partner Projects grid.",
  },
  {
    question: "Where can I get help if something looks off?",
    answer:
      "If something looks broken or off, hop into the RetroGrave / LockScreened Discord and drop a message in the support channel. Screenshots and device details are super helpful.",
  },
];

export default function LockscreenedFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-wrap">
      <h2 className="faq-title">FAQ</h2>

      <div className="faq-list">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={item.question} className="faq-item">
              <button
                className="faq-question"
                onClick={() =>
                  setOpenIndex((prev) => (prev === index ? null : index))
                }
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className={`faq-icon ${isOpen ? "open" : ""}`}>
                  {isOpen ? "–" : "+"}
                </span>
              </button>

              <div className={`faq-answer ${isOpen ? "open" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .faq-wrap {
          width: 100%;
          margin: 0 auto;
        }

        .faq-title {
          text-align: center;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          font-size: 22px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 18px;
          color: #111827;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faq-item {
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.5);
          box-shadow:
            0 14px 30px rgba(15, 23, 42, 0.9),
            0 0 0 1px rgba(30, 64, 175, 0.35);
          overflow: hidden;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: background 0.25s ease, border-color 0.25s ease,
            box-shadow 0.25s ease, transform 0.2s ease;
        }

        .faq-item:hover {
          background: rgba(15, 23, 42, 0.98);
          border-color: rgba(129, 140, 248, 0.8);
          box-shadow:
            0 18px 36px rgba(15, 23, 42, 1),
            0 0 24px rgba(129, 140, 248, 0.5);
          transform: translateY(-1px);
        }

        .faq-question {
          width: 100%;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          color: #f9fafb;
          text-align: left;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
        }

        .faq-icon {
          font-family: "VT323", monospace;
          font-size: 20px;
          width: 28px;
          text-align: center;
          border-radius: 999px;
          border: 1px solid rgba(191, 219, 254, 0.8);
          background: radial-gradient(
            120% 180% at 0% 0%,
            #4f46e5,
            #1e3a8a
          );
          box-shadow: 0 0 10px rgba(129, 140, 248, 0.8);
        }

        .faq-icon.open {
          background: radial-gradient(
            120% 180% at 0% 0%,
            #22c55e,
            #15803d
          );
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          padding: 0 18px;
          transition: max-height 0.25s ease, padding-bottom 0.25s ease;
        }

        .faq-answer.open {
          max-height: 220px;
          padding-bottom: 14px;
        }

        .faq-answer p {
          margin: 4px 0 0;
          font-size: 13px;
          line-height: 1.6;
          color: #e5e7eb;
        }

        @media (max-width: 768px) {
          .faq-question {
            padding: 12px 14px;
            font-size: 13px;
          }
          .faq-answer {
            padding: 0 14px;
          }
          .faq-answer.open {
            padding-bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
}
