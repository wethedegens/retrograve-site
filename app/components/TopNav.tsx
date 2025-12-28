// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export type TopNavProject = "retrograve" | "magapixel" | "miners" | "gainz";

type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

function isActive(pathname: string, href: string) {
  // exact for home
  if (href === "/") return pathname === "/";
  // starts-with for other internal routes
  return pathname === href || pathname.startsWith(href + "/");
}

function getLinks(project: TopNavProject): NavItem[] {
  // Update external URLs anytime you want; internal routes here match your app folder routes.
  switch (project) {
    case "magapixel":
      return [
        { label: "HOME", href: "/" },
        { label: "MY MAGAPIXELS", href: "/magapixel-nfts" },
        { label: "COMMUNITY", href: "/community" },
        { label: "COLLECT NOW", href: "https://magiceden.io", external: true },
        { label: "FOLLOW ON X", href: "https://x.com", external: true },
      ];

    case "miners":
      return [
        { label: "HOME", href: "/enchanted-miners" },
        { label: "MY MINERS", href: "/my-miners" },
        { label: "COMMUNITY", href: "/community" },
        { label: "COLLECT NOW", href: "https://magiceden.io", external: true },
        { label: "FOLLOW ON X", href: "https://x.com", external: true },
      ];

    case "gainz":
      return [
        { label: "HOME", href: "/gainz" },
        { label: "COMMUNITY", href: "/community" },
        { label: "COLLECT NOW", href: "https://magiceden.io", external: true },
        { label: "FOLLOW ON X", href: "https://x.com", external: true },
      ];

    case "retrograve":
    default:
      return [
        { label: "HOME", href: "/" },
        { label: "MY RETROGRAVES", href: "/my-retrograves" },
        { label: "COMMUNITY", href: "/community" },
        { label: "COLLECT NOW", href: "https://magiceden.io", external: true },
        { label: "FOLLOW ON X", href: "https://x.com", external: true },
      ];
  }
}

export default function TopNav({ project }: { project: TopNavProject }) {
  const pathname = usePathname() || "/";
  const links = getLinks(project);

  return (
    <header className="topnav">
      <div className="inner">
        {/* LEFT SPACER (keeps center truly centered) */}
        <div className="left" aria-hidden="true" />

        {/* CENTER LINKS */}
        <nav className="center" aria-label="Primary navigation">
          {links.map((l) => {
            const active = !l.external && isActive(pathname, l.href);
            const cls = `navlink ${active ? "active" : ""}`;

            if (l.external) {
              return (
                <a
                  key={`${l.label}-${l.href}`}
                  className={cls}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label}
                </a>
              );
            }

            return (
              <Link key={`${l.label}-${l.href}`} className={cls} href={l.href}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: WALLET + LOGO */}
        <div className="right">
          <div className="walletWrap">
            <WalletMultiButton />
          </div>

          <Link className="logoLink" href="/" aria-label="LockScreened home">
            <img
              src="/lockscreened-logo.png"
              alt="LockScreened logo"
              className="logoImg"
              draggable={false}
            />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .topnav {
          position: sticky;
          top: 0;
          z-index: 9999;
          width: 100%;
          background: rgba(10, 8, 20, 0.78);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 14px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
        }

        .left {
          height: 1px;
        }

        .center {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        /* ✅ HARD OVERRIDES so global link styles never turn them blue/underlined */
        .navlink {
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 800;

          color: #ffffff !important;
          text-decoration: none !important;

          opacity: 0.92;
          transition: opacity 0.12s ease, transform 0.12s ease;
        }

        .navlink:visited {
          color: #ffffff !important;
          text-decoration: none !important;
        }

        .navlink:hover {
          opacity: 1;
          text-decoration: none !important;
        }

        .navlink.active {
          color: #ffffff !important;
          text-decoration: none !important;
          opacity: 1;
        }

        .right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
        }

        .walletWrap :global(button) {
          filter: none !important;
          backdrop-filter: none !important;
        }

        .logoLink {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
        }

        .logoImg {
          width: 30px;
          height: 30px;
          object-fit: contain;
          display: block;
          opacity: 1;
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.45));
        }

        @media (max-width: 900px) {
          .inner {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .center {
            order: 2;
            gap: 14px;
          }
          .right {
            order: 1;
            justify-content: space-between;
          }
          .left {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
