import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion, type FAQItem } from "../components/LockscreenedFAQ";
import faqStyles from "../faq/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Security | LockScreened",
  description: "Learn what LockScreened asks your wallet to do, what stays private in Creator Studio, and what to check before publishing.",
  alternates: { canonical: "https://lockscreened.xyz/security" },
};

const walletQuestions: FAQItem[] = [
  {
    question: "What happens when I connect my wallet?",
    answer: "Your wallet shares its public address. LockScreened uses it to look up eligible NFTs and show the lockers you can use. The address and the assets it holds are already visible on the blockchain. Connecting leaves your NFTs and funds in your wallet.",
  },
  {
    question: "Why does my wallet ask me to sign a message?",
    answer: "Some features, including Creator Studio, ask you to sign a message that proves you control the connected wallet. This is an off-chain sign-in, which means nothing is written to the blockchain. The message costs no network fee and grants no permission to move funds or NFTs.",
  },
  {
    question: "What should I check before signing?",
    answer: "Open lockscreened.xyz directly and check the address in your browser. In your wallet, look for a sign-in message about LockScreened that matches what you just clicked. Cancel if the site name looks wrong, the request is unexpected, or your wallet shows a transaction, token approval, or transfer.",
  },
  {
    question: "What will LockScreened never ask me for?",
    answer: "Using LockScreened to sign in or make a wallpaper never requires a payment, a token approval, or an NFT transfer. We will never ask for your recovery phrase (sometimes called a seed phrase), private key, or wallet password, including in support messages.",
  },
  {
    question: "How do I end my session on a shared device?",
    answer: "If you signed in to Creator Studio, sign out there. Then disconnect LockScreened from your wallet and close the tab. Use a device you trust when working with unpublished artwork.",
  },
];

const founderQuestions: FAQItem[] = [
  {
    question: "Who can see my drafts and original artwork?",
    answer: "Creator Studio keeps draft projects and original artwork in a private workspace. Other collectors can see the public locker only after it is published. Your original trait files stay private when you publish your locker.",
  },
  {
    question: "Can someone publish a locker just because they own an NFT?",
    answer: "Publishing for a live collection requires a signed-in wallet that can prove it has authority over that collection. LockScreened checks current authority before sensitive publishing actions. Owning one NFT gives you holder access where eligible.",
  },
  {
    question: "What should I review before publishing?",
    answer: "Preview your locker and check the project name, public links, artwork, and download options. Treat the published page and downloadable wallpapers as public. Keep any artwork or information you want to remain private out of the public locker.",
  },
];

export default function SecurityPage() {
  return (
    <main className={`${faqStyles.page} ls-admin-theme`}>
      <div className={faqStyles.content}>
        <h1 className={faqStyles.title}>LockScreened Security</h1>
        <p className={styles.intro}>
          Know what your wallet is being asked to do, what stays private in Creator Studio,
          and what founders should check before publishing.
        </p>

        <aside className={styles.walletCheck} aria-label="Before you connect">
          <h2>Before you connect</h2>
          <p>
            Check that you’re on <strong>lockscreened.xyz</strong>. A Studio sign-in prompt
            asks for a message signature. If you see a request to send funds, transfer
            an NFT, or approve a token, cancel it.
          </p>
        </aside>

        <div className={styles.groups}>
          <FaqAccordion title="Wallets & sign-in" items={walletQuestions} initiallyOpen={0} />
          <FaqAccordion title="Creator Studio & private artwork" items={founderQuestions} />
        </div>

        <p className={faqStyles.founders}><Link href="/faq">Back to the general FAQ</Link></p>
      </div>
    </main>
  );
}
