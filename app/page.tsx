// app/page.tsx
import Link from "next/link";
import Image from "next/image";

type PartnerProject = {
  name: string;
  status: "Live" | "Coming soon";
  description: string;
  href: string;
  image: string; // phone preview image
  accent?: string;
};

const partnerProjects: PartnerProject[] = [
  {
    name: "MAGApixel Locker",
    status: "Live",
    description: "Pixel-perfect Trump memes, sized for every phone.",
    href: "/magapixel",
    image: "/phones/magapixel-phone.png", // ⬅ change to your real path
    accent: "#ff6b81",
  },
  {
    name: "RetroGrave Locker",
    status: "Live",
    description: "TV-glow pixel undead. RetroGrave holders only.",
    href: "/retrograve",
    image: "/phones/retrograve-phone.png", // ⬅ change to your real path
    accent: "#f7b731",
  },
  {
    name: "MEOWGA Locker",
    status: "Coming soon",
    description: "Patriotic cat chaos. Releasing soon on LockScreened.",
    href: "/meowga",
    image: "/phones/meowga-phone.png", // ⬅ change to your real path
    accent: "#8854d0",
  },
  {
    name: "Enchanted Miners",
    status: "Live",
    description: "Fantasy miners, perfectly framed for your screen.",
    href: "/enchantedminers",
    image: "/phones/enchanted-miners-phone.png", // ⬅ change to your real path
    accent: "#20bf6b",
  },
  {
    name: "Client Project #1",
    status: "Coming soon",
    description: "First external partner project on LockScreened.",
    href: "/client-1",
    image: "/phones/client-1-phone.png", // ⬅ change to your real path
    accent: "#0fb9b1",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7dfd7", // soft, simple background
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
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

          {/* WHAT IS LOCKSCREENED CARD */}
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

        {/* PARTNER LOCKERS WITH PHONE LAYOUTS */}
        <section id="partners" style={{ marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 24,
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
              MORE PARTNERS COMING SOON
            </p>
          </div>

          {/* phone-style cards */}
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
                  gap: 14,
                  padding: 16,
                  borderRadius: 24,
                  backgroundColor: "#fff7f3",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow:
                    "0 10px 26px rgba(15, 15, 15, 0.05), 0 1px 0 rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  color: "#111",
                }}
              >
                {/* status badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {project.name}
                  </span>
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
                      color: project.status === "Live" ? "#fff" : "#555",
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {/* PHONE PREVIEW */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 4,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 220,
                      borderRadius: 30,
                      padding: 6,
                      backgroundColor: "#111",
                      boxShadow:
                        "0 12px 24px rgba(15, 15, 15, 0.35), 0 0 0 1px rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        borderRadius: 24,
                        overflow: "hidden",
                        backgroundColor: "#000",
                      }}
                    >
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        sizes="120px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION + CTA */}
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(0,0,0,0.7)",
                    lineHeight: 1.5,
                    minHeight: 40,
                  }}
                >
                  {project.description}
                </p>

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
                    }}
                  >
                    ↗
                  </span>
                </div>

                {/* subtle accent bar at bottom */}
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
