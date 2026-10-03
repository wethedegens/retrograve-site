"use client";

import LockScreenedStateScreen from "../../components/studio/LockScreenedStateScreen";

export default function ProjectError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <LockScreenedStateScreen
      eyebrow="LOCKSCREENED CREATOR LOCKER"
      title="Locker temporarily unavailable"
      message="The project data could not be loaded right now. No wallet assets or NFTs are affected."
      action={<button onClick={() => reset()}>TRY AGAIN</button>}
    />
  );
}
