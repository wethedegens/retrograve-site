"use client";
import { useEffect, useRef, useState } from "react";
import { finishedArtworkLayout, FINISHED_ARTWORK_SIZES, type ArtworkDevice } from "../../lib/lockscreened/finishedArtworkLayout";
import {drawForegroundLogo,type ForegroundLogo} from "../../lib/lockscreened/foregroundLogo";
export type ArtworkPreview = { image?: HTMLImageElement; sources?: string[]; backgroundSource?: string; backgroundSources?: Partial<Record<ArtworkDevice,string>>;decorationSources?:Partial<Record<ArtworkDevice,string>>;logo?:ForegroundLogo|null; color: string; pixelated?: boolean; extensionStyle?: string };
export type Placement = { scale: number; x: "left"|"center"|"right"; y: "top"|"center"|"bottom" };
export type DeviceLayouts = Record<ArtworkDevice,Placement>;
export const initialLayouts: DeviceLayouts = {
  phone:{scale:.92,x:"center",y:"bottom"}, ipad:{scale:.92,x:"center",y:"bottom"}, desktop:{scale:.92,x:"center",y:"bottom"},
};
export default function DefaultLayouts({ artwork, layouts, onChange, holder=false, name }: {
  artwork: ArtworkPreview|null; layouts: DeviceLayouts; onChange?: (layouts:DeviceLayouts)=>void; holder?:boolean; name:string;
}) {
  const [device,setDevice]=useState<ArtworkDevice>("phone");
  const [personal,setPersonal]=useState<Partial<DeviceLayouts>>({});
  const [message,setMessage]=useState("");
  const canvas=useRef<HTMLCanvasElement>(null);
  const imageCache=useRef(new Map<string,Promise<HTMLImageElement>>());
  useEffect(()=>{
    // Keep decoded files while adjusting layouts; drop references to replaced artwork.
    const current=new Set([...(artwork?.sources||[]),artwork?.backgroundSource,...Object.values(artwork?.backgroundSources||{}),...Object.values(artwork?.decorationSources||{}),artwork?.logo?.dataUrl].filter(Boolean));
    for(const key of imageCache.current.keys())if(!current.has(key))imageCache.current.delete(key);
  },[artwork]);
  function cachedImage(url:string){
    let pending=imageCache.current.get(url);
    if(!pending){
      pending=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Could not load sample artwork.'));image.src=url;}).catch(error=>{imageCache.current.delete(url);throw error;});
      imageCache.current.set(url,pending);
    }
    return pending;
  }
  const placement=holder ? personal[device]||layouts[device] : layouts[device];
  function change(value:Partial<Placement>){const next={...placement,...value};if(holder)setPersonal(previous=>({...previous,[device]:next}));else onChange?.({...layouts,[device]:next});}
  useEffect(()=>{
    let active=true;
    const frame=requestAnimationFrame(()=>{void(async()=>{
      try {
        if(!canvas.current)return;
        const [images,background,decoration,logoImage]=await Promise.all([
          artwork?.image ? Promise.resolve([artwork.image]) : Promise.all((artwork?.sources||[]).map(cachedImage)),
          (artwork?.backgroundSources?.[device] || artwork?.backgroundSource) ? cachedImage((artwork?.backgroundSources?.[device] || artwork?.backgroundSource)!) : Promise.resolve(null),
          (artwork?.decorationSources?.[device]||artwork?.decorationSources?.phone)?cachedImage((artwork?.decorationSources?.[device]||artwork?.decorationSources?.phone)!):Promise.resolve(null),
          artwork?.logo?cachedImage(artwork.logo.dataUrl):Promise.resolve(null),
        ]);
        if(!active||!canvas.current)return;
        const size=FINISHED_ARTWORK_SIZES[device];
        const factor=Math.min(1,1000/size.height,1000/size.width);
        const target=document.createElement('canvas');target.width=Math.round(size.width*factor);target.height=Math.round(size.height*factor);
        const ctx=target.getContext('2d');if(!ctx)return;
        ctx.fillStyle=artwork?.color||'#202020';ctx.fillRect(0,0,target.width,target.height);
        if(background){
          const cover=Math.max(target.width/background.width,target.height/background.height);
          ctx.drawImage(background,(target.width-background.width*cover)/2,(target.height-background.height*cover)/2,background.width*cover,background.height*cover);
        }
        if(artwork?.extensionStyle==='gradient'){const gradient=ctx.createLinearGradient(0,0,0,target.height);gradient.addColorStop(0,artwork.color);gradient.addColorStop(1,'#07060d');ctx.fillStyle=gradient;ctx.fillRect(0,0,target.width,target.height);}
        if(artwork?.extensionStyle==='blur'&&images[0]){const image=images[0];const scale=Math.max(target.width/image.width,target.height/image.height);ctx.save();ctx.filter='blur(20px)';ctx.globalAlpha=.72;ctx.drawImage(image,(target.width-image.width*scale)/2,(target.height-image.height*scale)/2,image.width*scale,image.height*scale);ctx.restore();}
        ctx.imageSmoothingEnabled=!artwork?.pixelated;
        if(images.length){const first=images[0];const rect=finishedArtworkLayout(first.width,first.height,target.width,target.height,placement);for(const image of images)ctx.drawImage(image,rect.dx,rect.dy,rect.drawW,rect.drawH);}
        ctx.imageSmoothingEnabled=true;
        if(decoration){const cover=Math.max(target.width/decoration.width,target.height/decoration.height);ctx.drawImage(decoration,(target.width-decoration.width*cover)/2,(target.height-decoration.height*cover)/2,decoration.width*cover,decoration.height*cover);}
        if(logoImage&&artwork?.logo)drawForegroundLogo(ctx,logoImage,target.width,target.height,artwork.logo);
        if(!active||!canvas.current)return;
        const visible=canvas.current;
        if(visible.width!==target.width)visible.width=target.width;
        if(visible.height!==target.height)visible.height=target.height;
        const visibleContext=visible.getContext('2d');
        if(visibleContext){visibleContext.clearRect(0,0,visible.width,visible.height);visibleContext.drawImage(target,0,0);}
        setMessage(images.length?'':'Return to Add artwork to load a representative sample.');
      }catch(error){if(active)setMessage(error instanceof Error?error.message:'Could not preview artwork.');}
    })();});return()=>{active=false;cancelAnimationFrame(frame);};
  },[artwork,device,placement.scale,placement.x,placement.y]);
  return <div className="layouts">
    <div className="controls">
      <h3>{holder?`Preview ${name || 'your collection'} as a holder`:'Set your holders’ starting layout'}</h3>
      <p>{holder?'Try personal adjustments below. They do not change your founder defaults. This sample is not an owned-NFT or wallet verification.':'Choose a recommended size and position for each device. Holders start here and can adjust their own wallpaper later.'}</p>
      <div className="devices">{(['phone','ipad','desktop'] as const).map(value=><button type="button" key={value} aria-pressed={device===value} onClick={()=>setDevice(value)}>{value==='ipad'?'iPad':value[0].toUpperCase()+value.slice(1)}</button>)}</div>
      <label>NFT size · {Math.round(placement.scale*100)}%<input type="range" min="40" max="180" value={Math.round(placement.scale*100)} onChange={event=>change({scale:Number(event.target.value)/100})}/></label>
      <label>Horizontal position<select value={placement.x} onChange={event=>change({x:event.target.value as Placement['x']})}>{['left','center','right'].map(value=><option key={value}>{value}</option>)}</select></label>
      <label>Vertical position<select value={placement.y} onChange={event=>change({y:event.target.value as Placement['y']})}>{['top','center','bottom'].map(value=><option key={value}>{value}</option>)}</select></label>
      {holder?<button type="button" onClick={()=>setPersonal(previous=>{const next={...previous};delete next[device];return next;})}>Reset to founder layout</button>:null}
      <small>100% fits the complete artwork. Larger sizes may crop traits or soften small source images.</small>
      {message?<p role="status">{message}</p>:null}
    </div>
    <canvas ref={canvas} aria-label={`${device} wallpaper layout preview`} style={{aspectRatio:`${FINISHED_ARTWORK_SIZES[device].width}/${FINISHED_ARTWORK_SIZES[device].height}`}} />
    <style jsx>{`
      .layouts{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,340px);gap:24px;align-items:start;color:#eee}
      .controls{display:grid;gap:14px}h3,p{margin:0}p,small{color:#bbb;line-height:1.6}.devices{display:flex;gap:8px}
      button,select{padding:10px 14px;min-height:44px;background:#222;color:#eee;border:1px solid #555;border-radius:8px;font:inherit;cursor:pointer}button[aria-pressed=true]{background:#eee;color:#111}
      label{display:grid;gap:8px}input{width:100%;accent-color:white}canvas{max-width:100%;width:auto;max-height:60vh;justify-self:center;border:8px solid #292929;border-radius:18px;background:#171717}
      button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid white;outline-offset:3px}
      @media(max-width:700px){.layouts{grid-template-columns:1fr}canvas{max-width:300px;width:100%}}
    `}</style>
  </div>;
}
