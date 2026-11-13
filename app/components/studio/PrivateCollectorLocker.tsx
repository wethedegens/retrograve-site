"use client";
import Link from "next/link";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { extractSolanaWalletAddress } from "../../lib/lockscreened/authIdentity";
import { getFreshSession, signInWithSolana, type LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import {decodeCollectorPreview,drawCollectorPreview,type CollectorPreview} from "../../lib/lockscreened/collectorPreview";
import CollectorBackgroundThumbnail from "./CollectorBackgroundThumbnail";

type Device = "phone" | "ipad" | "desktop";
type Placement = { scale: number; x: "left" | "center" | "right"; y: "top" | "center" | "bottom" };
type Project = { slug: string; name: string; render_profile?: any; backgrounds: Array<{ id: string; name: string; deviceAssets: Record<string,string> }>;overlays?:Array<{id:string;name:string;thumbnail?:string}> };
const presets: Array<{ label: string; device: Device; width: number; height: number }> = [
  {label:"Phone · Master",device:"phone",width:1440,height:3200},
  {label:"iPhone Pro Max",device:"phone",width:1290,height:2796},
  {label:"iPhone Pro",device:"phone",width:1179,height:2556},
  {label:"Android · 20:9",device:"phone",width:1080,height:2400},
  {label:"Android · QHD+",device:"phone",width:1440,height:3040},
  {label:"iPad",device:"ipad",width:2048,height:2732},
  {label:"Desktop",device:"desktop",width:2560,height:1440},
];
const previewSize={phone:{width:360,height:800},ipad:{width:320,height:427},desktop:{width:640,height:360}};
function startingPlacement(profile:any,device:Device):Placement {
  const p=profile?.devicePlacement?.[device]||{};
  return {scale:Math.max(.4,Math.min(1.8,Number(p.scale)||.92)),x:["left","center","right"].includes(p.x)?p.x:"center",y:["top","center","bottom"].includes(p.y)?p.y:"bottom"};
}

// Interactive movement uses only small server-merged preview derivatives.
// Original trait files and signed private-source URLs never enter this flow.
export default function PrivateCollectorLocker({project,pilotProjectId,originalThumbnail}:{project:Project;pilotProjectId?:string;originalThumbnail?:string}) {
  const mint=useSearchParams().get("mint")||"";
  const wallet=useWallet();const address=wallet.publicKey?.toBase58()||"";
  const [session,setSession]=useState<LockScreenedSession|null>(null);
  const [preset,setPreset]=useState(0);const device=presets[preset].device;
  const [placements,setPlacements]=useState<Record<Device,Placement>>(()=>({phone:startingPlacement(project.render_profile,"phone"),ipad:startingPlacement(project.render_profile,"ipad"),desktop:startingPlacement(project.render_profile,"desktop")}));
  const [backgroundId,setBackgroundId]=useState(()=>project.backgrounds.some(bg=>bg.id===project.render_profile?.collectorDefaults?.backgroundId)?project.render_profile.collectorDefaults.backgroundId:"original");
  const [overlayId,setOverlayId]=useState(()=>project.overlays?.some(item=>item.id===project.render_profile?.collectorDefaults?.overlayId)?project.render_profile.collectorDefaults.overlayId:"none");
  const [showLogo,setShowLogo]=useState(project.render_profile?.foregroundLogo?.defaultVisible!==false);
  const [preview,setPreview]=useState<CollectorPreview|null>(null);
  const [savedImage,setSavedImage]=useState<{url:string;file:File}|null>(null);
  const canvas=useRef<HTMLCanvasElement>(null);
  const previewCache=useRef(new Map<string,{preview:CollectorPreview;expires:number}>());
  const [busy,setBusy]=useState(false);const [signing,setSigning]=useState(false);const [exporting,setExporting]=useState(false);const [message,setMessage]=useState("");
  const authorized=Boolean(address&&extractSolanaWalletAddress(session?.user)===address);
  const placement=placements[device];

  useEffect(()=>{
    let active=true;
    const sync=async()=>{const current=await getFreshSession();if(active)setSession(current);};
    void sync();window.addEventListener("lockscreened-auth-changed",sync);
    return ()=>{active=false;window.removeEventListener("lockscreened-auth-changed",sync);};
  },[]);
  useEffect(()=>{setPreview(null);previewCache.current.clear();},[mint,address]);

  const requestRender=useCallback(async(width:number,height:number,signal:AbortSignal,previewParts:boolean,requestedPlacement?:Placement,requestedLogo=true)=>{
    const current=await getFreshSession();
    if(!current||!address||extractSolanaWalletAddress(current.user)!==address)throw new Error("Sign in with the connected wallet to continue.");
    const response=await fetch("/api/studio/collector-wallpaper",{method:"POST",cache:"no-store",signal,
      headers:{"content-type":"application/json",Authorization:"Bearer "+current.access_token},
      body:JSON.stringify({slug:project.slug,mint,device,width,height,placement:requestedPlacement,backgroundId,overlayId,showLogo:requestedLogo,pilotProjectId,previewParts})});
    if(!response.ok){const data=await response.json().catch(()=>null);throw new Error(data?.error||"The wallpaper could not be made. Try again.");}
    return response;
  },[address,project.slug,mint,device,backgroundId,overlayId,pilotProjectId]);

  useEffect(()=>{
    if(!authorized||!mint){setPreview(null);setBusy(false);return;}
    const key=JSON.stringify([address,mint,device,backgroundId,overlayId]),cached=previewCache.current.get(key);
    if(cached&&cached.expires>Date.now()){setPreview(cached.preview);setBusy(false);setMessage("");return;}
    const controller=new AbortController();let active=true;
    setBusy(true);setMessage("");
    void(async()=>{
      const deadline=window.setTimeout(()=>controller.abort(),30000);
      try{
        const size=previewSize[device];const response=await requestRender(size.width,size.height,controller.signal,true);
        if(!response.headers.get("content-type")?.startsWith("application/json"))throw new Error("The server did not return an interactive preview.");
        const decoded=await decodeCollectorPreview(await response.json());
        if(active){if(previewCache.current.size>=6)previewCache.current.delete(previewCache.current.keys().next().value!);previewCache.current.set(key,{preview:decoded,expires:Date.now()+60000});setPreview(decoded);}
      }catch(error){if(active)setMessage(controller.signal.aborted?"Preview timed out. Switch backgrounds to retry.":error instanceof Error?error.message:"Preview unavailable.");}
      finally{window.clearTimeout(deadline);if(active)setBusy(false);}
    })();
    return ()=>{active=false;controller.abort();};
  },[authorized,address,mint,device,backgroundId,overlayId,requestRender]);

  useEffect(()=>{
    if(!preview||!canvas.current)return;
    const frame=requestAnimationFrame(()=>{if(canvas.current)drawCollectorPreview(canvas.current,preview,placement,showLogo);});
    return()=>cancelAnimationFrame(frame);
  },[preview,placement.scale,placement.x,placement.y,showLogo]);

  async function signIn(){
    setSigning(true);setMessage("");
    try{setSession(await signInWithSolana({publicKey:wallet.publicKey,signMessage:wallet.signMessage},"collector"));}
    catch(error){setMessage(error instanceof Error?error.message:"Wallet sign-in failed.");}
    finally{setSigning(false);}
  }
  async function download(){
    setExporting(true);setMessage("");const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),60000);
    try{
      const size=presets[preset];const response=await requestRender(size.width,size.height,controller.signal,false,placement,showLogo);
      if(!response.headers.get("content-type")?.startsWith("image/png"))throw new Error("The server did not return a wallpaper.");
      const blob=await response.blob();
      const filename=`${project.slug}-${mint.slice(0,8)}-${size.width}x${size.height}.png`;
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
        const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Could not prepare the saved image."));reader.readAsDataURL(blob);});
        setSavedImage({url,file:new File([blob],filename,{type:"image/png"})});
        return;
      }
      const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`${project.slug}-${mint.slice(0,8)}-${size.width}x${size.height}.png`;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(error){setMessage(controller.signal.aborted?"Download timed out. Please try again.":error instanceof Error?error.message:"Download unavailable.");}
    finally{window.clearTimeout(timer);setExporting(false);}
  }
  const update=(change:Partial<Placement>)=>setPlacements(value=>({...value,[device]:{...value[device],...change}}));
  return <section className="private-collector">
    {savedImage?<div role="dialog" aria-modal="true" aria-label="Save your wallpaper" style={{position:"fixed",inset:0,zIndex:1200,background:"#111",overflowY:"auto",padding:20,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <h2>Your wallpaper is ready</h2>
      <p>Touch and hold the image, then choose Save Image or Add to Photos.</p>
      {typeof navigator!=="undefined" && navigator.canShare?.({files:[savedImage.file]})?<button type="button" onClick={()=>void navigator.share({files:[savedImage.file]}).catch(error=>{if(error?.name!=="AbortError")setMessage("Touch and hold the image to save it instead.");})}>Share or save image</button>:null}
      <button type="button" onClick={()=>setSavedImage(null)}>Back to editor</button>
      <img src={savedImage.url} alt="Your finished wallpaper" style={{maxWidth:"100%",maxHeight:"70dvh",objectFit:"contain"}}/>
    </div>:null}
    <aside>
      <Link prefetch={false} href={pilotProjectId?`/studio/pilot/${pilotProjectId}`:`/projects/${project.slug}/collection`}>← My {project.name} NFTs</Link>
      <h1>Your wallpaper</h1>
      <p className="intro">Choose a background and make it yours.</p>
      {!authorized?<div className="login">
        <p>{address?"Sign a login message to confirm NFT ownership. No transaction or token approval is requested.":"Connect your Solana wallet using the button above."}</p>
        <button type="button" disabled={!address||signing} onClick={signIn}>{signing?"Waiting for wallet…":"Verify my wallet"}</button>
      </div>:null}
      <fieldset disabled={!authorized||exporting}>
        <label>Device<select value={preset} onChange={event=>setPreset(Number(event.target.value))}>{presets.map((item,index)=><option key={item.label} value={index}>{item.label} · {item.width}×{item.height}</option>)}</select></label>
        <div>Backgrounds <span className="count">{project.backgrounds.length+1}</span></div>
        <small>Your NFT’s original background, plus extras offered by the founder.</small>
        <div className="backgrounds">
          <button type="button" aria-pressed={backgroundId==="original"} onClick={()=>setBackgroundId("original")}>{originalThumbnail?<img src={originalThumbnail} alt=""/>:<span className="thumb-placeholder">Original</span>}<span>Original NFT background</span></button>
          {project.backgrounds.map(item=><button type="button" key={item.id} aria-pressed={backgroundId===item.id} onClick={()=>setBackgroundId(item.id)}>
            {item.deviceAssets.phone?<img src={item.deviceAssets.phone} alt="" loading="lazy"/>:pilotProjectId?<CollectorBackgroundThumbnail projectId={pilotProjectId} backgroundId={item.id}/>:<span className="thumb-placeholder">▧</span>}<span>{item.name}</span>
          </button>)}
        </div>
        <div>Overlays <span className="count">{project.overlays?.length||0}</span></div>
        <div className="backgrounds overlays"><button type="button" aria-pressed={overlayId==="none"} onClick={()=>setOverlayId("none")}><span className="thumb-placeholder checker">⊘</span><span>None</span></button>{(project.overlays||[]).map(item=><button key={item.id} type="button" aria-pressed={overlayId===item.id} onClick={()=>setOverlayId(item.id)}>{item.thumbnail?<img className="checker" src={item.thumbnail} alt=""/>:<span className="thumb-placeholder checker">✧</span>}<span>{item.name}</span></button>)}</div>
        {!project.overlays?.length?<small>The founder hasn’t added seasonal overlays yet.</small>:null}
        {project.render_profile?.foregroundLogo?<label className="toggle"><input type="checkbox" checked={showLogo} onChange={event=>setShowLogo(event.target.checked)}/> Show project logo</label>:null}
        <label>NFT size · {Math.round(placement.scale*100)}%<input type="range" min="40" max="180" value={Math.round(placement.scale*100)} onChange={event=>update({scale:Number(event.target.value)/100})}/></label>
        <div className="positions"><label>Horizontal position<select value={placement.x} onChange={event=>update({x:event.target.value as Placement["x"]})}>{["left","center","right"].map(value=><option key={value}>{value}</option>)}</select></label>
        <label>Vertical position<select value={placement.y} onChange={event=>update({y:event.target.value as Placement["y"]})}>{["top","center","bottom"].map(value=><option key={value}>{value}</option>)}</select></label></div>
        <button type="button" onClick={()=>setPlacements(value=>({...value,[device]:startingPlacement(project.render_profile,device)}))}>Reset this device to founder layout</button>
        <p className="note">Your choices change this download only. Above 100% may crop artwork or soften small images.</p>
      </fieldset>
      <div className="save-bar"><button type="button" className="save" disabled={!authorized||exporting||!mint} onClick={download}>{exporting?"Making your wallpaper.":"Save PNG"}</button>
      <div role="status" aria-live="polite">{message||(!mint?"Choose an NFT from your collection first.":busy?"Updating preview…":"")}</div>
      </div>
    </aside>
    <div className="preview" aria-busy={busy}>
      {authorized&&preview?<canvas ref={canvas} aria-label="Your wallpaper preview" style={{aspectRatio:`${preview.width}/${preview.height}`}}/>:<div className="placeholder">{authorized?"Your wallpaper preview will appear here.":"Verify your wallet to preview your NFT."}</div>}
    </div>
    <style jsx>{`
      .private-collector{display:grid;grid-template-columns:minmax(300px,420px) minmax(0,1fr);gap:28px;align-items:start;color:#eee}
      aside{box-sizing:border-box;position:sticky;top:100px;height:min(820px,calc(100dvh - 240px));display:flex;flex-direction:column;min-height:0;padding:20px;border:1px solid #333;border-radius:18px;background:rgba(16,16,16,.94)}
      h1{margin:12px 0 6px;font-size:28px}.intro{margin:4px 0 0;font-size:13px}p{color:#bcbcbc;line-height:1.6;font-size:14px}a{color:#ddd;font-size:13px}
      fieldset{border:0;padding:2px 5px 4px 0;margin:12px 0;display:grid;gap:10px;grid-auto-rows:max-content;min-width:0;min-height:0;overflow-y:auto;flex:1;align-content:start;scrollbar-width:thin}label{display:grid;gap:5px;font-size:13px}.positions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.save-bar{flex-shrink:0;border-top:1px solid #333;padding-top:12px;background:#101010}.save-bar [role=status]:empty{display:none}
      select,button{font:inherit;background:#222;color:#eee;border:1px solid #484848;border-radius:10px;padding:9px;width:100%}button{cursor:pointer;font-size:13px}button:disabled{opacity:.45;cursor:default}
      input[type=range]{width:100%;accent-color:#eee}button[aria-pressed=true]{border-color:white;background:#353535}.save{background:#eee;color:#111;font-weight:700}.note{font-size:12px;margin:0}
      .backgrounds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;max-height:180px;min-height:106px;overflow-y:auto;padding:3px}.backgrounds button{display:grid;gap:5px;padding:5px;align-content:start;font-size:12px}.backgrounds img{width:100%;height:68px;object-fit:cover;border-radius:5px}.overlays img{object-fit:contain}.thumb-placeholder{height:68px;display:grid;place-items:center;background:#303030;border-radius:6px;font-size:24px}.count,small{font-size:12px;color:#aaa}.count{margin-left:6px}.checker{background-color:#222;background-image:conic-gradient(#444 25%,transparent 0 50%,#444 0 75%,transparent 0);background-size:12px 12px}
      .toggle input{width:auto}.toggle{display:flex;align-items:center}.preview{position:sticky;top:100px;display:grid;place-items:center;min-width:0}.preview>canvas{max-width:100%;max-height:min(808px,calc(100dvh - 252px));width:auto;object-fit:contain;border:6px solid #292929;border-radius:18px}
      .preview[aria-busy=true]>canvas{opacity:.55}.placeholder{padding:32px;border:1px dashed #555;border-radius:14px;color:#bbb;text-align:center}.login{border-bottom:1px solid #333;padding-bottom:18px}[role=status]{font-size:13px;line-height:1.6}
      @media(max-width:760px){aside{position:static;height:auto}fieldset{overflow:visible;flex:none}.private-collector{grid-template-columns:1fr}.backgrounds{grid-template-columns:repeat(2,minmax(0,1fr))}.preview{position:static;grid-row:1}.preview>canvas{max-height:52vh}}
    `}</style>
  </section>;
}
