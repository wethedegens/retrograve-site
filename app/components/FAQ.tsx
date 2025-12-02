// app/components/FAQ.tsx
// Fully static/SSR-safe: native <details> for expand/collapse, no client JS required.

export default function FAQ() {
  const faqs: { q: string; a: JSX.Element }[] = [
    {
      q: "What is RetroGrave Lockscreen Locker?",
      a: (
        <>
          A simple, holder-first tool to turn your RetroGraves (and other NFTs)
          into perfectly sized, crisp wallpapers for iOS and Android with no
          cropping, no guessing. Previews are scaled for speed, while exports
          render at exact device pixels. Each phone-sized NFT comes with a
          secondary square image for easy placement as your personalized avatar
          on X and/or Discord.
        </>
      ),
    },
    {
      q: "Why the 'Change Lockscreens' focus?",
      a: (
        <>
          iPhones intentionally apply strong blur and depth effects to busy
          backgrounds, which often hides the details that make your NFT special.
          Our approach keeps the NFT art clean and foregrounded while letting
          you choose the exact background that looks great on your device.
          You’ll still enjoy your art <em>every time</em> you unlock—without it
          getting muddied.
        </>
      ),
    },
    {
      q: "Whats the utility?",
      a: (
        <>
          We are launching a multi-project Web3 ecosystem that opens the door
          for other projects to host their NFTs and let their users enjoy the
          same experience. Profits from this expansion go toward growing the
          RetroGrave community at large and broadening our connections and
          influence, which has a positive impact on the overall ecosystem.
        </>
      ),
    },
    {
      q: "Will backgrounds expand over time?",
      a: (
        <>
          Yes. We’ll continually add curated background packs (themes, seasons,
          collabs) so you can refresh the look without touching the art. You’ll
          be able to browse presets or upload your own image and keep the NFT
          locked neatly to the bottom so nothing important is cropped.
        </>
      ),
    },
    {
      q: "How does the OG phase work?",
      a: (
        <>
          Early adopters can mint in the OG phase for free (supply-limited). OG
          spots are announced first in Discord and on X. Keep notifications on
          for both to catch the window. OG mints are mainly to reward the
          earliest community support and help share the experience ahead of the
          public launch.
        </>
      ),
    },
    {
      q: "How do I get on the allowlist (WL)?",
      a: (
        <>
          WL opportunities (discounted mint versus public) roll out through X
          posts and Discord announcements. Typical paths include engagement
          campaigns, collab allowlist swaps, community contributions, and
          event/space participation. Follow{" "}
          <a
            href="https://x.com/RETROGRAVE_NFT"
            target="_blank"
            rel="noreferrer"
          >
            @retrograve
          </a>{" "}
          and join the Discord to stay ahead of each WL wave.
        </>
      ),
    },
    {
      q: "What happens once the collection is minted out?",
      a: (
        <>
          You’ll be able to safely connect your wallet, select any of your
          RetroGraves, and instantly export wallpapers with your choice of
          backgrounds. We render backgroundless art layers at the bottom of the
          screen so that the key details are never cut off, while the background
          remains fully customizable.
        </>
      ),
    },
    {
      q: "Is the export quality good enough for modern phones?",
      a: (
        <>
          Yes. We ship exact presets for popular devices (e.g., iPhone Pro/Max,
          Android QHD+/20:9). Your export is a full-size PNG at the correct
          pixel dimensions. The on-page preview is just scaled; the downloaded
          image is full fidelity.
        </>
      ),
    },
    {
      q: "What community and promotion efforts should I expect?",
      a: (
        <>
          We run a consistent content cadence (previews, progress logs, BTS),
          host X Spaces/AMAs, and coordinate collabs with aligned projects.
          Expect occasional allowlist swaps, creator spotlights, and
          contribution bounties. We’ll also provide a public press kit (logos,
          banners, device mockups) to make sharing effortless.
        </>
      ),
    },
    {
      q: "Will there be holder perks after launch?",
      a: (
        <>
          Yes. Expect role-gated channels, early previews, leaderboard/quest
          rewards, featured holder spotlights, and periodic 1/1 lotteries for
          active users. Holders will also have first access to future
          lockscreen collections and collabs.
        </>
      ),
    },
    {
      q: "Do I need to worry about security when connecting my wallet?",
      a: (
        <>
          We keep wallet connect scoped to read-only operations necessary to
          fetch your holdings for previews; no surprise transactions. Always
          double-check that you’re on the official site and avoid signing
          unknown requests. We’ll continue to publish anti-phishing tips and
          support routes in Discord.
        </>
      ),
    },
    {
      q: "Where can I get help if something looks off?",
      a: (
        <>
          Pop into the{" "}
          <a
            href="https://discord.gg/mSNHRFdCkS"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>{" "}
          and post in support. Include your device model, OS version, and a
          screenshot if possible. Most issues are quick CSS/export preset tweaks
          we can ship fast.
        </>
      ),
    },
  ];

  return (
    <section className="rg-faq" aria-labelledby="faq-h">
      <h2 id="faq-h" className="rg-title">
        FAQ
      </h2>

      <div className="grid">
        {faqs.map((f, i) => (
          <details key={i} className="item">
            <summary className="q">{f.q}</summary>
            <div className="a">{f.a}</div>
          </details>
        ))}
      </div>

      <style jsx>{`
        .rg-faq {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 18px 96px;
        }
        .rg-title {
          text-align: center;
          font-size: 28px;
          margin: 8px 0 24px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #f9fafb;
          text-shadow: none;
        }
        .grid {
          display: grid;
          gap: 10px;
        }
        .item {
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: rgba(15, 23, 42, 0.96);
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 14px 30px rgba(15, 23, 42, 0.9),
            0 0 0 1px rgba(30, 64, 175, 0.4);
        }
        .q {
          cursor: pointer;
          padding: 14px 16px;
          list-style: none;
          outline: none;
          color: #f9fafb;
        }
        .q::-webkit-details-marker {
          display: none;
        }
        .q:hover {
          background: rgba(30, 64, 175, 0.35);
        }
        .a {
          padding: 0 16px 14px 16px;
          opacity: 0.95;
          line-height: 1.55;
          color: #e5e7eb;
        }
        details[open] .q {
          background: rgba(30, 64, 175, 0.6);
        }

        @media (max-width: 640px) {
          .rg-title {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
}
