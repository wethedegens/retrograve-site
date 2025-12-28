// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  const NavLink = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`nav-link ${active ? "active" : ""}`}>
        {label}
      </Link>
    );
  };

  return (
    <header className="topnav">
      <div className="inner">
        <div className="left">
          <NavLink href="/" label="HOME" />
          <NavLink href="/my-retrograves" label="MY RETROGRAVES" />
          <NavLink href="/community" label="COMMUNITY" />
          <a
            className="nav-link"
            href="https://magiceden.io/"
            target="_blank"
            rel="noreferrer"
          >
            COLLECT NOW
          </a>
          <a
            className="nav-link"
            href="https://x.com/"
            target="_blank"
            rel="noreferrer"
          >
            FOLLOW ON X
          </a>
        </div>

        <div className="right">
          {/* ✅ keep your wallet button slot (whatever wraps it elsewhere) */}
          <div className="wallet-slot" />

          {/* ✅ restore the top-right logo */}
          <Link href="/" className="logo-link" aria-label="LockScreened Home">
            <img src="/lockscreened-logo.png" alt="LockScreened" className="logo" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .topnav {
          position: sticky;
          top: 0;
          z-index: 999;
          background: rgba(10, 8, 18, 0.78);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .nav-link {
          font-size: 12px;
          letter-spacing: 1px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.82);
          padding: 6px 8px;
          border-radius: 999px;
        }

        .nav-link:hover {
          color: rgba(255, 255, 255, 1);
          background: rgba(255, 255, 255, 0.06);
        }

        .nav-link.active {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.95);
        }

        .right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wallet-slot {
          /* If your wallet button is injected elsewhere, keep this.
             If you render it here, replace wallet-slot with your wallet component. */
          display: flex;
          align-items: center;
        }

        .logo-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .logo {
          width: 22px;
          height: 22px;
          object-fit: contain;
          display: block;
        }

        @media (max-width: 820px) {
          .left {
            gap: 10px;
          }
          .nav-link {
            font-size: 11px;
            padding: 5px 7px;
          }
        }
      `}</style>
    </header>
  );
}
