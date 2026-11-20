import type { Metadata } from "next";
import Link from "next/link";
import LockscreenedFAQ from "../components/LockscreenedFAQ";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "FAQ | LockScreened", description: "Help with wallets, NFT wallpapers, backgrounds, and supported devices on LockScreened." };

export default function FAQPage() {
  return (
    <main className={`${styles.page} ls-admin-theme`}>
      <section className={styles.content} aria-label="Frequently asked questions">
        <h1 className={styles.title}>Help with your locker</h1>
        <LockscreenedFAQ />
        <p className={styles.founders}>Building a locker for your collection? <Link href="/studio#founder-faq">Read the Founder Studio FAQ</Link></p>
        <p className={styles.founders}>Questions about wallet safety or private artwork? <Link href="/security">Read about Security</Link></p>
      </section>
    </main>
  );
}
