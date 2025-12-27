// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const DISCORD_INVITE = "https://discord.gg/mSNHRFdCkS";

type NavProject = "miners" | "magapixel" | "retrograve";

type NavLink =
  | { type: "link"; label: string; href: string }
  | { type: "a"; label: string; href: string };

function FixedBar({
  links,
}: {
  links: NavLink[];
}) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 64,
        zIndex: 50,
        backgroundColor: "rgb(11, 11, 15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "0 14px",
      }}
      aria-label="Top navigation"
    >
      {/* left wallet */}
      <div style={{ position: "absolute", left: 12, top: 12 }}>
        <WalletMultiButton />
      </div>

      {/* center links */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {links.map((l) => {
          if (l.type === "a") {
            return (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={navLinkStyle}
              >
                {l.label}
              </a>
            );
          }
          return (
            <Link key={l.label} href={l.href} style={navLinkStyle}>
              {l.label}
            </Link>
          );
        })}
      </div>

      {/* right wallet (optional mirror; comment out if you only want left) */}
      <div style={{ position: "absolute", right: 12, top: 12 }}>
        <WalletMultiButton />
      </div>
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontFamily: "VT323, monospace",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontSize: 20,
  color: "#ffffff",
  textDecoration: "none",
  textShadow:
    "0 0 10px rgba(183, 122, 255, 0.8), 0 0 20px rgba(183, 122, 255, 0.5)",
  opacity: 0.95,
};

export default function TopNav({ project }: { project: NavProject }) {
  // ✅ INTERNAL LINK (this is the key fix)
  const internal =
    project === "miners"
      ? { type: "link" as const, label: "MY MINERS", href: "/my-miners" }
      : project === "magapixel"
      ? {
          type: "link" as const,
          label: "MY MAGAPIXELS",
          href: "/magapixel-nfts",
        }
      : {
          type: "link" as const,
          label: "MY RETROGRAVES",
          href: "/retrogs",
        };

  // ✅ EXTERNALS stay consistent across the whole site
  const links: NavLink[] = [
    { type: "link", label: "HOME", href: "/" },
    internal,
    { type: "a", label: "COMMUNITY", href: DISCORD_INVITE },
    { type: "link", label: "COLLECT NOW", href: "/collect" },
    { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
  ];

  // Add a spacer so content doesn't hide under fixed nav
  return (
    <>
      <FixedBar links={links} />
      <div style={{ height: 64 }} />
    </>
  );
}
