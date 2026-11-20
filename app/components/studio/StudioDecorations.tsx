"use client";
import {useEffect,useState} from "react";
import {cleanOverlayLibrary,type OverlayOption,type OverlayLibrary} from "../../lib/lockscreened/overlayLibrary";
import {cleanForegroundLogo,type ForegroundLogo} from "../../lib/lockscreened/foregroundLogo";
import {saveLayoutRequest} from "../../lib/lockscreened/saveLayoutRequest";
import {getFreshSession} from "../../lib/lockscreened/web3AuthClient";
import {beginOverlayDraft,removeOverlayDraft} from "../../lib/lockscreened/overlayDraft";

async function preparePng(file:File,transparent:boolean){
  if(file.type!=="image/png"||file.size>8*1024*1024)throw new Error("Choose a PNG up to 8 MB. We prepare a smaller web copy automatically.");
  const url=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Could not open this PNG."));img.src=url;});
    if(image.width*image.height>24_000_000)throw new Error("Choose an image under 24 million pixels.");
    const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image preparation is unavailable.");
    for(const max of [2048,1600,1280,1024,768,512]){
      const factor=Math.min(1,max/image.width,max/image.height);canvas.width=Math.max(1,Math.round(image.width*factor));canvas.height=Math.max(1,Math.round(image.height*factor));ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      if(transparent){const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let clear=false,visible=false;for(let i=3;i<pixels.length;i+=4){if(pixels[i]<255)clear=true;if(pixels[i]>0)visible=true;if(clear&&visible)break;}if(!clear||!visible)throw new Error("Use a PNG with visible artwork and transparent areas so the NFT stays visible.");}
      const dataUrl=canvas.toDataURL("image/png");
      if(dataUrl.length<=699000){const thumb=document.createElement("canvas");thumb.width=120;thumb.height=120;const t=thumb.getContext("2d")!;const scale=Math.min(120/image.width,120/image.height);t.drawImage(image,(120-image.width*scale)/2,(120-image.height*scale)/2,image.width*scale,image.height*scale);return {dataUrl,thumbnail:thumb.toDataURL("image/png")};}
    }
    throw new Error("This PNG is still too large. Try a simpler overlay.");
  }finally{URL.revokeObjectURL(url);}
}
const readLibrary=(value:any):OverlayLibrary=>value||{items:[],defaultId:"none"};
export default function StudioDecorations({collectionId,renderProfile,backgrounds=[],includeLogo=true}:{collectionId:string;renderProfile:any;backgrounds?:any[];includeLogo?:boolean}){
  const saved=JSON.stringify(readLibrary(renderProfile?.overlayLibrary));
  const [library,setLibrary]=useState<OverlayLibrary>(()=>readLibrary(renderProfile?.overlayLibrary));
  const [selected,setSelected]=useState("");const [device,setDevice]=useState<"phone"|"ipad"|"desktop">("phone");
  const [defaultBackgroundId,setDefaultBackgroundId]=useState(renderProfile?.collectorDefaults?.backgroundId||"original");
  const [logo,setLogo]=useState<ForegroundLogo|null>(renderProfile?.foregroundLogo||null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{setLibrary(JSON.parse(saved));},[saved]);
  useEffect(()=>{if(defaultBackgroundId!=="original"&&!backgrounds.some(bg=>bg.id===defaultBackgroundId))setDefaultBackgroundId("original");},[backgrounds,defaultBackgroundId]);
  const item=library.items.find(item=>item.id===selected)||library.items[0];
  function changeItem(change:Partial<OverlayOption>){setLibrary(value=>({...value,items:value.items.map(entry=>entry.id===item?.id?{...entry,...change}:entry)}));setMessage("");}
  function add(){const next=beginOverlayDraft(library,crypto.randomUUID());setLibrary(next.library);setSelected(next.selected);setDevice("phone");setMessage(next.library===library?"Finish the empty overlay below before adding another.":"");}
  function remove(id:string){setLibrary(value=>removeOverlayDraft(value,id));if(selected===id)setSelected("");setMessage("Overlay removed from this draft. Save the gallery to keep this change.");}
  async function choose(file?:File){if(!file||!item)return;setBusy(true);setMessage("");try{const png=await preparePng(file,true);changeItem({images:{...item.images,[device]:png.dataUrl},...(device==="phone"?{thumbnail:png.thumbnail}:{})});}catch(error){setMessage(error instanceof Error?error.message:"Could not prepare overlay.");}finally{setBusy(false);}}
  function snow(){
    if(!item)return;const canvas=document.createElement("canvas");canvas.width=720;canvas.height=1280;const ctx=canvas.getContext("2d")!;
    let seed=56;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<170;i++){ctx.fillStyle=`rgba(255,255,255,${.25+random()*.6})`;ctx.beginPath();ctx.arc(random()*720,random()*1280,1+random()*5,0,Math.PI*2);ctx.fill();}
    const thumb=document.createElement("canvas");thumb.width=120;thumb.height=120;thumb.getContext("2d")!.drawImage(canvas,0,0,120,120);
    changeItem({name:item.name==="New overlay"?"Winter snow":item.name,images:{...item.images,[device]:canvas.toDataURL("image/png")},thumbnail:thumb.toDataURL("image/png")});
  }
  async function save(){setBusy(true);setMessage("");try{const clean=cleanOverlayLibrary(library),session=await getFreshSession();if(!session)throw new Error("Sign in to Studio again.");await saveLayoutRequest({collectionId,action:"collector_decorations",overlayLibrary:clean,defaultBackgroundId},session.access_token);setLibrary(clean);setMessage("Overlay gallery and starting choices saved. Nothing was published.");window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));}catch(error){setMessage(error instanceof Error?error.message:"Could not save overlays.");}finally{setBusy(false);}}
  async function saveLogo(){setBusy(true);setMessage("");try{const session=await getFreshSession();if(!session)throw new Error("Sign in to Studio again.");await saveLayoutRequest({collectionId,action:"foreground_logo",foregroundLogo:logo},session.access_token);setMessage("Project logo saved. Collectors can show or hide it independently of overlays.");window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));}catch(error){setMessage(error instanceof Error?error.message:"Could not save logo.");}finally{setBusy(false);}}
  return <section className="decorations">
    <h2>Overlays &amp; project logo</h2>
    <p>Offer seasonal art above the NFT. Collectors choose one overlay, or None, and can show your logo separately. PNG downloads are still images.</p>
    <label>Starting background<select value={defaultBackgroundId} onChange={event=>setDefaultBackgroundId(event.target.value)}><option value="original">Original background of the collector’s own NFT</option>{backgrounds.map(bg=><option key={bg.id} value={bg.id}>{bg.name}</option>)}</select></label>
    <h3>Overlay gallery <small>{library.items.length} / 10</small></h3>
    <p>Choose a card to edit it. Add creates another option; Remove takes one out. Save the gallery to keep your changes.</p>
    <div className="gallery">{library.items.map(entry=><div className="overlay-card" key={entry.id}><button type="button" disabled={busy} aria-pressed={item?.id===entry.id} onClick={()=>{setSelected(entry.id);setMessage("");}}>{entry.thumbnail?<img className="checker" src={entry.thumbnail} alt=""/>:<span className="empty">PNG</span>}<span>{entry.name}</span><small>{entry.images.phone?"Edit overlay":"Needs PNG · edit below"}</small></button><button type="button" className="remove" disabled={busy} aria-label={`Remove ${entry.name}`} onClick={()=>remove(entry.id)}>Remove</button></div>)}<button type="button" disabled={busy||library.items.length>=10} onClick={add}><span className="empty">＋</span>Add overlay</button></div>
    {item?<div className="edit">
      <label>Overlay name<input value={item.name} maxLength={60} onChange={event=>changeItem({name:event.target.value})}/></label>
      <div className="devices">{(["phone","ipad","desktop"] as const).map(d=><button key={d} type="button" aria-pressed={device===d} onClick={()=>setDevice(d)}>{d==="ipad"?"iPad":d}</button>)}</div>
      <div className="overlay-edit">{(item.images[device]||item.images.phone)?<img className="checker" src={item.images[device]||item.images.phone} alt={`${item.name} preview`}/>:<div className="empty checker">Choose transparent PNG</div>}
        <div><label>{device==="phone"?"Phone PNG · required":"Device PNG · optional"}<input type="file" accept="image/png" disabled={busy} onChange={event=>{void choose(event.target.files?.[0]);event.target.value="";}}/></label><p>Maximum upload: 8 MB. Prepared as a transparent PNG up to 512 KB and 2048 pixels. The gallery can hold 4 MB of prepared images. Missing device versions use phone.</p><button type="button" disabled={busy} onClick={snow}>Try snow sample</button></div>
      </div>
      <button type="button" disabled={busy} onClick={()=>remove(item.id)}>Remove this overlay from draft</button>
    </div>:null}
    <label>Starting overlay<select value={library.defaultId} onChange={event=>setLibrary(value=>({...value,defaultId:event.target.value}))}><option value="none">None</option>{library.items.map(entry=><option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
    <button className="save" type="button" disabled={busy} onClick={()=>void save()}>{busy?"Working…":"Save overlay gallery & defaults"}</button>
    {includeLogo?<div className="logo"><h3>Project logo</h3><p>Place your transparent logo above the NFT and seasonal overlay.</p><label>PNG logo · maximum upload 8 MB<input type="file" accept="image/png" disabled={busy} onChange={async event=>{const file=event.target.files?.[0];event.target.value="";if(!file)return;setBusy(true);try{const png=await preparePng(file,false);setLogo(cleanForegroundLogo({dataUrl:png.dataUrl,width:.2,x:"right",y:"top",defaultVisible:true}));setMessage("");}catch(error){setMessage(error instanceof Error?error.message:"Could not prepare logo.");}finally{setBusy(false);}}}/></label>
      {logo?<><div className="logo-preview checker"><img src={logo.dataUrl} alt="Logo position preview" style={{position:"absolute",width:`${logo.width*100}%`,maxHeight:"25%",objectFit:"contain",left:logo.x==="left"?"4%":logo.x==="center"?"50%":undefined,right:logo.x==="right"?"4%":undefined,top:logo.y==="top"?"4%":logo.y==="center"?"50%":undefined,bottom:logo.y==="bottom"?"4%":undefined,transform:`translate(${logo.x==="center"?"-50%":"0"},${logo.y==="center"?"-50%":"0"})`}}/></div>
      <label>Logo size · {Math.round(logo.width*100)}%<input type="range" min="5" max="50" value={Math.round(logo.width*100)} onChange={event=>setLogo({...logo,width:Number(event.target.value)/100})}/></label>
      <div className="positions"><label>Horizontal<select value={logo.x} onChange={event=>setLogo({...logo,x:event.target.value as ForegroundLogo["x"]})}>{["left","center","right"].map(x=><option key={x}>{x}</option>)}</select></label><label>Vertical<select value={logo.y} onChange={event=>setLogo({...logo,y:event.target.value as ForegroundLogo["y"]})}>{["top","center","bottom"].map(y=><option key={y}>{y}</option>)}</select></label></div>
      <label className="toggle"><input type="checkbox" checked={logo.defaultVisible} onChange={event=>setLogo({...logo,defaultVisible:event.target.checked})}/>Show logo initially · collectors can turn it off</label><button type="button" onClick={()=>setLogo(null)}>Remove logo from draft</button></>:null}
      <button className="save" type="button" disabled={busy} onClick={()=>void saveLogo()}>Save project logo</button></div>:null}
    {message?<p role="status">{message}</p>:null}
    <style jsx>{`
      .overlay-card{display:grid;gap:6px;min-width:0}.overlay-card>button:first-child{width:100%}.overlay-card .remove{padding:7px;font-size:13px;color:#ddd;background:#171717}.overlay-card .remove:hover{border-color:#ddd}
      .decorations{padding:22px;border:1px solid #3a3a3a;border-radius:16px;background:#111;color:#eee;display:grid;gap:16px}h2,h3,p{margin:0}p,small{font-size:13px;color:#bbb;line-height:1.6}label{display:grid;gap:8px}button,input,select{font:inherit;color:#eee}button,select,input:not([type=checkbox]):not([type=range]){padding:11px;border:1px solid #555;border-radius:9px;background:#222;max-width:100%;min-width:0}button{cursor:pointer}button:disabled{opacity:.45;cursor:default}button[aria-pressed=true]{border-color:#fff}.save{background:#eee;color:#111;font-weight:bold}.gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.gallery button{display:grid;gap:8px;text-align:left;min-width:0}.gallery img,.empty{width:100%;height:96px;object-fit:contain;border-radius:7px}.empty{display:grid;place-items:center;font-size:30px;color:#999}.checker{background-color:#222;background-image:conic-gradient(#333 25%,transparent 0 50%,#333 0 75%,transparent 0);background-size:16px 16px}.edit,.logo{display:grid;gap:14px;padding:16px;border:1px solid #444;border-radius:12px}.devices{display:flex;gap:8px}.overlay-edit,.positions{display:grid;grid-template-columns:1fr 1fr;gap:16px}.overlay-edit>img{width:100%;height:240px;object-fit:contain;border-radius:8px}.logo-preview{height:220px;position:relative;border-radius:10px}.toggle{display:flex;align-items:center;gap:8px}input[type=range]{width:100%;accent-color:white}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid white;outline-offset:3px}@media(max-width:700px){.gallery{grid-template-columns:repeat(2,minmax(0,1fr))}.overlay-edit,.positions{grid-template-columns:1fr}}
    `}</style>
  </section>;
}
