"use client";

import LockScreenedStateScreen from "../components/studio/LockScreenedStateScreen";

export default function StudioError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <LockScreenedStateScreen
      eyebrow="LOCKSCREENED CREATOR STUDIO"
      title="Studio hit a snag"
      message="Your flagship projects and stored assets are unchanged. Retry this Studio view or return home."
      action={<button onClick={() => reset()}>TRY AGAIN</button>}
    />
  );
}
