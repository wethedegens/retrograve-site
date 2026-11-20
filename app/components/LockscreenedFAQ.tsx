// app/components/LockscreenedFAQ.tsx
"use client";

import { useState } from "react";

export type FAQItem = {
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
      "Browsing projects and making wallpapers in the current live lockers is free for eligible holders.",
  },
  {
    question: "Do I need to connect my wallet?",
    answer:
      "You only need to connect a wallet when you want to unlock holder-only features in a partner locker (like seeing your NFTs or accessing holder-only backgrounds). You can still read about projects without connecting.",
  },
  {
    question: "Is connecting my wallet safe?",
    answer:
      "LockScreened checks which NFTs you own. Studio lockers may ask you to sign an off-chain login message; they do not ask for an NFT transfer, token approval, seed phrase, or private key. Check that you are on the official LockScreened site before connecting.",
  },
  {
    question: "Which wallets are supported?",
    answer:
      "Phantom is supported for Solana collections. On a phone, open LockScreened inside Phantom’s browser to connect and sign in.",
  },
  {
    question: "What happens to my NFTs when I use the locker?",
    answer:
      "Nothing is moved or changed on-chain. We simply read which NFTs you hold from a partner collection so we can display them in the locker and render wallpapers around them.",
  },
  {
    question: "Can I upload my own backgrounds?",
    answer:
      "Background options depend on the project. Studio lockers offer your selected NFT’s original background and any extra backgrounds provided by its creator. Some legacy lockers also support personal image uploads.",
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
    question: "What should I check if a locker is not working?",
    answer:
      "Check that you are using the wallet that holds the NFT, then reopen the locker. If the issue is with your wallet app, use your wallet provider's official support. Keep your recovery phrase and private key to yourself.",
  },
];

export default function LockscreenedFAQ() {
  return <FaqAccordion title="FAQ" items={FAQ_ITEMS} initiallyOpen={0} />;
}

export function FaqAccordion({
  title,
  items,
  initiallyOpen = null,
}: {
  title: string;
  items: readonly FAQItem[];
  initiallyOpen?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(initiallyOpen);

  return (
    <div className="faq-wrap">
      <h2 className="faq-title">{title}</h2>

      <div className="faq-list">
        {items.map((item, index) => {
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
                <span aria-hidden="true" className={`faq-icon ${isOpen ? "open" : ""}`}>
                  {isOpen ? "–" : "+"}
                </span>
              </button>

              <div aria-hidden={!isOpen} className={`faq-answer ${isOpen ? "open" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .faq-wrap {
          width: 100%;
          max-width: 1000px;
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
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Less transparent, more readable card */
        .faq-item {
          border-radius: 14px;
          background: rgba(10, 10, 18, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 14px 30px rgba(0, 0, 0, 0.85),
            0 0 0 1px rgba(120, 90, 200, 0.18);
          overflow: hidden;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.25s ease, border-color 0.25s ease,
            box-shadow 0.25s ease, transform 0.2s ease;
        }

        .faq-item:hover {
          background: rgba(10, 10, 22, 0.92);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow:
            0 18px 36px rgba(0, 0, 0, 0.95),
            0 0 24px rgba(183, 122, 255, 0.5);
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
          color: #ffffff;
          text-align: left;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
        }

        .faq-icon {
          font-family: "VT323", monospace;
          font-size: 20px;
          width: 28px;
          flex: 0 0 28px;
          margin-left: 10px;
          text-align: center;
          border-radius: 999px;
          border: 1px solid rgba(230, 210, 255, 0.6);
          background: radial-gradient(
            120% 180% at 0% 0%,
            rgba(183, 122, 255, 0.7),
            rgba(40, 10, 70, 0.9)
          );
          box-shadow: 0 0 12px rgba(183, 122, 255, 0.85);
        }

        .faq-icon.open {
          background: radial-gradient(
            120% 180% at 0% 0%,
            rgba(118, 213, 255, 0.8),
            rgba(20, 40, 90, 0.95)
          );
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
          color: #e6dcff;
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
