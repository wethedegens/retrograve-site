"use client";

import { useEffect, useRef, useState } from "react";
import { analyzeTraitFolder, type ImportedTraitLayer } from "../../lib/lockscreened/traitImport";
import { matchMetadataToTraitAssets } from "../../lib/lockscreened/traitMapping";
import PublishedUniversalComposer from "../../components/studio/PublishedUniversalComposer";
import ExportButtons from "../../components/ExportButtons";
import type { ComposerHandle } from "../../components/Composer";
import type { ArtworkPreview } from "./default-layouts";

type LocalAsset = { layer_id: string; trait_value: string; url: string };
const sample = [
  ["Skin", "teflon-don", "/magapixel/skin/teflon-don.png"],
  ["Face", "classic-brows", "/magapixel/face/classic-brows.png"],
  ["Body", "1997-black-and-white-plaid-shirt", "/magapixel/body/1997-black-and-white-plaid-shirt.png"],
  ["Head", "1990-gold-hard-hat", "/magapixel/head/1990-gold-hard-hat.png"],
  ["Glasses", "clear-goggles", "/magapixel/glasses/clear-goggles.png"],
];

export default function LocalLayers({ onConfirm, onPreview, onSourceFiles }: { onConfirm: (layers: ImportedTraitLayer[]) => void; onPreview?: (preview:ArtworkPreview)=>void; onSourceFiles?: (files:File[])=>void }) {
  const [layers, setLayers] = useState<ImportedTraitLayer[]>([]);
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [background, setBackground] = useState("#171717");
  const [replaceBackground, setReplaceBackground] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const urls = useRef<string[]>([]);
  const composer = useRef<ComposerHandle | null>(null);
  useEffect(()=>{
    const urlFor = (layer:ImportedTraitLayer)=>assets.find(asset=>asset.layer_id===layer.name&&asset.trait_value===selection[layer.name])?.url;
    onPreview?.({ sources: layers.filter(layer=>!layer.likelyBackground).map(urlFor).filter((url):url is string=>Boolean(url)), backgroundSource:replaceBackground ? undefined : layers.filter(layer=>layer.likelyBackground).map(urlFor).find(Boolean), color:replaceBackground?background:'#171717', pixelated:true });
  },[layers,assets,selection,background,replaceBackground,onPreview]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  function clearUrls() { urls.current.forEach(URL.revokeObjectURL); urls.current = []; }

  function useSample() {
    onSourceFiles?.([]);
    onConfirm([]);
    clearUrls();
    const result = analyzeTraitFolder(sample.map(([layer, value]) => ({ relativePath: `${layer}/${value}.png`, name: `${value}.png` })));
    setLayers(result.layers);
    setAssets(sample.map(([layer_id, trait_value, url]) => ({ layer_id, trait_value, url })));
    setSelection(Object.fromEntries(sample.map(([layer, value]) => [layer, value])));
    setWarnings([]); setBlocked(false); setMessage("Demo layers loaded. These existing assets have not been changed.");
  }

  async function importFolder(files: File[]) {
    onConfirm([]);
    setMessage("");
    if (files.length > 5000 || files.reduce((n,f) => n+f.size,0) > 150*1024*1024 || files.some(f => f.size > 2*1024*1024)) {
      setMessage("Choose up to 5,000 files, under 2 MB each and 150 MB total."); return;
    }
    const result = analyzeTraitFolder(files.filter(file => !file.name.toLowerCase().endsWith('.json')).map(file => ({relativePath: file.webkitRelativePath || file.name, name:file.name, size:file.size, type:file.type})));
    onSourceFiles?.(files);
    clearUrls();
    const next: LocalAsset[] = [];
    for (const layer of result.layers) for (const asset of layer.assets) {
      const file = files.find(f => (f.webkitRelativePath || f.name) === asset.relativePath || (f.webkitRelativePath || f.name).endsWith('/'+asset.relativePath));
      if (!file) continue;
      const url = URL.createObjectURL(file); urls.current.push(url);
      next.push({layer_id:layer.name, trait_value:asset.traitValue, url});
    }
    setLayers(result.layers); setAssets(next);
    setSelection(Object.fromEntries(result.layers.map(l => [l.name,l.assets[0]?.traitValue || ""])));
    setWarnings(result.warnings.map(w=>w.message));
    setBlocked(result.warnings.some(w=>w.code === "duplicate_trait_value" || w.code === "no_trait_assets" || w.code === "empty_layer_name"));
    const metadata = files.filter(file => file.name.toLowerCase().endsWith('.json'));
    if (metadata.length === 1) {
      try {
        if (metadata[0].size > 1024*1024) throw new Error("Sample metadata must be under 1 MB.");
        const data = JSON.parse(await metadata[0].text());
        if (!Array.isArray(data.attributes)) throw new Error("Sample JSON needs an attributes array.");
        const matched = matchMetadataToTraitAssets(result.layers,data.attributes);
        setSelection(Object.fromEntries(matched.matched.map(m=>[m.asset.layerName,m.asset.traitValue])));
        setMessage(`Sample metadata loaded: ${matched.matched.length} matched, ${matched.missing.length} missing, ${matched.unusedMetadata.length} unmapped. Review the layer order, then confirm.`);
      } catch(error) { setMessage(error instanceof Error ? error.message : "Could not read sample metadata."); }
    }
  }

  function move(index: number, direction: number) {
    onConfirm([]);
    const next = [...layers]; const target = index+direction;
    if (target<0 || target>=next.length) return;
    [next[index],next[target]] = [next[target],next[index]];
    setLayers(next.map((layer,i)=>({...layer,suggestedOrder:i})));
  }

  return <section className="layer-setup">
    <div className="editor-heading"><div><small>ARTWORK STUDIO</small><h2>Arrange your artwork</h2></div>{layers.length ? <span className="loaded-badge">{layers.length} layers loaded · local preview</span> : null}</div>
    <details className="source-options" open={!layers.length}>
    <summary>{layers.length ? `${layers.length} layers loaded · change folder or demo` : "Choose your source artwork"}</summary>
    <p>Choose the source-art folder used to generate the collection. Files are read locally; nothing uploads.</p>
    <button type="button" onClick={useSample}>Try demo layers</button>
    <label className="file-picker">Choose your trait folder<input type="file" multiple accept="image/png,image/webp" {...({webkitdirectory:"", directory:""} as any)} onChange={e=>importFolder(Array.from(e.target.files || []))} /></label>
    <small>Local preview only · up to 5,000 files · 2 MB per file · 150 MB total</small>
    </details>
    {warnings.length ? <details className="folder-notes"><summary>Folder notes ({warnings.length})</summary>{warnings.map((w,i)=><p key={i}>{w}</p>)}</details> : null}
    {layers.length ? <>
      <p className="editor-help">Layers render from bottom to top. Adjust the order or choose a trait to see it on the right.</p>
      <div className="editing-layout">
      <div className="layer-controls">
      <ol>{layers.map((layer,i)=><li key={layer.name}>
        <div className="layer-name"><span className="order">{i+1}</span><div><strong>{layer.name}</strong><small>{layer.assets.length} {layer.assets.length===1?"trait":"traits"}</small></div></div>
        <div className="move-buttons">
        <button type="button" aria-label={`Move ${layer.name} earlier`} disabled={i===0} onClick={()=>move(i,-1)}>↑</button>{" "}
        <button type="button" aria-label={`Move ${layer.name} later`} disabled={i===layers.length-1} onClick={()=>move(i,1)}>↓</button>
        </div>
        <label className="trait-choice"><span>Preview trait for {layer.name}</span><select value={selection[layer.name] || ""} onChange={e=>setSelection({...selection,[layer.name]:e.target.value})}><option value="" disabled>Choose trait</option>{layer.assets.map(a=><option key={a.relativePath} value={a.traitValue}>{a.traitValue}</option>)}</select></label>
      </li>)}</ol>
      <label>Preview background<select value={replaceBackground ? "replace" : "original"} onChange={e=>setReplaceBackground(e.target.value === "replace")}>
        <option value="original">Original NFT background</option>
        <option value="replace">Replacement color</option>
      </select></label>
      {replaceBackground ? <label className="background-control">Replacement color<input type="color" value={background} onChange={e=>setBackground(e.target.value)} /></label> : null}
      {replaceBackground && !layers.some(layer=>layer.likelyBackground) ? <small>No background layer was detected. Opaque pixels in the trait artwork will still cover the replacement color.</small> : null}
      <details className="metadata-options"><summary>Check sample metadata (optional)</summary>
      <label>Optional: check a sample NFT metadata JSON<input type="file" accept="application/json,.json" onChange={async e=>{
        const file=e.target.files?.[0]; if(!file)return;
        try {
          if(file.size>1024*1024)throw new Error("Choose a metadata JSON under 1 MB.");
          const data=JSON.parse(await file.text());
          if(!Array.isArray(data.attributes))throw new Error("The JSON needs an attributes array.");
          const result=matchMetadataToTraitAssets(layers,data.attributes);
          setSelection(Object.fromEntries(result.matched.map(m=>[m.traitType,m.traitValue])));
          setMessage(`${result.matched.length} matched; ${result.missing.length} missing; ${result.unusedMetadata.length} unmapped. This local sample is not on-chain verification.`);
        }catch(error){setMessage(error instanceof Error?error.message:"Could not read metadata.");}
      }}/></label>
      </details>
      <button className="confirm" type="button" disabled={blocked} onClick={()=>{onConfirm(layers);setMessage("Artwork arrangement confirmed. Choose Continue below to add project details.");}}>Confirm artwork arrangement →</button>
      </div>
      <aside className="live-preview" aria-label="Live layer preview">
        <small>LIVE PREVIEW</small>
        <div className="preview-frame">
          <PublishedUniversalComposer useOriginalBackground={!replaceBackground} ref={composer} attributes={layers.map(l=>({trait_type:l.name,value:selection[l.name]}))}
            layers={layers.map((l,i)=>({id:l.name,trait_type:l.name,display_name:l.name,layer_order:i,is_background:l.likelyBackground})).filter(layer=>!replaceBackground || !layer.is_background)}
            assets={assets} bg={{kind:"color",value:background}} nftName="Local layer example" />
        </div>
        <details className="downloads"><summary>Download a test wallpaper</summary><ExportButtons composerRef={composer} /></details>
      </aside>
      </div>
    </> : null}
    {message ? <p role="status">{message}</p> : null}
    <style jsx>{`
      .layer-setup { display: grid; gap: 10px; }
      .editor-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
      .editor-heading small { font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: .16em; margin-bottom: 7px; }
      .loaded-badge { font-family: 'Courier New', monospace; font-size: 11px; padding: 8px 10px; border: 1px solid #444; border-radius: 5px; color: #ccc; }
      .editor-help { font-size: 13px; }
      .source-options, .metadata-options, .folder-notes { font-size: 13px; color: #bdbdbd; }
      summary { cursor: pointer; padding: 8px 0; }
      .source-options[open] { display: grid; gap: 10px; }
      .editing-layout { display: grid; grid-template-columns: minmax(0,1fr) minmax(200px,280px); gap: 20px; align-items: start; }
      .layer-controls { display: grid; gap: 10px; min-width: 0; padding: 3px; }
      .live-preview { position: sticky; top: 128px; display: grid; gap: 10px; justify-items: center; min-width: 0; }
      .preview-frame { width: min(100%,28vh); }
      .preview-frame :global(div) { width: 100% !important; max-width: 100% !important; box-sizing: border-box; background: #0b0b0b !important; border: 1px solid #444; border-radius: 16px !important; box-shadow: 0 12px 32px #0008 !important; }
      .downloads { width: 100%; font-size: 13px; }
      .downloads summary { cursor: pointer; padding: 10px; color: #cccccc; }
      h2, h3, p { margin: 0; }
      p { color: #bdbdbd; line-height: 1.6; }
      small { display: block; color: #a8a8a8; font-size: 12px; }
      button, select, input { font: inherit; }
      button { min-height: 44px; padding: 10px 18px; border-radius: 12px; border: 1px solid #484848; background: #202020; color: #fff; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
      button:hover:not(:disabled) { background: #303030; border-color: #cccccc; }
      button:disabled { opacity: .4; cursor: default; }
      button:focus-visible, select:focus-visible, input:focus-visible { outline: 3px solid #ffffff; outline-offset: 3px; }
      label { display: grid; gap: 8px; font-size: 13px; color: #dddddd; }
      .file-picker { padding: 18px; border: 1px dashed #555555; border-radius: 16px; background: #161616; }
      input[type=file] { width: 100%; min-width: 0; color: #bdbdbd; }
      input[type=file]::file-selector-button { min-height: 44px; margin-right: 12px; padding: 10px 16px; border: 1px solid #555555; border-radius: 10px; background: #252525; color: white; cursor: pointer; }
      input[type=color] { width: 64px; height: 44px; border: 1px solid #484848; border-radius: 10px; background: #161616; padding: 4px; }
      ol { list-style: none; display: grid; gap: 6px; margin: 0; padding: 0; }
      li { display: grid; grid-template-columns: minmax(105px,1fr) auto minmax(120px,1.25fr); align-items: center; gap: 8px; padding: 8px; border: 1px solid #383838; border-radius: 12px; background: #161616; }
      .trait-choice { gap: 0; }
      .trait-choice span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
      .trait-choice select { font-size: 13px; }
      .background-control { display: flex; align-items: center; gap: 12px; }
      .layer-name { display: flex; gap: 8px; align-items: center; min-width: 0; overflow-wrap: anywhere; font-size: 12px; }
      .order { display: grid; place-items: center; flex-shrink: 0; width: 28px; height: 28px; border-radius: 5px; background: #242424; color: #ffffff; font-family: 'Courier New',monospace; }
      .layer-name small { margin-top: 2px; font-size: 11px; }
      .move-buttons { display: flex; gap: 6px; }
      .move-buttons button { width: 44px; padding: 0; font-size: 20px; }
      select { min-height: 44px; width: 100%; min-width: 0; padding: 9px 12px; border: 1px solid #555555; border-radius: 10px; background: #101010; color: white; }
      .confirm { background: #f0f0f0; color: #111111; border-color: #eeeeee; font-weight: 700; }
      .confirm:hover:not(:disabled) { background: #ffffff; }
      [role=status] { padding: 14px; border-radius: 12px; border: 1px solid #555555; background: #191919; color: #dddddd; }
      @media(max-width:900px) { li { grid-template-columns: 1fr auto; } .trait-choice { grid-column: 1 / -1; } }
      @media(max-width:700px) { .editing-layout { grid-template-columns: 1fr; } .live-preview { position: static; } .preview-frame { width: min(100%,260px); } }
      @media(prefers-reduced-motion:reduce) { button { transition: none; } }
    `}</style>
  </section>;
}
