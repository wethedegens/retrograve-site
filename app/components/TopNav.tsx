// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const path = usePathname();

  // Treat BOTH /enchanted-miners/* and /my-miners as Enchanted Miners pages
  const isMiners =
    path.startsWith("/enchanted-miners") || path.startsWith("/my-miners");

  // MAGApixel pages
  const isMagapixel =
    path.startsWith("/locker/magapixel") ||
    path.startsWith("/magapixel-nfts") ||
    path.startsWith("/retrogs");

  // Retrograve pages
  const isRetrograve = path.startsWith("/retrograve");

  /* ---------------------------------------------------------
     1) ENCHANTED MINERS NAV (UPDATED FOR YOUR NEW STYLE)
  --------------------------------------------------------- */
  if (isMiners) {
    const active = (href: string) => (path === href ? "active" : "");

    return (
      <nav className="topnav miners-nav">
        <Link href="/" className={active("/")}>
          HOME
        </Link>

        <Link href="/my-miners" className={active("/my-miners")}>
          MY MINERS
        </Link>

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

        <style jsx>{`
          .topnav {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 24px;
            font-family: "Inter", sans-serif;
            font-weight: 600;
          }

          /* 25% bigger text */
          .miners-nav a {
            font-size: 18px;
            color: #222; /* subtle black/grey */
            text-decoration: none;
            opacity: 0.9;
            transition: opacity 0.2s ease, text-decoration 0.2s ease;
          }

          /* Hover effect (still clean) */
          .miners-nav a:hover {
            opacity: 1;
          }

          /* Active tab only → underline */
          .miners-nav a.active {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
            opacity: 1;
          }

          @media (max-width: 480px) {
            .miners-nav a {
              font-size: 15px; /* scale down on phone */
            }
          }
        `}</style>
      </nav>
    );
  }

  /* ---------------------------------------------------------
     2) MAGAPIXEL NAV (unchanged)
  --------------------------------------------------------- */
  if (isMagapixel) {
    return (
      <nav className="topnav">
        <Link href="/locker/magapixel">HOME</Link>
        <Link href="/magapixel-nfts">MY MAGAPIXELS</Link>
        <a href="https://discord.gg/ZVGtHUpHfb" target="_blank">COMMUNITY</a>
        <a
          href="https://magiceden.us/marketplace/magapixel"
          target="_blank"
        >
          COLLECT NOW
        </a>
        <a href="https://x.com/MAGApixel_NFT" target="_blank">FOLLOW ON X</a>

        <style jsx>{`
          .topnav {
            display: flex;
            gap: 24px;
            font-family: "VT323", monospace;
            font-size: 15px;
            letter-spacing: 0.08em;
            justify-content: center;
            margin-top: 22px;
          }
          a {
            color: #fff;
            text-shadow: 0 0 6px rgba(240, 75, 131, 0.75);
            text-decoration: none;
          }
          a:hover {
            opacity: 0.7;
          }
        `}</style>
      </nav>
    );
  }

  /* ---------------------------------------------------------
     3) RETROGRAVE NAV (unchanged)
  --------------------------------------------------------- */
  return (
    <nav className="topnav">
      <Link href="/">HOME</Link>
      <Link href="/retrograve">MY RETROGRAVES</Link>
      <a href="https://discord.gg/mSNHRFdCkS" target="_blank">COMMUNITY</a>
      <a href="https://magiceden.io" target="_blank">COLLECT NOW</a>
      <a href="https://x.com/RETROGRAVE_NFT" target="_blank">FOLLOW ON X</a>

      <style jsx>{`
        .topnav {
          display: flex;
          gap: 24px;
          font-family: "VT323", monospace;
          font-size: 15px;
          justify-content: center;
          margin-top: 22px;
        }
        a {
          color: #fff;
          text-shadow: 0 0 6px rgba(183, 122, 255, 0.75);
          text-decoration: none;
        }
        a:hover {
          opacity: 0.7;
        }
      `}</style>
    </nav>
  );
}
