// app/studio/page.tsx
import StudioWalletAuth from "../components/studio/StudioWalletAuth";
import StudioCollectionClaim from "../components/studio/StudioCollectionClaim";
import StudioMyProjects from "../components/studio/StudioMyProjects";
import StudioPreMintProject from "../components/studio/StudioPreMintProject";
import styles from "./studio.module.css";

export const dynamic = "force-dynamic";

export default function CreatorStudioPage() {
  return (
    <main className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.scrim} />

      <div className={styles.wrap}>
        <div className={styles.brandBar}>
          <a href="/" className={styles.wordmarkLink} aria-label="LockScreened home">
            <img src="/lockscreened-wordmark-1.png" alt="LockScreened" className={styles.wordmark} />
          </a>
          <div className={styles.brandMeta}>
            <span>CREATOR STUDIO</span>
            <strong>FOUNDER PORTAL</strong>
          </div>
        </div>

        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>LOCKSCREENED CREATOR STUDIO</p>
            <h1 className={styles.title}>
              Build your Locker
              <span>NO CODE. YOUR ART. YOUR COLLECTION.</span>
            </h1>
            <p className={styles.lede}>
              Start with a live collection or build privately before mint. LockScreened
              guides you from artwork to a collector-ready phone, tablet and desktop experience.
            </p>
          </div>
          <div className={styles.heroBadge}>FOUNDER STUDIO</div>
        </header>

        <section style={journeyPanel}>
          <div style={journeyEyebrow}>HOW IT WORKS</div>
          <div style={journeyGrid}>
            <JourneyStep n="1" title="Start a project" copy="Choose live collection or pre-mint." />
            <JourneyStep n="2" title="Add your artwork" copy="Layered traits or finished NFT images." />
            <JourneyStep n="3" title="Build your Locker" copy="Backgrounds, layout and project details." />
            <JourneyStep n="4" title="Preview" copy="See the collector experience before launch." />
            <JourneyStep n="5" title="Publish" copy="Go live only after authority and readiness checks pass." />
          </div>
        </section>

        <StudioWalletAuth />
        <StudioMyProjects />

        <section style={startPanel}>
          <div style={journeyEyebrow}>START A NEW PROJECT</div>
          <h2 style={{ margin: "6px 0 5px", fontSize: 24 }}>Where are you right now?</h2>
          <p style={startCopy}>Choose the path that matches your collection. You can attach a pre-mint project to the real collection later without rebuilding your work.</p>
          <div style={choiceGrid}>
            <a href="#claim-live" style={choiceCard}>
              <span style={choiceKicker}>COLLECTION IS LIVE</span>
              <strong style={choiceTitle}>I already have a collection</strong>
              <span style={choiceCopy}>Verify current Solana collection authority, then open your private project workspace.</span>
              <b style={choiceAction}>VERIFY COLLECTION →</b>
            </a>
            <a href="#premint" style={choiceCard}>
              <span style={choiceKicker}>PRE-MINT / UPCOMING</span>
              <strong style={choiceTitle}>I&apos;m still building my collection</strong>
              <span style={choiceCopy}>Start privately with your layered traits or finished artwork. Nothing publishes before you attach and verify the real collection.</span>
              <b style={choiceAction}>START PRIVATE PROJECT →</b>
            </a>
          </div>
        </section>

        <StudioCollectionClaim />
        <StudioPreMintProject />

        <p className={styles.note}>
          LOCKSCREENED CREATOR STUDIO · PRIVATE SOURCE ART STAYS PROTECTED · PUBLISHING REQUIRES VERIFIED COLLECTION AUTHORITY
        </p>
      </div>
    </main>
  );
}

function JourneyStep({ n, title, copy }: { n: string; title: string; copy: string }) {
  return <div style={journeyStep}><span style={journeyNum}>{n}</span><div><strong style={{ display: "block", fontSize: 11 }}>{title}</strong><span style={journeyCopy}>{copy}</span></div></div>;
}

const journeyPanel = { marginBottom: 18, borderRadius: 20, padding: 16, border: "1px solid rgba(255,255,255,.09)", background: "rgba(10,8,20,.62)" } as const;
const journeyEyebrow = { color: "#ff8dce", fontSize: 9, fontWeight: 900, letterSpacing: ".17em" } as const;
const journeyGrid = { marginTop: 11, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 8 } as const;
const journeyStep = { minHeight: 68, borderRadius: 13, padding: 10, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", display: "flex", gap: 9, alignItems: "flex-start" } as const;
const journeyNum = { width: 26, height: 26, borderRadius: 999, display: "grid", placeItems: "center", flex: "0 0 auto", background: "rgba(255,63,180,.12)", color: "#ff9bd8", fontSize: 9, fontWeight: 900 } as const;
const journeyCopy = { display: "block", marginTop: 3, color: "rgba(255,255,255,.48)", fontSize: 9, lineHeight: 1.4 } as const;
const startPanel = { marginBottom: 24, borderRadius: 22, padding: 20, border: "1px solid rgba(255,99,194,.15)", background: "linear-gradient(135deg,rgba(15,10,29,.8),rgba(9,8,18,.7))" } as const;
const startCopy = { margin: 0, maxWidth: 760, color: "rgba(255,255,255,.58)", fontSize: 11, lineHeight: 1.55 } as const;
const choiceGrid = { marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 } as const;
const choiceCard = { borderRadius: 17, padding: 16, border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.025)", color: "#fff", textDecoration: "none", display: "grid", gap: 7 } as const;
const choiceKicker = { color: "#a9ffd2", fontSize: 8, fontWeight: 900, letterSpacing: ".13em" } as const;
const choiceTitle = { fontSize: 16 } as const;
const choiceCopy = { color: "rgba(255,255,255,.53)", fontSize: 10, lineHeight: 1.5 } as const;
const choiceAction = { marginTop: 3, color: "#ff9bd8", fontSize: 9, letterSpacing: ".08em" } as const;
