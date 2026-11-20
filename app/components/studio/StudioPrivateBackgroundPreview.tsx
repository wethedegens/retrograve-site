"use client";

import { useEffect, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { downloadStorageBlob } from "../../lib/lockscreened/studioStorageClient";

export default function StudioPrivateBackgroundPreview({ session, asset }: {
  session: LockScreenedSession;
  asset: { storage_bucket: string; storage_path: string; device: string };
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setUrl("");
    setError("");
    void (async () => {
      try {
        if (asset.storage_bucket !== "creator-source-private") throw new Error("Unexpected source storage.");
        const blob = await downloadStorageBlob({ session, bucket: asset.storage_bucket, path: asset.storage_path });
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (active) setError("Could not reopen this private image. Check your Studio sign-in and try again.");
      }
    })();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [session.access_token, asset.storage_bucket, asset.storage_path, attempt]);

  return <figure style={{ margin: 0, minWidth: 0 }}>
    <figcaption style={{ marginBottom: 8 }}>{asset.device.toUpperCase()} · PRIVATE SOURCE</figcaption>
    {url ? <img src={url} alt={`Saved private ${asset.device} background`} onError={() => setError("The saved file could not be displayed as an image.")}
      style={{ display: "block", width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 12 }} /> :
      !error ? <p role="status">Loading saved image…</p> : null}
    {error ? <div role="alert"><p>{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Retry private preview</button></div> : null}
  </figure>;
}
