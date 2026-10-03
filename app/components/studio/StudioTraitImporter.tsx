// app/components/studio/StudioTraitImporter.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  analyzeTraitFolder,
  type TraitImportAnalysis,
  type UploadedTraitFile,
} from "../../lib/lockscreened/traitImport";
import {
  formatBytes,
  validateTraitImportFiles,
  type UploadGuardrailResult,
} from "../../lib/lockscreened/costGuardrails";
import {
  getFreshSession,
  readStoredSession,
  type LockScreenedSession,
} from "../../lib/lockscreened/web3AuthClient";
import {
  assertCollectionStorageBudget,
  listMyStudioCollections,
  saveTraitLayerMap,
  upsertTraitAssetMetadata,
  type StudioCollectionRow,
} from "../../lib/lockscreened/studioDataClient";
import { STORAGE_BUCKETS, traitSourcePathFromRelative } from "../../lib/lockscreened/storagePaths";
import {
  deleteStorageFile,
  uploadStorageFile,
} from "../../lib/lockscreened/studioStorageClient";

function fileListToTraitFiles(files: FileList): UploadedTraitFile[] {
  return Array.from(files).map((file) => ({
    name: file.name,
    relativePath:
      (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
      file.name,
    size: file.size,
    type: file.type,
  }));
}

export default function StudioTraitImporter() {
  const [analysis, setAnalysis] = useState<TraitImportAnalysis | null>(null);
  const [folderName, setFolderName] = useState("");
  const [guardrail, setGuardrail] = useState<UploadGuardrailResult | null>(null);
  const [session, setSession] = useState<LockScreenedSession | null>(null);
  const [collections, setCollections] = useState<StudioCollectionRow[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
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

  const totals = useMemo(() => {
    if (!analysis) return { layers: 0, traits: 0 };
    return {
      layers: analysis.layers.length,
      traits: analysis.layers.reduce(
        (sum, layer) => sum + layer.assets.length,
        0
      ),
    };
  }, [analysis]);

  function rawFileFor(relativePath: string) {
    const target = String(relativePath || "").replace(/\\/g, "/");

    return rawFiles.find((file) => {
      const full = String(
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name
      ).replace(/\\/g, "/");

      return full === target || full.endsWith("/" + target);
    });
  }

  async function uploadPrivateTraitSources() {
    if (!analysis || !session || !selectedCollectionId) return;

    const selectedCollection = collections.find(
      (collection: any) => collection.id === selectedCollectionId
    ) as any;

    if (!selectedCollection) {
      setSaveMessage("Choose a Studio collection first.");
      return;
    }

    if (selectedCollection.claim_status !== "verified") {
      setSaveMessage(
        "Source uploads stay locked until this collection claim is verified."
      );
      return;
    }

    const duplicateWarning = analysis.warnings.some(
      (warning) => warning.code === "duplicate_trait_value"
    );

    if (duplicateWarning) {
      setSaveMessage(
        "Resolve duplicate trait values before uploading source artwork."
      );
      return;
    }

    setUploading(true);
    setSaveMessage("");

    const allAssets = analysis.layers.flatMap((layer) =>
      layer.assets.map((asset) => ({ layer, asset }))
    );

    setUploadProgress({ done: 0, total: allAssets.length });

    try {
      const incomingBytes = rawFiles.reduce(
        (sum, file) => sum + Number(file.size || 0),
        0
      );

      await assertCollectionStorageBudget({
        session,
        collectionId: selectedCollectionId,
        incomingBytes,
      });

      const selectedCollection = projects.find(
        (project: any) => project.id === selectedCollectionId
      );

      const savedLayers = await saveTraitLayerMap({
        session,
        collectionId: selectedCollectionId,
        currentRenderProfile: selectedCollection?.render_profile,
        layers: analysis.layers.map((layer) => ({
          name: layer.name,
          suggestedOrder: layer.suggestedOrder,
          likelyBackground: layer.likelyBackground,
        })),
      });

      const layerIdByName = new Map(
        savedLayers.map((layer: any) => [
          String(layer.trait_type).trim().toLowerCase(),
          String(layer.id),
        ])
      );

      let done = 0;

      for (const { layer, asset } of allAssets) {
        const file = rawFileFor(asset.relativePath);
        if (!file) {
          throw new Error(
            `Could not find the source file for ${asset.relativePath}.`
          );
        }

        const layerId = layerIdByName.get(
          String(layer.name).trim().toLowerCase()
        );

        if (!layerId) {
          throw new Error(`No saved layer ID was found for ${layer.name}.`);
        }

        const storagePath = traitSourcePathFromRelative({
          studioId: selectedCollection.studio_id,
          collectionId: selectedCollectionId,
          relativePath: asset.relativePath,
        });

        await uploadStorageFile({
          session,
          bucket: STORAGE_BUCKETS.creatorSourcePrivate,
          path: storagePath,
          file,
          upsert: true,
        });

        try {
          await upsertTraitAssetMetadata({
            session,
            rows: [
              {
                layer_id: layerId,
                trait_value: asset.traitValue,
                storage_bucket: STORAGE_BUCKETS.creatorSourcePrivate,
                storage_path: storagePath,
                bytes: file.size,
                mime_type: file.type || null,
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
        setUploadProgress({ done, total: allAssets.length });
      }

      setSaveMessage(
        `${done} private trait source files uploaded and indexed successfully.`
      );
      window.dispatchEvent(
        new CustomEvent("lockscreened-studio-data-changed")
      );
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Trait upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function persistLayerMap() {
    if (!analysis || !session || !selectedCollectionId) return;

    setSaving(true);
    setSaveMessage("");

    try {
      await saveTraitLayerMap({
        session,
        collectionId: selectedCollectionId,
        layers: analysis.layers.map((layer) => ({
          name: layer.name,
          suggestedOrder: layer.suggestedOrder,
          likelyBackground: layer.likelyBackground,
        })),
      });
      setSaveMessage(
        "Layer map saved to Supabase. Source images are still local/private and have not been uploaded."
      );
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Could not save layer map."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files);
    setRawFiles(selected);

    const converted = fileListToTraitFiles(files);
    const firstPath = converted[0]?.relativePath || "";
    const firstFolder = firstPath.split("/")[0] || "Trait folder";

    const budget = validateTraitImportFiles(converted);
    setFolderName(firstFolder);
    setGuardrail(budget);

    if (!budget.ok) {
      setAnalysis(null);
      return;
    }

    setAnalysis(analyzeTraitFolder(converted));
  }

  return (
    <section className="panel">
      <div className="panelHead">
        <div>
          <div className="eyebrow">LOCKSCREENED UNIVERSAL TRAIT ENGINE</div>
          <h2>Import a collection trait folder</h2>
          <p>
            Choose the same layered art folder used to generate the collection.
            LockScreened analyzes it locally first — nothing is uploaded or
            published from this screen.
          </p>
        </div>
        <div className="status">LOCAL ANALYSIS</div>
      </div>

      <label className="dropzone">
        <input
          type="file"
          multiple
          accept=".png,.webp,image/png,image/webp"
          onChange={(event) => handleFiles(event.target.files)}
          {...({ webkitdirectory: "", directory: "" } as any)}
        />
        <div className="dropIcon">＋</div>
        <strong>CHOOSE TRAIT FOLDER</strong>
        <span>PNG / WebP · LMNFT-style layer folders supported</span>
      </label>

      {guardrail ? (
        <div className={guardrail.ok ? "budgetOk" : "budgetBad"}>
          <strong>
            {guardrail.ok ? "✓ Upload budget check passed" : "Upload blocked"}
          </strong>
          <span>
            {formatBytes(guardrail.totalBytes)} source folder · cost guardrails
            checked before any future upload
          </span>
          {guardrail.errors.map((message) => (
            <span key={message}>• {message}</span>
          ))}
          {guardrail.warnings.map((message) => (
            <span key={message}>• {message}</span>
          ))}
        </div>
      ) : null}

      {!analysis ? (
        <div className="empty">
          <strong>Try it with a real art folder.</strong>
          <span>
            We’ll show detected layers, likely background layers, trait counts,
            rarity subfolders and import warnings before anything goes live.
          </span>
        </div>
      ) : (
        <>
          <div className="summary">
            <div>
              <span>Folder</span>
              <strong>{folderName}</strong>
            </div>
            <div>
              <span>Layers</span>
              <strong>{totals.layers}</strong>
            </div>
            <div>
              <span>Traits</span>
              <strong>{totals.traits}</strong>
            </div>
            <div>
              <span>Warnings</span>
              <strong>{analysis.warnings.length}</strong>
            </div>
          </div>

          <div className="layerList">
            {analysis.layers.map((layer, index) => (
              <article className="layerCard" key={layer.name}>
                <div className="order">{String(index + 1).padStart(2, "0")}</div>
                <div className="layerMain">
                  <div className="layerTitleRow">
                    <strong>{layer.name}</strong>
                    {layer.likelyBackground ? (
                      <span className="badge">LIKELY BACKGROUND</span>
                    ) : null}
                  </div>
                  <span className="muted">
                    {layer.assets.length} trait
                    {layer.assets.length === 1 ? "" : "s"}
                  </span>
                  <div className="chips">
                    {layer.assets.slice(0, 8).map((asset) => (
                      <span className="chip" key={asset.relativePath}>
                        {asset.traitValue}
                      </span>
                    ))}
                    {layer.assets.length > 8 ? (
                      <span className="chip more">
                        +{layer.assets.length - 8} more
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="persistBox">
            <div>
              <strong>SAVE THIS LAYER MAP</strong>
              <span>
                Store layer names/order/background designation in Supabase
                without uploading the source PNGs yet.
              </span>
            </div>

            {session && collections.length ? (
              <div className="persistControls">
                <select
                  value={selectedCollectionId}
                  onChange={(event) =>
                    setSelectedCollectionId(event.target.value)
                  }
                >
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} · {collection.publish_status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={persistLayerMap}
                  disabled={saving || uploading || !selectedCollectionId}
                >
                  {saving ? "SAVING…" : "SAVE LAYER MAP"}
                </button>
                <button
                  onClick={uploadPrivateTraitSources}
                  disabled={
                    uploading ||
                    saving ||
                    !selectedCollectionId ||
                    !(collections.find(
                      (collection: any) =>
                        collection.id === selectedCollectionId
                    ) as any)?.claim_status ||
                    (collections.find(
                      (collection: any) =>
                        collection.id === selectedCollectionId
                    ) as any)?.claim_status !== "verified"
                  }
                >
                  {uploading
                    ? `UPLOADING ${uploadProgress.done}/${uploadProgress.total}`
                    : "UPLOAD PRIVATE SOURCES"}
                </button>
              </div>
            ) : (
              <span className="persistHint">
                {session
                  ? "Create a collection claim draft above first."
                  : "Sign in to Studio first to persist this map."}
              </span>
            )}

            {saveMessage ? (
              <span className="persistMessage">{saveMessage}</span>
            ) : null}
          </div>

          {analysis.warnings.length ? (
            <div className="warnings">
              <strong>Review before publish</strong>
              {analysis.warnings.slice(0, 8).map((warning, index) => (
                <div key={index}>• {warning.message}</div>
              ))}
            </div>
          ) : (
            <div className="success">
              ✓ No import warnings found in this folder.
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .panel {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(9,8,18,.72);
          box-shadow: 0 24px 70px rgba(0,0,0,.35);
          padding: 22px;
          backdrop-filter: blur(14px);
        }
        .panelHead {
          display:flex;
          justify-content:space-between;
          gap:18px;
          align-items:flex-start;
        }
        .eyebrow {
          font-size:10px;
          font-weight:900;
          letter-spacing:.22em;
          color:#ff8dce;
        }
        h2 {
          margin:6px 0 6px;
          font-size:24px;
          letter-spacing:.01em;
        }
        p {
          margin:0;
          max-width:720px;
          color:rgba(255,255,255,.68);
          font-size:13px;
          line-height:1.55;
        }
        .status {
          flex:0 0 auto;
          font-size:9px;
          letter-spacing:.16em;
          font-weight:900;
          border:1px solid rgba(134,255,197,.34);
          color:#9dffcd;
          padding:7px 9px;
          border-radius:999px;
          background:rgba(53,155,102,.12);
        }
        .dropzone {
          margin-top:18px;
          min-height:160px;
          border:1px dashed rgba(255,99,194,.38);
          background:linear-gradient(135deg,rgba(255,63,180,.045),rgba(130,93,255,.06));
          border-radius:20px;
          display:grid;
          place-items:center;
          align-content:center;
          gap:7px;
          cursor:pointer;
          text-align:center;
          transition:.15s ease;
        }
        .dropzone:hover {
          border-color:rgba(255,99,194,.72);
          background:rgba(255,63,180,.07);
          transform:translateY(-1px);
        }
        .dropzone input { display:none; }
        .dropIcon {
          width:42px;height:42px;
          display:grid;place-items:center;
          border-radius:14px;
          background:rgba(205,183,255,.12);
          border:1px solid rgba(205,183,255,.24);
          font-size:26px;
          color:#ff9bd8;
        }
        .dropzone strong {
          font-size:12px;
          letter-spacing:.16em;
        }
        .dropzone span {
          font-size:11px;
          color:rgba(255,255,255,.55);
        }
        .budgetOk,.budgetBad {
          margin-top:12px;
          padding:11px 13px;
          border-radius:14px;
          display:grid;
          gap:3px;
          font-size:10px;
        }
        .budgetOk {
          color:#a8ffd2;
          border:1px solid rgba(72,205,135,.18);
          background:rgba(72,205,135,.07);
        }
        .budgetBad {
          color:#ffd1b3;
          border:1px solid rgba(255,137,76,.2);
          background:rgba(255,137,76,.08);
        }
        .budgetOk span,.budgetBad span {
          font-size:9px;
          color:inherit;
          opacity:.82;
        }
        .empty {
          margin-top:14px;
          padding:14px 16px;
          display:grid;
          gap:4px;
          border-radius:16px;
          background:rgba(255,255,255,.04);
        }
        .empty strong { font-size:12px; }
        .empty span {
          font-size:11px;
          color:rgba(255,255,255,.56);
        }
        .summary {
          display:grid;
          grid-template-columns:2fr repeat(3,1fr);
          gap:10px;
          margin-top:16px;
        }
        .summary > div {
          border-radius:14px;
          background:rgba(255,255,255,.045);
          border:1px solid rgba(255,255,255,.07);
          padding:11px 12px;
          display:grid;
          gap:4px;
        }
        .summary span {
          font-size:9px;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:rgba(255,255,255,.48);
        }
        .summary strong {
          font-size:15px;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .layerList {
          display:grid;
          gap:9px;
          margin-top:14px;
        }
        .layerCard {
          display:grid;
          grid-template-columns:42px 1fr;
          gap:12px;
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;
          padding:12px;
          background:rgba(0,0,0,.16);
        }
        .order {
          width:42px;height:42px;
          display:grid;place-items:center;
          border-radius:12px;
          background:rgba(205,183,255,.1);
          color:#cfbfff;
          font-weight:900;
          font-size:11px;
        }
        .layerMain { min-width:0; }
        .layerTitleRow {
          display:flex; gap:8px; align-items:center; flex-wrap:wrap;
        }
        .layerTitleRow strong { font-size:13px; }
        .badge {
          font-size:8px;
          font-weight:900;
          letter-spacing:.12em;
          color:#ffdc8a;
          border:1px solid rgba(255,220,138,.26);
          background:rgba(255,183,65,.08);
          padding:4px 7px;
          border-radius:999px;
        }
        .muted {
          display:block;
          margin-top:2px;
          color:rgba(255,255,255,.48);
          font-size:10px;
        }
        .chips {
          margin-top:8px;
          display:flex; gap:6px; flex-wrap:wrap;
        }
        .chip {
          font-size:9px;
          padding:4px 7px;
          border-radius:999px;
          background:rgba(255,255,255,.055);
          border:1px solid rgba(255,255,255,.07);
          color:rgba(255,255,255,.72);
        }
        .chip.more { color:#cfbfff; }
        .persistBox {
          margin-top:14px;
          border-radius:16px;
          padding:13px;
          border:1px solid rgba(142,231,255,.14);
          background:rgba(77,185,224,.045);
          display:grid;
          gap:10px;
        }
        .persistBox > div:first-child {
          display:grid;
          gap:3px;
        }
        .persistBox strong {
          font-size:10px;
          letter-spacing:.12em;
          color:#aeeeff;
        }
        .persistBox span {
          font-size:9px;
          color:rgba(255,255,255,.52);
        }
        .persistControls {
          display:grid;
          grid-template-columns:minmax(0,1fr) auto auto;
          gap:8px;
        }
        .persistControls select {
          min-width:0;
          height:38px;
          border-radius:11px;
          border:1px solid rgba(255,255,255,.1);
          background:#11101a;
          color:white;
          padding:0 10px;
        }
        .persistControls button {
          border-radius:999px;
          border:1px solid rgba(142,231,255,.18);
          background:rgba(77,185,224,.12);
          color:white;
          font-size:9px;
          font-weight:900;
          letter-spacing:.1em;
          padding:0 12px;
        }
        .persistHint,.persistMessage {
          display:block;
        }
        .persistMessage {
          color:#a8ffd2 !important;
        }
        .warnings,.success {
          margin-top:14px;
          border-radius:14px;
          padding:12px 14px;
          font-size:10px;
          line-height:1.6;
        }
        .warnings {
          color:#ffd6a3;
          background:rgba(255,161,67,.08);
          border:1px solid rgba(255,161,67,.18);
        }
        .warnings strong { display:block; margin-bottom:3px; }
        .success {
          color:#a8ffd2;
          background:rgba(72,205,135,.08);
          border:1px solid rgba(72,205,135,.18);
        }
        @media(max-width:720px){
          .panelHead{display:grid}
          .status{justify-self:start}
          .summary{grid-template-columns:1fr 1fr}
          .persistControls{grid-template-columns:1fr}
        }
      `}</style>
    </section>
  );
}
