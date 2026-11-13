"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LocalArtworkPreview from "../local-preview/preview";
import StudioFinishedArtworkDesigner from "../../components/studio/StudioFinishedArtworkDesigner";
import LocalLayers from "./layers";
import PrivateDraftSave from "./private-save";
import DefaultLayouts, { initialLayouts, type ArtworkPreview, type DeviceLayouts } from "./default-layouts";

const steps = ["Your project", "Add artwork", "Default layouts", "Project details", "Review as a holder"];

export default function LocalFounderSetup() {
  const [step, setStep] = useState(0);
  const [demoOpen,setDemoOpen] = useState(false);
  const demoDialog = useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(demoOpen)demoDialog.current?.showModal();else demoDialog.current?.close();},[demoOpen]);
  const [name, setName] = useState("");
  const [stage, setStage] = useState("premint");
  const [mode, setMode] = useState("finished_artwork");
  const [address, setAddress] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [renderProfile, setRenderProfile] = useState<any>({});
  const [layerMap, setLayerMap] = useState<any[]>([]);
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [configured, setConfigured] = useState(false);
  const [artworkPreview,setArtworkPreview] = useState<ArtworkPreview|null>(null);
  const [layoutsConfirmed,setLayoutsConfirmed] = useState(false);
  const layouts:DeviceLayouts = renderProfile.devicePlacement || initialLayouts;
  const changeLayouts = (devicePlacement:DeviceLayouts) => { setRenderProfile((previous:any)=>({...previous,devicePlacement}));setLayoutsConfirmed(false); };
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement | null>(null);
  const invalidateArtwork = useCallback(() => setConfigured(false), []);

  function go(next: number) {
    setMessage(""); setStep(next);
    requestAnimationFrame(()=>{heading.current?.focus(); heading.current?.scrollIntoView({block:"start"});});
  }
  function next() {
    if(step===0 && !name.trim()){setMessage("Add your project name to continue.");return;}
    if(step===1 && !configured){setMessage("Preview and confirm your artwork setup before continuing.");return;}
    if(step===2 && !layoutsConfirmed){setMessage("Confirm your starting layouts before continuing.");return;}
    if(step===3 && !tagline.trim() && !description.trim()){setMessage("Add a short description or tagline for collectors.");return;}
    go(Math.min(4,step+1));
  }
  function downloadDraft() {
    const draft = {
      format:"lockscreened-local-founder-draft", version:1, name:name.trim(),
      stage, artworkMode:mode, collectionAddress:address.trim() || null,
      publicProfile:{tagline:tagline.trim(),description:description.trim()},
      renderProfile, layerMap,
      notice:"Local setup only. No authority verification, on-chain validation, private uploads, or publishing has occurred. Source images are not included.",
    };
    const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:"application/json"}));
    const link=document.createElement("a");link.href=url;link.download="lockscreened-founder-setup.json";link.click();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    setMessage("Setup file downloaded. It contains settings only; keep your original artwork separately.");
  }

  return <main className={`founder-walkthrough ${step===1 || step===2 ? "is-editing" : ""}`}>
    <header>
      <p className="eyebrow">LOCKSCREENED · FOUNDER SETUP</p>
      <h1>Build your collection’s Locker</h1>
      <p>One step at a time. Start before mint or prepare an existing collection.</p>
      <div className="local-note">Preview without a wallet. Artwork stays in this browser. At Review, you can download settings or sign in to save a separate private development draft. Publishing is locked.</div>
      <details><summary>See how it works</summary><p>Upload your artwork, set starting layouts for each device, then preview your own collection as a holder. Holders can personalize their downloads without changing your defaults.</p><button type="button" onClick={()=>setDemoOpen(true)}>Try collector demo · sample artwork →</button></details>
    </header>
    <nav aria-label="Setup progress"><ol>{steps.map((label,i)=><li key={label} aria-current={step===i?"step":undefined}><span>{i+1}</span>{label}</li>)}</ol></nav>
    <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>

    <section hidden={step!==0} aria-label="Your project">
      <label>Project name<input value={name} maxLength={120} onChange={e=>setName(e.target.value)} placeholder="Your collection name" /></label>
      <fieldset><legend>Has your collection minted?</legend>
        <label><input type="radio" name="stage" checked={stage==="premint"} onChange={()=>setStage("premint")} />Not yet · prepare privately before mint</label>
        <label><input type="radio" name="stage" checked={stage==="live"} onChange={()=>setStage("live")} />Yes · my collection is already live</label>
      </fieldset>
      {stage==="live" ? <label>Solana collection address · optional for this walkthrough<input value={address} onChange={e=>setAddress(e.target.value)} spellCheck={false}/></label> : <p>You can prepare artwork now and attach the collection after mint. Nothing goes public before authority is verified.</p>}
      <fieldset><legend>What artwork do you have?</legend><div className="choices">
        <label className="choice"><input type="radio" name="mode" checked={mode==="finished_artwork"} onChange={()=>{setMode("finished_artwork");setConfigured(false);}} />
          <strong>Without layers</strong><span>I have finished NFT images. Keep the NFT intact and build backgrounds around it.</span><small>Fastest setup · no trait folders needed</small></label>
        <label className="choice"><input type="radio" name="mode" checked={mode==="layered_traits"} onChange={()=>{setMode("layered_traits");setConfigured(false);}} />
          <strong>With layers</strong><span>I have the original trait folders. Rebuild NFTs from their layers and manage backgrounds separately.</span><small>More control · requires trait mapping and validation</small></label>
      </div></fieldset>
    </section>

    <section hidden={step!==1} aria-label="Artwork setup">
      {mode==="finished_artwork" ? <StudioFinishedArtworkDesigner artworkOnly sampleImageUrl="/demo/1.png" renderProfile={renderProfile} onLocalChange={invalidateArtwork}
        onPreviewImage={setArtworkPreview}
        onLocalSave={settings=>{setRenderProfile((previous:any)=>({...previous,finishedArtwork:settings}));setConfigured(true);setLayoutsConfirmed(false);}} />
        : <LocalLayers onSourceFiles={setSourceFiles} onPreview={setArtworkPreview} onConfirm={layers=>{setLayerMap(layers);setConfigured(layers.length>0);setLayoutsConfirmed(false);}} />}
      {configured ? <p className="success">Artwork setup confirmed for this local draft.</p> : null}
    </section>

    <section hidden={step!==2} aria-label="Set default layouts">
      <DefaultLayouts name={name} artwork={artworkPreview} layouts={layouts} onChange={changeLayouts} />
      <button className="primary" type="button" onClick={()=>{setRenderProfile((previous:any)=>({...previous,devicePlacement:previous.devicePlacement||initialLayouts}));setLayoutsConfirmed(true);}}>Confirm starting layouts for all devices</button>
      {layoutsConfirmed?<p role="status">Defaults confirmed. Holders can personalize their own wallpapers later.</p>:null}
    </section>

    <section hidden={step!==3} aria-label="Project details">
      <h3>Introduce your collection</h3>
      <label>Short tagline<input value={tagline} maxLength={160} onChange={e=>setTagline(e.target.value)} placeholder="A short introduction for collectors" /></label>
      <label>Description<textarea value={description} maxLength={1200} rows={5} onChange={e=>setDescription(e.target.value)} /></label>
      <p>These details will accompany your public collection page after the project is verified and published.</p>
      <div className="profile-preview"><span>PROJECT PAGE PREVIEW</span><h3>{name || "Your collection"}</h3><strong>{tagline || "Your tagline"}</strong><p>{description || "Your collection description will appear here."}</p></div>
    </section>

    <section hidden={step!==4} aria-label="Review">
      <h3>{name || "Your collection"}</h3><p>{tagline || description}</p>
      <DefaultLayouts holder name={name} artwork={artworkPreview} layouts={layouts} />
      <p>Representative artwork from your setup. After mint, holders select owned NFTs. Background packages, logos and effects are configured in the saved workspace; this preview currently checks artwork and layout.</p>
      <dl><dt>Collection stage</dt><dd>{stage==="premint"?"Pre-mint · prepare privately":"Already live"}</dd><dt>Artwork path</dt><dd>{mode==="finished_artwork"?"Finished NFT images · without layers":`Layered reconstruction · ${layerMap.length} layers`}</dd><dt>Art setup</dt><dd>{configured?"Confirmed locally":"Needs confirmation"}</dd></dl>
      <h3>Before this can go live</h3>
      <ul><li>Sign in with your founder wallet on the connected portal.</li><li>{stage==="premint"?"After mint, attach the real collection and verify current authority.":"Verify current authority over your collection."}</li><li>{mode==="layered_traits"?"Upload private source art, validate reconstruction against real NFTs, and publish approved derivatives.":"Save the finished-artwork treatment to your authenticated project."}</li><li>Check real collector NFT selection and device exports, then publish explicitly.</li></ul>
      <p className="local-note">Collection authority has not been verified. Downloading settings stays local. Only clicking Save private draft after signing in creates a separate private Studio project.</p>
      <button type="button" onClick={downloadDraft}>Download local setup draft</button>{" "}<button type="button" disabled>Publish · verification required</button>
      <PrivateDraftSave sourceFiles={mode==="layered_traits"?sourceFiles:[]} configured={configured&&layoutsConfirmed} settings={{name,stage,artworkMode:mode,collectionAddress:address,publicProfile:{tagline,description},renderProfile,layerMap}} />
    </section>

    {message ? <p role="status">{message}</p> : null}
    <footer><button type="button" disabled={step===0} onClick={()=>go(step-1)}>Back</button>{step<4?<button type="button" className="primary" onClick={next}>Continue →</button>:null}</footer>
    <dialog ref={demoDialog} className="collector-demo" aria-label="Collector demo using sample artwork" onCancel={()=>setDemoOpen(false)} onClose={()=>setDemoOpen(false)}>
      <div className="demo-toolbar"><strong>COLLECTOR DEMO · SAMPLE ARTWORK</strong><button type="button" autoFocus onClick={()=>setDemoOpen(false)}>← Return to setup</button></div>
      {demoOpen ? <LocalArtworkPreview embedded /> : null}
    </dialog>
    <style jsx>{`
      .collector-demo { position: fixed; inset: 0; margin: 0; width: 100%; max-width: none; height: 100dvh; max-height: none; padding: 0; border: 0; background: #090909; color: white; overflow-y: auto; }
      .collector-demo::backdrop { background: #000c; }
      .demo-toolbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 14px 24px; background: #111; border-bottom: 1px solid #444; font-size: 12px; }
      .founder-walkthrough { background-image: repeating-linear-gradient(to bottom,rgba(255,255,255,.018) 0,rgba(255,255,255,.018) 1px,transparent 1px,transparent 4px); }
      .is-editing header { margin-bottom: 12px; }
      .is-editing header h1 { font-size: 26px; margin: 8px 0; }
      .is-editing header > p:not(.eyebrow), .is-editing .local-note, .is-editing header > a { display: none; }
      .is-editing nav ol { margin: 8px 0 12px; }
      .is-editing section { padding: 18px; border-radius: 12px; }
      .founder-walkthrough { color:#f5f5f5; background-color:#090909; padding:36px max(20px,calc((100vw - 1080px)/2)) 70px; font-family:Arial,sans-serif; min-height:100vh; }
      .eyebrow { color:#dedede; letter-spacing:2px; font-size:12px; } h1 { font-size:clamp(30px,5vw,46px); margin:12px 0; } p { color:#bdbdbd; line-height:1.6; } a { color:#e5e5e5; } header { margin-bottom:28px; }
      .local-note { padding:14px; background:#161616; border:1px solid #3c3c3c; border-radius:10px; line-height:1.5; margin:14px 0; font-size:14px; }
      nav ol { list-style:none; padding:0; display:flex; flex-wrap:wrap; gap:12px; } nav li { display:flex; align-items:center; gap:8px; color:#ababab; padding:10px; } nav li[aria-current] { color:#e5e5e5; } nav span { border:1px solid currentColor; border-radius:50%; padding:4px 8px; }
      section { background:#111111; border:1px solid #333333; border-radius:16px; padding:24px; } section[hidden] { display:none; }
      label { display:grid; gap:9px; margin:15px 0; line-height:1.5; } input:not([type=radio]),textarea { width:100%; box-sizing:border-box; background:#1b1b1b; color:#fff; border:1px solid #555555; border-radius:8px; padding:12px; font:inherit; } input[type=radio] { width:20px; height:20px; accent-color:#eeeeee; }
      fieldset { border:1px solid #404040; border-radius:12px; margin:20px 0; padding:16px; } legend { padding:0 8px; } .choices { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; } .choice { background:#1b1b1b; border:1px solid #555555; padding:20px; border-radius:12px; cursor:pointer; } .choice:has(input:checked) { border-color:#eeeeee; } .choice small { color:#e5e5e5; }
      button { border:1px solid #555555; border-radius:9px; background:#242424; color:white; padding:12px 16px; cursor:pointer; font:inherit; } button:disabled { opacity:.45; cursor:not-allowed; } .primary { background:#eeeeee; color:#111111; font-weight:bold; } footer { display:flex; justify-content:space-between; margin-top:24px; } .success { color:#e5e5e5; } .profile-preview { border:1px solid #555555; padding:24px; margin-top:24px; border-radius:12px; } .profile-preview span { color:#dedede; font-size:11px; } dt { color:#ababab; margin-top:12px; } dd { margin:6px 0; } li { line-height:1.7; }
      @media(max-width:700px){.choices{grid-template-columns:1fr;} section{padding:16px;} }
    `}</style>
  </main>;
}
