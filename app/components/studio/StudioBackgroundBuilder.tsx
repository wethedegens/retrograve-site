// app/components/studio/StudioBackgroundBuilder.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatBytes,
  validateBackgroundFile,
  validateBackgroundPackage,
} from "../../lib/lockscreened/costGuardrails";
import {
  getFreshSession,
  readStoredSession,
  type LockScreenedSession,
} from "../../lib/lockscreened/web3AuthClient";
import {
  assertCollectionStorageBudget,
  listMyStudioCollections,
  saveBackgroundPackageDraft,
  upsertBackgroundSourceAssetMetadata,
  type StudioCollectionRow,
} from "../../lib/lockscreened/studioDataClient";
import {
  STORAGE_BUCKETS,
  backgroundSourcePath,
} from "../../lib/lockscreened/storagePaths";
import {
  deleteStorageFile,
  uploadStorageFile,
} from "../../lib/lockscreened/studioStorageClient";

type LocalAsset = {
  file: File;
  url: string;
};

type SlotProps = {
  title: string;
  subtitle: string;
  asset: LocalAsset | null;
  onPick: (file: File | null) => void;
};

function Slot({ title, subtitle, asset, onPick }: SlotProps) {
  return (
    <label
      style={{
        minHeight: 220,
        borderRadius: 18,
        border: "1px dashed rgba(255,255,255,.18)",
        background: "rgba(255,255,255,.035)",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        display: "grid",
      }}
    >
      <input
        type="file"
        accept="image/png,image/webp,image/jpeg"
        style={{ display: "none" }}
        onChange={(event) => onPick(event.target.files?.[0] || null)}
      />

      {asset ? (
        <>
          <img
            src={asset.url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              minHeight: 220,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              padding: "30px 12px 11px",
              background:
                "linear-gradient(to bottom, transparent, rgba(0,0,0,.86))",
              display: "grid",
              gap: 3,
            }}
          >
            <strong style={{ fontSize: 11, letterSpacing: ".12em" }}>
              {title.toUpperCase()}
            </strong>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.56)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {asset.file.name}
            </span>
          </div>
        </>
      ) : (
        <div
          style={{
            minHeight: 220,
            display: "grid",
            placeItems: "center",
            alignContent: "center",
            gap: 7,
            textAlign: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(205,183,255,.18)",
              background: "rgba(205,183,255,.08)",
              color: "#d7c8ff",
              fontSize: 23,
            }}
          >
            +
          </div>
          <strong style={{ fontSize: 11, letterSpacing: ".12em" }}>
            {title.toUpperCase()}
          </strong>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.48)" }}>
            {subtitle}
          </span>
        </div>
      )}
    </label>
  );
}

export default function StudioBackgroundBuilder() {
  const [name, setName] = useState("New Official Background");
  const [phone, setPhone] = useState<LocalAsset | null>(null);
  const [ipad, setIpad] = useState<LocalAsset | null>(null);
  const [desktop, setDesktop] = useState<LocalAsset | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [session, setSession] = useState<LockScreenedSession | null>(null);
  const [collections, setCollections] = useState<StudioCollectionRow[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [savedPackage, setSavedPackage] = useState<any>(null);
  const [uploadingSources, setUploadingSources] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    let active = true;

    async function sync() {
      const current = await getFreshSession();
      if (!active) return;

      const next = current || readStoredSession();
      setSession(next);

      if (!next) {
        setCollections([]);
        setSelectedCollectionId("");
        return;
      }

      try {
        const rows = await listMyStudioCollections(next);
        if (!active) return;
        setCollections(rows);
        if (!selectedCollectionId && rows[0]?.id) {
          setSelectedCollectionId(rows[0].id);
        }
      } catch {
        if (active) setCollections([]);
      }
    }

    sync();
    const listener = () => sync();
    window.addEventListener("lockscreened-auth-changed", listener);
    window.addEventListener("lockscreened-studio-data-changed", listener);
    return () => {
      active = false;
      window.removeEventListener("lockscreened-auth-changed", listener);
      window.removeEventListener("lockscreened-studio-data-changed", listener);
    };
  }, [selectedCollectionId]);

  async function saveDraft() {
    if (!session || !selectedCollectionId || !phone || !packageBudget.ok) return;

    setSavingDraft(true);
    setDraftMessage("");

    try {
      const created = await saveBackgroundPackageDraft({
        session,
        collectionId: selectedCollectionId,
        name,
      });
      setSavedPackage(created);
      setDraftMessage(
        "Background package metadata saved. The source images remain local and have not been uploaded."
      );
    } catch (error) {
      setDraftMessage(
        error instanceof Error ? error.message : "Could not save package draft."
      );
    } finally {
      setSavingDraft(false);
    }
  }

  async function uploadPrivateSources() {
    if (!session || !selectedCollectionId || !phone || !packageBudget.ok) return;

    const selectedCollection = collections.find(
      (collection: any) => collection.id === selectedCollectionId
    ) as any;

    if (!selectedCollection) {
      setDraftMessage("Choose a Studio collection first.");
      return;
    }

    const privatePreMint =
      selectedCollection.source_type === "demo" &&
      selectedCollection.source_config?.preMint === true &&
      selectedCollection.publish_status === "draft";

    if (selectedCollection.claim_status !== "verified" && !privatePreMint) {
      setDraftMessage(
        "Private background uploads require either a verified collection or your own pre-mint draft."
      );
      return;
    }

    setUploadingSources(true);
    setDraftMessage("");

    try {
      await assertCollectionStorageBudget({
        session,
        collectionId: selectedCollectionId,
        incomingBytes: packageBudget.totalBytes,
      });

      const packageRow =
        savedPackage?.collection_id === selectedCollectionId
          ? savedPackage
          : await saveBackgroundPackageDraft({
              session,
              collectionId: selectedCollectionId,
              name,
            });

      setSavedPackage(packageRow);

      const sourceFiles = [
        { device: "phone" as const, asset: phone },
        { device: "ipad" as const, asset: ipad },
        { device: "desktop" as const, asset: desktop },
      ].filter((item) => Boolean(item.asset));

      setUploadProgress({ done: 0, total: sourceFiles.length });

      let done = 0;

      for (const item of sourceFiles) {
        const local = item.asset as LocalAsset;
        const storagePath = backgroundSourcePath({
          studioId: selectedCollection.studio_id,
          collectionId: selectedCollectionId,
          backgroundId: packageRow.id,
          device: item.device,
          fileName: local.file.name,
        });

        await uploadStorageFile({
          session,
          bucket: STORAGE_BUCKETS.creatorSourcePrivate,
          path: storagePath,
          file: local.file,
          upsert: true,
        });

        try {
          await upsertBackgroundSourceAssetMetadata({
            session,
            rows: [
              {
                package_id: packageRow.id,
                device: item.device,
                storage_bucket: STORAGE_BUCKETS.creatorSourcePrivate,
                storage_path: storagePath,
                bytes: local.file.size,
                mime_type: local.file.type || null,
              },
            ],
          });
        } catch (error) {
          try {
            await deleteStorageFile({
              session,
              bucket: STORAGE_BUCKETS.creatorSourcePrivate,
              path: storagePath,
            });
          } catch {}

          throw error;
        }

        done += 1;
        setUploadProgress({ done, total: sourceFiles.length });
      }

      setDraftMessage(
        `${done} private background source file${done === 1 ? "" : "s"} uploaded and indexed.`
      );
      window.dispatchEvent(
        new CustomEvent("lockscreened-studio-data-changed")
      );
    } catch (error) {
      setDraftMessage(
        error instanceof Error
          ? error.message
          : "Background source upload failed."
      );
    } finally {
      setUploadingSources(false);
    }
  }

  function replace(
    current: LocalAsset | null,
    setter: (next: LocalAsset | null) => void,
    file: File | null
  ) {
    if (!file) {
      if (current) URL.revokeObjectURL(current.url);
      setter(null);
      setFileError(null);
      return;
    }

    const result = validateBackgroundFile(file);
    if (!result.ok) {
      setFileError(result.errors[0] || "This file exceeds the beta upload limit.");
      return;
    }

    if (current) URL.revokeObjectURL(current.url);
    setter({ file, url: URL.createObjectURL(file) });
    setFileError(result.warnings[0] || null);
  }

  const packageBudget = useMemo(
    () =>
      validateBackgroundPackage([
        phone?.file || null,
        ipad?.file || null,
        desktop?.file || null,
      ]),
    [phone, ipad, desktop]
  );

  const complete = Boolean(phone && ipad && desktop);
  const mode = complete
    ? "ART-DIRECTED · PHONE / IPAD / DESKTOP"
    : phone
      ? "PHONE SOURCE · MISSING VARIANTS FALL BACK SAFELY"
      : "WAITING FOR PHONE SOURCE";

  return (
    <section
      style={{
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(9,8,18,.72)",
        boxShadow: "0 24px 70px rgba(0,0,0,.35)",
        padding: 22,
        backdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 18,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#ff8dce",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: ".22em",
            }}
          >
            LOCKSCREENED DEVICE BACKGROUNDS
          </div>
          <h2 style={{ margin: "6px 0", fontSize: 24 }}>
            Add an optional device background
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: 720,
              color: "rgba(255,255,255,.66)",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            This is not your NFT's own background trait. This is the optional
            phone, iPad or desktop scene that sits behind the NFT in the final
            LockScreened wallpaper. Finished-artwork projects can also use
            automatic edge-color, gradient or blur extension instead.
          </p>
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".12em",
            color: "#ff9bd8",
            textAlign: "right",
          }}
        >
          {mode}
        </div>
      </div>

      <div style={{ marginTop: 17, display: "grid", gap: 6, maxWidth: 520 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".14em",
            color: "rgba(255,255,255,.5)",
          }}
        >
          BACKGROUND NAME
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{
            height: 42,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(0,0,0,.22)",
            color: "#fff",
            padding: "0 12px",
            outline: "none",
          }}
        />
      </div>

      {fileError ? (
        <div
          style={{
            marginTop: 12,
            borderRadius: 12,
            padding: "9px 11px",
            border: "1px solid rgba(255,174,108,.18)",
            background: "rgba(255,174,108,.07)",
            color: "#ffd7b8",
            fontSize: 10,
          }}
        >
          {fileError}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 13,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 11,
        }}
      >
        <Slot
          title="Phone"
          subtitle="Required · canonical source"
          asset={phone}
          onPick={(file) => replace(phone, setPhone, file)}
        />
        <Slot
          title="iPad"
          subtitle="Optional · falls back to phone"
          asset={ipad}
          onPick={(file) => replace(ipad, setIpad, file)}
        />
        <Slot
          title="Desktop"
          subtitle="Optional · falls back to phone"
          asset={desktop}
          onPick={(file) => replace(desktop, setDesktop, file)}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          border: "1px solid rgba(255,99,194,.13)",
          background: "linear-gradient(135deg, rgba(255,63,180,.035), rgba(130,93,255,.035))",
          padding: 12,
          display: "grid",
          gap: 9,
        }}
      >
        <div style={{ display: "grid", gap: 3 }}>
          <strong style={{ fontSize: 10, color: "#ff9bd8", letterSpacing: ".1em" }}>
            SAVE DEVICE BACKGROUND DRAFT
          </strong>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,.5)" }}>
            Save the package name/collection relationship first. Your image files
            stay on this device until you explicitly choose UPLOAD PRIVATE SOURCES below.
          </span>
        </div>

        {session && collections.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) auto auto",
              gap: 8,
            }}
          >
            <select
              value={selectedCollectionId}
              onChange={(event) => setSelectedCollectionId(event.target.value)}
              style={{
                minWidth: 0,
                height: 38,
                borderRadius: 11,
                border: "1px solid rgba(255,255,255,.1)",
                background: "#11101a",
                color: "#fff",
                padding: "0 10px",
              }}
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name} · {collection.publish_status}
                </option>
              ))}
            </select>
            <button
              onClick={saveDraft}
              disabled={
                savingDraft ||
                uploadingSources ||
                !phone ||
                !packageBudget.ok ||
                !selectedCollectionId
              }
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.12)",
                background: "#ff3fb4",
                color: "#151019",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: ".1em",
                padding: "0 12px",
              }}
            >
              {savingDraft ? "SAVING…" : "SAVE PACKAGE DRAFT"}
            </button>
            <button
              onClick={uploadPrivateSources}
              disabled={
                uploadingSources ||
                savingDraft ||
                !phone ||
                !packageBudget.ok ||
                !selectedCollectionId ||
                !(() => {
                  const selected = collections.find(
                    (collection: any) =>
                      collection.id === selectedCollectionId
                  ) as any;
                  return (
                    selected?.claim_status === "verified" ||
                    (selected?.source_type === "demo" &&
                      selected?.source_config?.preMint === true &&
                      selected?.publish_status === "draft")
                  );
                })()
              }
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.12)",
                background: "#ff3fb4",
                color: "#151019",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: ".1em",
                padding: "0 12px",
              }}
            >
              {uploadingSources
                ? `UPLOADING ${uploadProgress.done}/${uploadProgress.total}`
                : "UPLOAD PRIVATE SOURCES"}
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,.46)" }}>
            {session
              ? "Create a collection claim draft first."
              : "Sign in to Studio to save background drafts."}
          </span>
        )}

        {draftMessage ? (
          <span style={{ fontSize: 9, color: "#a8ffd2" }}>{draftMessage}</span>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 3 }}>
          <strong style={{ fontSize: 12 }}>
            {name.trim() || "Untitled background"}
          </strong>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>
            {phone
              ? `Local package: ${formatBytes(packageBudget.totalBytes)}. Private storage is allowed for pre-mint drafts; public publishing stays locked until collection authority is verified.`
              : "Choose a phone image to create the package."}
          </span>
        </div>
        <div
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.1)",
            padding: "8px 11px",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".1em",
            color:
              phone && packageBudget.ok
                ? "#a8ffd2"
                : phone
                  ? "#ffd1b3"
                  : "rgba(255,255,255,.34)",
          }}
        >
          {phone
            ? packageBudget.ok
              ? "LOCAL PREVIEW READY"
              : "PACKAGE TOO LARGE"
            : "NOT UPLOADED"}
        </div>
      </div>
    </section>
  );
}
