// app/components/studio/StudioTraitImporter.tsx
"use client";

import { useMemo, useState } from "react";
import {
  analyzeTraitFolder,
  type TraitImportAnalysis,
  type UploadedTraitFile,
} from "../../lib/lockscreened/traitImport";

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

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const converted = fileListToTraitFiles(files);
    const firstPath = converted[0]?.relativePath || "";
    const firstFolder = firstPath.split("/")[0] || "Trait folder";

    setFolderName(firstFolder);
    setAnalysis(analyzeTraitFolder(converted));
  }

  return (
    <section className="panel">
      <div className="panelHead">
        <div>
          <div className="eyebrow">UNIVERSAL TRAIT ENGINE</div>
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
          color:#cdb7ff;
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
          border:1px dashed rgba(205,183,255,.42);
          background:rgba(130,93,255,.06);
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
          border-color:rgba(205,183,255,.8);
          background:rgba(130,93,255,.1);
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
          color:#d9caff;
        }
        .dropzone strong {
          font-size:12px;
          letter-spacing:.16em;
        }
        .dropzone span {
          font-size:11px;
          color:rgba(255,255,255,.55);
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
        }
      `}</style>
    </section>
  );
}
