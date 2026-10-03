// app/components/studio/StudioMintOverrides.tsx
"use client";

import { useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { STORAGE_BUCKETS, mintOverrideSourcePath } from "../../lib/lockscreened/storagePaths";
import { uploadStorageFile } from "../../lib/lockscreened/studioStorageClient";
import {
  assertCollectionStorageBudget,
  upsertMintOverrideMetadata,
} from "../../lib/lockscreened/studioDataClient";
import { validateBackgroundFile } from "../../lib/lockscreened/costGuardrails";

export default function StudioMintOverrides({
  session,
  collection,
  verified,
  overrides,
  publishedOverrides,
  onChanged,
}: {
  session: LockScreenedSession;
  collection: any;
  verified: boolean;
  overrides: any[];
  publishedOverrides: any[];
  onChanged: () => Promise<void>;
}) {
  const [assetId, setAssetId] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function savePrivateOverride() {
    if (!file || !assetId.trim()) return;
    setBusy(true);
    setMessage("");

    try {
      const guard = validateBackgroundFile(file);
      if (!guard.ok) throw new Error(guard.errors.join(" "));

      await assertCollectionStorageBudget({
        session,
        collectionId: collection.id,
        incomingBytes: file.size,
      });

      const path = mintOverrideSourcePath({
        studioId: collection.studio_id,
        collectionId: collection.id,
        assetId: assetId.trim(),
        fileName: file.name,
      });

      await uploadStorageFile({
        session,
        bucket: STORAGE_BUCKETS.creatorSourcePrivate,
        path,
        file,
        upsert: true,
      });

      await upsertMintOverrideMetadata({
        session,
        collectionId: collection.id,
        assetId: assetId.trim(),
        storageBucket: STORAGE_BUCKETS.creatorSourcePrivate,
        storagePath: path,
        bytes: file.size,
        notes,
      });

      setAssetId("");
      setNotes("");
      setFile(null);
      setMessage("Private mint override saved.");
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Override upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function publishOverride(overrideId: string) {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/studio/publish-mint-override", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({ overrideId }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data?.needsServerSecret) {
          setMessage("Override is ready, but secure publishing is waiting for the server-only Supabase secret.");
          return;
        }
        throw new Error(data?.error || "Override publishing failed.");
      }

      setMessage("Mint override published.");
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Override publishing failed.");
    } finally {
      setBusy(false);
    }
  }

  const publishedIds = new Set((publishedOverrides || []).map((item) => item.asset_id));

  return (
    <section style={panel}>
      <div style={eyebrow}>1/1 + MINT OVERRIDES</div>
      <h2 style={heading}>Special-case individual NFTs</h2>
      <p style={copy}>
        Use this only when a mint cannot be reproduced cleanly from the normal trait library. The special file stays private until you explicitly publish its render derivative.
      </p>

      <div className="override-grid" style={grid}>
        <input value={assetId} onChange={(e) => setAssetId(e.target.value)} placeholder="NFT mint address" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note: 1/1, collab, metadata exception..." />
        <input type="file" accept="image/png,image/webp,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={savePrivateOverride} disabled={busy || !verified || !file || !assetId.trim()}>
          {busy ? "WORKING…" : "SAVE PRIVATE OVERRIDE"}
        </button>
      </div>

      {!verified ? <div style={notice}>Verify the collection claim before uploading override art.</div> : null}
      {message ? <div style={notice}>{message}</div> : null}

      {(overrides || []).length ? (
        <div style={{ marginTop: 12, display: "grid", gap: 7 }}>
          {overrides.map((item) => (
            <div key={item.id} style={row}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ display: "block", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.asset_id}
                </strong>
                <span style={{ color: "rgba(255,255,255,.4)", fontSize: 8 }}>
                  {item.notes || "Mint-specific render override"}
                </span>
              </div>
              <button
                onClick={() => publishOverride(item.id)}
                disabled={busy || !verified || publishedIds.has(item.asset_id)}
              >
                {publishedIds.has(item.asset_id) ? "PUBLISHED" : "PUBLISH"}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <style jsx>{`
        section :global(input), section :global(button) {
          min-height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.035);
          color: #fff;
          padding: 0 10px;
          font-size: 9px;
        }
        section :global(button) { font-weight: 900; letter-spacing: .06em; }
        @media (max-width: 700px) { .override-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

const panel = { borderRadius: 22, padding: 20, border: "1px solid rgba(255,255,255,.09)", background: "rgba(10,8,20,.72)" } as const;
const eyebrow = { color: "#ffb7dc", fontSize: 9, fontWeight: 900, letterSpacing: ".17em" } as const;
const heading = { margin: "6px 0 5px", fontSize: 19 } as const;
const copy = { margin: 0, color: "rgba(255,255,255,.55)", fontSize: 11, lineHeight: 1.55 } as const;
const grid = { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } as const;
const notice = { marginTop: 9, color: "rgba(255,255,255,.55)", fontSize: 9 } as const;
const row = { borderRadius: 12, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", padding: 9, display: "flex", gap: 8, alignItems: "center" } as const;
