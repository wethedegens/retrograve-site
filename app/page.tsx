'use client';

import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function HomePage() {
  return (
    <main className="home-wrapper">

      {/* ===========================
          TOP HEADER: LOGO + WALLET
      ============================ */}
      <header className="ls-header">
        <div className="ls-header-inner">

          {/* LEFT — LOGO */}
          <div className="ls-logo">
            <Image
              src="/lockscreened-logo.png"   // <-- place logo into /public
              alt="LockScreened Logo"
              width={160}
              height={48}
              className="ls-logo-img"
            />
          </div>

          {/* RIGHT — WALLET BUTTON */}
          <div className="ls-wallet">
            <WalletMultiButton />
          </div>

        </div>
      </header>

      {/* ===================================
          EVERYTHING ELSE ON YOUR HOMEPAGE
      ==================================== */}

      <section className="hero">
        {/* your Lockscreened title, subtitle, partner cards, etc */}
      </section>

      <style jsx>{`
        .home-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* HEADER AREA */
        .ls-header {
          width: 100%;
          padding: 24px 32px;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          display: flex;
          justify-content: center;
          pointer-events: none; /* allows wallet UI dropdown to sit above */
        }

        .ls-header-inner {
          width: 100%;
          max-width: 1600px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: auto;
        }

        /* LOGO */
        .ls-logo-img {
          width: auto;
          height: 40px;
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(200,150,255,0.45));
        }

        /* WALLET BUTTON */
        .ls-wallet :global(.wallet-adapter-button) {
          background: #7a3cff !important;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s ease;
        }

        .ls-wallet :global(.wallet-adapter-button:hover) {
          opacity: 0.8;
        }

        /* Push hero down so it doesn’t hide under header */
        .hero {
          margin-top: 130px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </main>
  );
}
