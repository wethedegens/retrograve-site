// app/enchanted-miners/page.tsx
"use client";

import FAQ from "../components/FAQ";

export default function EnchantedMinersPage() {
  return (
    <main className="miners-wrapper">
      <section className="intro">
        <h1 className="miners-title">
          ENCHANTED MINERS LOCKSCREEN LOCKER
        </h1>
        <p className="miners-sub">
          Download your Enchanted Miners NFT with a perfectly tuned background—
          sized for any phone.
        </p>
      </section>

      <FAQ />

      <style jsx>{`
        .miners-wrapper {
          padding-bottom: 80px;
        }

        .intro {
          text-align: center;
          margin-top: 40px;
        }

        .miners-title {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          color: #ff80b5;
        }

        .miners-sub {
          font-size: 15px;
          opacity: 0.8;
          margin-bottom: 32px;
        }

        @media (max-width: 520px) {
          .miners-title {
            font-size: 30px;
          }
        }
      `}</style>
    </main>
  );
}
