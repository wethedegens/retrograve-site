import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Wallet Security | LockScreened",
  description: "See what LockScreened can access when you connect your wallet, what a sign-in request looks like, and how to stay in control.",
};

export default function SecurityPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.intro}>
          <h1>Wallet security</h1>
          <p>LockScreened uses your public wallet address to find eligible NFTs and make wallpapers. Your SOL and NFTs stay in your wallet throughout the normal locker and Studio flows.</p>
        </header>

        <section className={styles.steps} aria-label="What to expect in your wallet">
          <article>
            <h2>Connect wallet</h2>
            <p>Phantom may say LockScreened can view balances and activity. Connecting shares your public address. Public blockchain information associated with it can include balances, NFTs, and transaction history.</p>
          </article>
          <article>
            <h2>Sign in with Solana</h2>
            <p>Creator Studio and some lockers ask for an off-chain message signature to verify your wallet. The message shows the website address, wallet address, and timestamp. This sign-in grants no spending permission and moves no assets.</p>
          </article>
        </section>

        <section className={styles.check} aria-labelledby="before-approving">
          <h2 id="before-approving">Before you approve</h2>
          <ul>
            <li>Verify that both your browser and the wallet request show <strong>lockscreened.xyz</strong>.</li>
            <li>LockScreened’s locker and sign-in flows require no transaction, payment, gas fee, NFT transfer, or token approval. Cancel if your wallet asks for one.</li>
            <li>Keep your recovery phrase and private keys private. If Phantom is locked, enter your password only in Phantom itself.</li>
          </ul>
        </section>

        <section className={styles.questions} aria-labelledby="wallet-questions">
          <h2 id="wallet-questions">Common wallet questions</h2>
          <details>
            <summary>Can I browse without connecting?</summary>
            <p>Yes. You can browse the public project directory and read about LockScreened without connecting. Connect when you want to access holder features or sign in to Studio.</p>
          </details>
          <details>
            <summary>Can LockScreened transfer my NFTs or spend my SOL?</summary>
            <p>Connecting your wallet and signing the LockScreened login message do not authorize transfers or spending. A transaction approval in your wallet is a separate action and is unnecessary for making a wallpaper.</p>
          </details>
          <details>
            <summary>What information does Studio use?</summary>
            <p>Studio uses your wallet address to identify your account, and the off-chain signature to verify that you control the address. Private project artwork uses access-controlled storage. Published locker content is meant to be visible to collectors.</p>
          </details>
          <details>
            <summary>How do I sign out or disconnect?</summary>
            <p>Use <strong>Sign out of Studio</strong> to end your Studio session. To disconnect the wallet, use the wallet menu or remove LockScreened in <strong>Phantom → Settings → Connected Apps</strong>. A disconnect does not revoke any separate spending approvals you may have granted elsewhere. <a href="https://help.phantom.com/articles/29995498642195">Phantom’s connection guide</a></p>
          </details>
          <details>
            <summary>What if a request looks suspicious?</summary>
            <p>Cancel it. Navigate to lockscreened.xyz directly and avoid login links in unsolicited messages. If you already approved a suspicious transaction or shared a secret, follow <a href="https://help.phantom.com/articles/5487893286291">Phantom’s wallet recovery guidance</a>.</p>
          </details>
          <details>
            <summary>How do I report a security issue?</summary>
            <p>Use the Community link in our header and ask the LockScreened team for a private reporting channel. Share the page address, time, and a screenshot with secrets removed. Keep suspected vulnerabilities and sensitive details out of public channels.</p>
          </details>
          <details>
            <summary>Is LockScreened unhackable?</summary>
            <p>No website can guarantee that. LockScreened uses HTTPS, domain-checked wallet sign-in, and access controls for private Studio assets. Review each wallet prompt and cancel anything unexpected.</p>
          </details>
        </section>
      </div>
    </main>
  );
}
