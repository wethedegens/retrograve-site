// app/studio/page.tsx
import StudioTraitImporter from "../components/studio/StudioTraitImporter";
import StudioBackgroundBuilder from "../components/studio/StudioBackgroundBuilder";
import StudioCostGuardrails from "../components/studio/StudioCostGuardrails";
import { FLAGSHIP_PROJECTS } from "../lib/lockscreened/flagshipProjects";
import styles from "./studio.module.css";

export const dynamic = "force-dynamic";

const PREVIEWS: Record<string, string> = {
  retrograve: "/lockscreened-previews/retrograve.png",
  gainz: "/lockscreened-previews/gainz.png",
  midevils: "/lockscreened-previews/midevils.png",
  "enchanted-miners": "/lockscreened-previews/miners.png",
  "doge-miners": "/lockscreened-previews/doge-miners.png",
  zeromonkebiz: "/lockscreened-previews/zeromonkebiz-1.png",
  sagamonkes: "/lockscreened-previews/saga-monkes.png",
  magapixel: "/lockscreened-previews/magapixel.png",
  meowga: "/lockscreened-previews/meowga.png",
};

function sourceLabel(kind: string) {
  if (kind === "solana_collection") return "Solana collection";
  if (kind === "doge_inscription") return "Doge inscription";
  if (kind === "uploaded_art") return "Uploaded art";
  return "Demo / pre-mint";
}

function renderLabel(mode: string) {
  if (mode === "layered_traits") return "Layered trait reconstruction";
  if (mode === "curated_composite") return "Curated composite";
  if (mode === "remote_image") return "Remote NFT image";
  return "Automatic background extension";
}

export default function CreatorStudioPage() {
  const sourceModes = new Set(
    FLAGSHIP_PROJECTS.map((project) => project.source.kind)
  ).size;

  const renderModes = new Set(
    FLAGSHIP_PROJECTS.map((project) => project.render.mode)
  ).size;

  return (
    <main className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.scrim} />

      <div className={styles.wrap}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>LOCKSCREENED CREATOR PORTAL · ALPHA</p>
            <h1 className={styles.title}>
              Studio
              <span>BUILD THE LOCKER, NOT THE CODE</span>
            </h1>
            <p className={styles.lede}>
              Claim a collection, bring the original trait artwork, add official
              backgrounds and let LockScreened reconstruct each holder&apos;s NFT
              for phones, tablets and desktops — without changing anything
              on-chain.
            </p>
          </div>
          <div className={styles.heroBadge}>FOUNDATION ONLINE</div>
        </header>

        <section className={styles.quickGrid}>
          <div className={styles.quickCard}>
            <span>FLAGSHIP PROJECTS</span>
            <strong>{FLAGSHIP_PROJECTS.length}</strong>
            <small>Existing experiences protected</small>
          </div>
          <div className={styles.quickCard}>
            <span>NFT SOURCE TYPES</span>
            <strong>{sourceModes}</strong>
            <small>Solana · inscriptions · pre-mint</small>
          </div>
          <div className={styles.quickCard}>
            <span>RENDER MODES</span>
            <strong>{renderModes}</strong>
            <small>Traits · curated · remote image</small>
          </div>
          <div className={styles.quickCard}>
            <span>LEGACY PROTECTION</span>
            <strong>ON</strong>
            <small>Curated flagship assets stay locked</small>
          </div>
        </section>

        <div className={styles.actionRow}>
          <a className={styles.primary} href="#claim">
            + CLAIM / ADD COLLECTION
          </a>
          <a className={styles.secondary} href="#trait-import">
            TEST A TRAIT FOLDER
          </a>
        </div>

        <StudioCostGuardrails />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2>Flagship Collections</h2>
              <p>
                These are the current LockScreened experiences. The portal adds
                to them; it does not flatten or replace their custom work.
              </p>
            </div>
            <a href="/">VIEW PUBLIC SITE →</a>
          </div>

          <div className={styles.projects}>
            {FLAGSHIP_PROJECTS.map((project) => (
              <article className={styles.project} key={project.slug}>
                <div className={styles.preview}>
                  <img
                    src={PREVIEWS[project.slug] || "/lockscreened-logo.png"}
                    alt=""
                  />
                </div>
                <div className={styles.projectBody}>
                  <div className={styles.flags}>
                    <span className={styles.flag}>FLAGSHIP</span>
                    {project.legacyAssetsLocked ? (
                      <span className={styles.locked}>LEGACY LOCKED</span>
                    ) : null}
                  </div>

                  <h3>{project.name}</h3>

                  <div className={styles.meta}>
                    <span>SOURCE</span>
                    <strong>{sourceLabel(project.source.kind)}</strong>
                    <span>RENDER ENGINE</span>
                    <strong>{renderLabel(project.render.mode)}</strong>
                  </div>

                  <div className={styles.projectActions}>
                    <a href={project.routes.landing}>OPEN PROJECT</a>
                    <a href={"/studio/projects/" + project.slug}>MANAGE</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.claim} id="claim">
          <div className={styles.claimGrid}>
            <div>
              <p className={styles.kicker}>COLLECTION AUTHORITY</p>
              <h2>Claim an existing collection</h2>
              <p>
                The production flow will verify the wallet that controls the
                collection, then ask for a plain signed message. Owning one NFT
                will never be enough to claim somebody else&apos;s project.
              </p>
            </div>

            <div className={styles.claimSteps}>
              <div>
                <b>01</b>
                <span>Enter collection address / project source</span>
              </div>
              <div>
                <b>02</b>
                <span>Read creator and authority evidence</span>
              </div>
              <div>
                <b>03</b>
                <span>Connect the authority wallet</span>
              </div>
              <div>
                <b>04</b>
                <span>Sign verification message and unlock Studio</span>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.importer} id="trait-import">
          <StudioTraitImporter />
        </div>

        <div className={styles.importer} id="background-builder">
          <StudioBackgroundBuilder />
        </div>

        <p className={styles.note}>
          ALPHA SAFETY MODE · TRAIT AND BACKGROUND TESTING HAPPENS IN YOUR
          BROWSER · NOTHING ON THIS PAGE UPLOADS OR PUBLISHES ART YET
        </p>
      </div>
    </main>
  );
}
