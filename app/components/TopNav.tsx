// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const path = usePathname();

  // Identify project sections
  const isMiners =
    path.startsWith("/enchanted-miners") || path.startsWith("/my-miners");

  const isMagapixel =
    path.startsWith("/locker/magapixel") ||
    path.startsWith("/magapixel-nfts") ||
    path.startsWith("/retrogs");

  const isRetrograve = path.startsWith("/retrograve");

  // ---------- 1. ENCHANTED MINERS NAV ----------
  if (isMiners) {
    return (
      <nav className="topnav">
        <Link href="/">HOME</Link>
        <Link href="/my-miners">MY MINERS</Link>

        <a
          href="https://discord.gg/C5MfNP7hek"
          target="_blank"
          rel="noopener noreferrer"
        >
          COMMUNITY
        </a>

        <a
          href="https://magiceden.us/marketplace/enchanted_miner"
          target="_blank"
          rel="noopener noreferrer"
        >
          COLLECT NOW
        </a>

        <a
          href="https://x.com/enchanted_nfts"
          target="_blank"
          rel="noopener noreferrer"
        >
          FOLLOW ON X
        </a>

        <style jsx>{modernNavStyle}</style>
      </nav>
    );
  }

  // ---------- 2. MAGAPIXEL NAV ----------
  if (isMagapixel) {
    return (
      <nav className="topnav">
        {/* Home goes to RetroGrave homepage */}
        <Link href="/">HOME</Link>

        <Link href="/magapixel-nfts">MY MAGAPIXELS</Link>

        <a
          href="https://discord.gg/ZVGtHUpHfb"
          target="_blank"
          rel="noopener noreferrer"
        >
          COMMUNITY
        </a>

        <a
          href="https://magiceden.us/marketplace/magapixel"
          target="_blank"
          rel="noopener noreferrer"
        >
          COLLECT NOW
        </a>

        <a
          href="https://x.com/MAGApixel_NFT"
          target="_blank"
          rel="noopener noreferrer"
        >
          FOLLOW ON X
        </a>

        <style jsx>{modernNavStyle}</style>
      </nav>
    );
  }

  // ---------- 3. DEFAULT RETROGRAVE NAV ----------
  return (
    <nav className="topnav">
      <Link href="/">HOME</Link>

      <Link href="/retrograve">MY RETROGRAVES</Link>

      <a
        href="https://discord.gg/mSNHRFdCkS"
        target="_blank"
        rel="noopener noreferrer"
      >
        COMMUNITY
      </a>

      <a
        href="https://magiceden.io"
        target="_blank"
        rel="noopener noreferrer"
      >
        COLLECT NOW
      </a>

      <a
        href="https://x.com/RETROGRAVE_NFT"
        target="_blank"
        rel="noopener noreferrer"
      >
        FOLLOW ON X
      </a>

      <style jsx>{modernNavStyle}</style>
    </nav>
  );
}

/* ===========================================================
   ⭐ Modern White Navigation Styles (override old retro look)
=========================================================== */
const modernNavStyle = `
  .topnav {
    display: flex;
    gap: 28px;
    justify-content: center;
    margin-top: 22px;
    padding-bottom: 8px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter",
      "Segoe UI", sans-serif !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    letter-spacing: 0.01em !important;
  }

  .topnav :global(a),
  .topnav a {
    text-decoration: none !important;
    color: #ffffff !important;
    opacity: 0.9 !important;
    text-shadow: none !important;
    text-transform: none !important;
    transition: opacity 0.2s ease, transform 0.2s ease !important;
  }

  .topnav :global(a:hover),
  .topnav a:hover {
    opacity: 1 !important;
    transform: translateY(-1px) !important;
  }

  @media (max-width: 480px) {
    .topnav {
      gap: 16px;
      font-size: 13px !important;
    }
  }
`;
