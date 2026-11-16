"use client";

import ProjectDirectory from "./components/ProjectDirectory";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main className={`${styles.home} ls-admin-theme`}>
      <section id="partner-lockers" className={styles.collections} aria-label="Project collections">
        <h1 className={styles.screenReaderOnly}>LockScreened collections</h1>
        <ProjectDirectory hideRetrograve showSearch={false} />
      </section>
    </main>
  );
}
