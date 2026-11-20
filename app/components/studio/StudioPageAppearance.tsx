"use client";
import { useState } from "react";
import { optimizePageImage } from "../../lib/lockscreened/optimizePageImage";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { cleanPageAppearance, defaultPageBackground, pageBackground, pageBackgroundStyle, type PageAppearance, type PageKind } from "../../lib/lockscreened/pageAppearance";

export default function StudioPageAppearance({ session, collectionId, initial, projectName, collectorHref }: {
  session: LockScreenedSession; collectionId: string; initial: unknown; projectName: string; collectorHref?: string;
}) {
  const [appearance,setAppearance] = useState<PageAppearance>(() => { try { return cleanPageAppearance(initial); } catch { return cleanPageAppearance(null); } });
  const [page,setPage] = useState<PageKind>("welcome");
  const [mobile,setMobile] = useState(false);
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [processing,setProcessing] = useState(false);
  const background = pageBackground(appearance,page);
  function change(values: Partial<typeof background>) {
    setAppearance(previous => { const key = previous.separate ? page : "shared"; return { ...previous, [key]: { ...previous[key], ...values } }; });
    setMessage("Unsaved appearance changes.");
  }
  async function save() {
    setBusy(true);
    try {
      const response = await fetch("/api/studio/update-render-config", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ collectionId, action: "page_appearance", pageAppearance: appearance }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not save appearance.");
      setMessage("Page appearance saved. Draft projects stay private; published projects show saved changes publicly.");
      window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save appearance."); }
    finally { setBusy(false); }
  }
  return <section id="page-appearance" style={{ padding: 20, borderRadius: 22, background: "#100d1d", border: "1px solid #43334c", display: "grid", gap: 16 }}>
    <fieldset disabled={processing || busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "grid", gap: 16 }}>
    <h2 style={{ margin: 0 }}>Page Appearance</h2>
    <p>Decorate your welcome page, NFT gallery and wallpaper editor. These backgrounds never appear in downloaded wallpapers.</p>
    <small>Saving a draft keeps this private. Saving changes to an already published project updates its public pages.</small>
    <label><input type="checkbox" checked={appearance.separate} onChange={event => {
      const separate = event.target.checked;
      setAppearance(previous => ({ ...previous, separate, ...(separate ? { welcome: { ...previous.shared }, gallery: { ...previous.shared }, editor: { ...previous.shared } } : { shared: { ...pageBackground(previous,page) } }) }));
      setMessage("Unsaved appearance changes.");
    }} />Customize each page (otherwise use one background everywhere)</label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{([ ["welcome","Project welcome"], ["gallery","My NFTs gallery"], ["editor","Wallpaper editor"] ] as const).map(([value,label]) =>
      <button key={value} type="button" aria-pressed={page===value} onClick={() => setPage(value)} style={{ padding: 10, background: page===value ? "#b72178" : "#30263e", color: "white", borderRadius: 12 }}>{label}</button>)}</div>
    <label>Upload page background · maximum 8 MB<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy || processing} onChange={async event => {
      const file=event.target.files?.[0]; event.target.value=""; if(!file) return;
      setProcessing(true);
      setMessage("Preparing your image… resizing and compressing automatically.");
      try {
        const image=await optimizePageImage(file);
        cleanPageAppearance({ shared: { image } });
        change({ image });
        setMessage("Image optimized and ready to preview. Save page appearance to keep it. Your original file is unchanged.");
      } catch(error) { setMessage(error instanceof Error ? error.message : "Could not read image."); }
      finally { setProcessing(false); }
    }} /></label>
    <small>PNG, JPEG or WebP · maximum file size: 8 MB per image. We automatically resize and compress a web copy. Your original file stays unchanged. Save when ready.</small>
    <label>Display <select value={background.mode} onChange={event=>change({ mode: event.target.value as "cover"|"repeat" })}><option value="cover">Fill screen</option><option value="repeat">Repeat pattern</option></select></label>
    <label>Horizontal position <input type="range" min="0" max="100" value={background.x} onChange={event=>change({ x:Number(event.target.value) })} /></label>
    <label>Vertical position <input type="range" min="0" max="100" value={background.y} onChange={event=>change({ y:Number(event.target.value) })} /></label>
    <label>Darkness · {background.darkness}% <input type="range" min="0" max="100" value={background.darkness} onChange={event=>change({ darkness:Number(event.target.value) })} /></label>
    <label><input type="checkbox" checked={mobile} onChange={event=>setMobile(event.target.checked)} />Mobile preview</label>
    <div aria-label={`${page} appearance preview`} style={{ ...pageBackgroundStyle(background), width: mobile ? "min(320px,100%)" : "100%", minHeight: 350, borderRadius: 16, overflow: "hidden", backgroundColor: "#191225" }}>
      <div style={{ minHeight: 350, boxSizing: "border-box", background: `rgba(0,0,0,${background.darkness/100})`, padding: 24, display: "grid", alignContent: "center", gap: 16 }}>
        <small>LAYOUT PREVIEW · {projectName}</small>
        <h3>{page==="welcome" ? projectName : page==="gallery" ? `My ${projectName} NFTs` : "Create your wallpaper"}</h3>
        <div style={{ background: "rgba(12,9,24,.8)", borderRadius: 16, padding: 20 }}>
          {page==="welcome" ? collectorHref ? <a href={collectorHref} style={{color:"white",textDecoration:"underline"}}>View my collection →</a> : "Collection button · layout example" : page==="gallery" ? "Your owned NFTs appear here." : "Backgrounds · Effects · Download"}
        </div>
      </div>
    </div>
    <small>Layout preview illustrates background cropping and text contrast. Public pages retain their full controls.</small>
    {collectorHref?<a href={collectorHref} style={{color:"white",padding:12,border:"1px solid #666",borderRadius:10,width:"fit-content"}}>Open my NFTs · private collector test →</a>:null}
    <div style={{ display:"flex", gap: 10 }}>
      <button type="button" disabled={busy} onClick={()=>change({ ...defaultPageBackground })}>Reset this background</button>
      <button type="button" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save page appearance"}</button>
    </div>
    </fieldset>
    {message ? <p role="status">{message}</p> : null}
  </section>;
}
