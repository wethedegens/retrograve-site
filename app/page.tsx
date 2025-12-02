// app/page.tsx
import Link from "next/link";

type PartnerProject = {
  name: string;
  status: "Live" | "Coming soon";
  description: string;
  href: string;
  accent?: string;
};

const partnerProjects: PartnerProject[] = [
  {
    name: "MAGApixel Locker",
    status: "Live",
    description: "Pixel-perfect Trump memes, sized for every phone.",
    href: "/magapixel",
    accent: "#ff6b81",
  },
  {
    name: "RetroGrave Locker",
    status: "Live",
    description: "TV-glow pixel undead. RetroGrave holders only.",
    href: "/retrograve",
    accent: "#f7b731",
  },
  {
    name: "MEOWGA Locker",
    status: "Coming soon",
    description: "Patriotic cat chaos. Releasing soon on LockScreened.",
    href: "/meowga",
    accent: "#8854d0",
  },
  {
    name: "Enchanted Miners",
    status: "Live",
    description: "Fantasy miners, perfectly framed for your screen.",
    href: "/enchantedminers",
    accent: "#20bf6b",
  },
  {
    name: "Client Project #1",
    status: "Coming soon",
    description: "First external partner project on LockScreened.",
    href: "/client-1",
    accent: "#0fb9b1",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7dfd7", // soft peachy background like chads.gg
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "32px 16px 80px",
        }}
      >
        {/* HERO */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 13,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.5)",
                marginBottom: 12,
              }}
            >
              MULTI-PROJECT LOCK SCREEN TOOLKIT
            </p>
            <h1
              style={{
                fontSize: 40,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#1e1e1e",
                marginBottom: 16,
              }}
            >
              LockScreened turns NFTs into
              <span style={{ display: "block" }}>pixel-perfect wallpapers.</span>
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: "rgba(15,15,15,0.75)",
                maxWidth: 520,
                marginBottom: 24,
              }}
            >
              A simple, holder-first toolkit for NFT projects. No cropping,
              no guessing—just clean, ready-to-save wallpapers for phones,
              tablets, and desktops.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="#partners"
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  backgroundColor: "#111",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                View partner projects
              </Link>
              <Link
                href="/how-it-works"
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  color: "#222",
                  textDecoration: "none",
                }}
              >
                Learn how it works
              </Link>
            </div>
          </div>

          {/* Simple hero card instead of neon waves */}
          <div>
            <div
              style={{
                borderRadius: 24,
                padding: 20,
                backgroundColor: "#fef4f0",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow:
                  "0 18px 40px rgba(15, 15, 15, 0.06), 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.19em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.45)",
                  marginBottom: 10,
                }}
              >
                WHAT IS LOCKSCREENED?
              </p>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "rgba(0,0,0,0.8)",
                  marginBottom: 14,
                }}
              >
                LockScreened is a white-label locker experience. Each partner
                project gets:
              </p>
              <ul
                style={{
                  paddingLeft: 18,
                  margin: "0 0 12px",
                  fontSize: 14,
                  color: "rgba(0,0,0,0.8)",
                  lineHeight: 1.6,
                }}
              >
                <li>A dedicated /project page under the LockScreened umbrella</li>
                <li>Wallet-gated trait &amp; background swapping</li>
                <li>One-tap exports for phone &amp; desktop</li>
              </ul>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(0,0,0,0.55)",
                }}
              >
                Designed to be simple for holders and flexible for project
                teams.
              </p>
            </div>
          </div>
        </section>

        {/* PARTNER PROJECTS */}
        <section id="partners" style={{ marginTop: 48 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 24,
                  letterSpacing: "-0.02em",
                  color: "#1f1f1f",
                  marginBottom: 4,
                }}
              >
                Partner projects
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(0,0,0,0.6)",
                }}
              >
                Each project has its own “locker” where holders can load their
                NFTs and export wallpapers.
              </p>
            </div>
            <p
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(0,0,0,0.45)",
                whiteSpace: "nowrap",
              }}
            >
              More partners coming soon
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 20,
            }}
          >
            {partnerProjects.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 18,
                  borderRadius: 20,
                  backgroundColor: "#fff7f3",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow:
                    "0 10px 26px rgba(15, 15, 15, 0.05), 0 1px 0 rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  color: "#111",
                  overflow: "hidden",
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 16,
                        letterSpacing: "-0.01em",
                        margin: 0,
                      }}
                    >
                      {project.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        padding: "4px 8px",
                        borderRadius: 999,
                        border:
                          project.status === "Live"
                            ? "none"
                            : "1px solid rgba(0,0,0,0.18)",
                        backgroundColor:
                          project.status === "Live"
                            ? "#111"
                            : "rgba(255,255,255,0.6)",
                        color:
                          project.status === "Live" ? "#fff" : "#555",
                      }}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(0,0,0,0.7)",
                      lineHeight: 1.5,
                    }}
                  >
                    {project.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "auto",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(0,0,0,0.6)",
                    }}
                  >
                    Open locker
                  </span>
                  <span
                    aria-hidden
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.12)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      transform: "translateX(0)",
                    }}
                  >
                    ↗
                  </span>
                </div>

                {/* subtle accent bar */}
                <div
                  style={{
                    position: "absolute",
                    insetInline: 0,
                    bottom: 0,
                    height: 3,
                    backgroundColor: project.accent || "#f3a683",
                    opacity: 0.9,
                  }}
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
