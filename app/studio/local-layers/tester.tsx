"use client";
import { useEffect, useRef, useState } from "react";
import { analyzeTraitFolder, type ImportedTraitLayer } from "../../lib/lockscreened/traitImport";
import { matchMetadataToTraitAssets, type NftMetadataAttribute } from "../../lib/lockscreened/traitMapping";

type Asset = { path: string; url: string };
export default function LocalLayerLab() {
  const [layers,setLayers]=useState<ImportedTraitLayer[]>([]);
  const [assets,setAssets]=useState<Asset[]>([]);
  const [attributes,setAttributes]=useState<NftMetadataAttribute[]>([]);
  const [name,setName]=useState("");
  const [message,setMessage]=useState("");
  const [warnings,setWarnings]=useState<string[]>([]);
  const [customBackground,setCustomBackground]=useState(false);
  const [color,setColor]=useState("#41346e");
  const [busy,setBusy]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null);
  const urls=useRef<string[]>([]);
  const result=matchMetadataToTraitAssets(layers,attributes);
  const fingerprint=JSON.stringify(result.matched.map(m=>m.asset.relativePath));
  useEffect(()=>()=>urls.current.forEach(url=>URL.revokeObjectURL(url)),[]);
  async function metadata(file: File) {
    if(file.size>1024*1024) throw new Error("Choose metadata JSON under 1 MB.");
    const data=JSON.parse(await file.text());
    if(!Array.isArray(data.attributes)||data.attributes.length>100) throw new Error("Metadata needs an attributes array with up to 100 traits.");
    setAttributes(data.attributes); setName(String(data.name||file.name));
  }
  async function folder(files: File[]) {
    setBusy(true);setMessage("");
    try {
      if(files.length>5000||files.reduce((n,f)=>n+f.size,0)>150*1024*1024||files.filter(f=>/\.(png|webp)$/i.test(f.name)).some(f=>f.size>2*1024*1024)) throw new Error("Maximum 5,000 files, 2 MB per trait image and 150 MB total.");
      const images=files.filter(f=>/\.(png|webp)$/i.test(f.name));
      const analyzed=analyzeTraitFolder(images.map(f=>({name:f.name,relativePath:f.webkitRelativePath||f.name,size:f.size,type:f.type})));
      urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current=[];
      const next:Asset[]=[];
      for(const layer of analyzed.layers) for(const asset of layer.assets) {
        const file=images.find(f=>(f.webkitRelativePath||f.name)===asset.relativePath||(f.webkitRelativePath||f.name).endsWith('/'+asset.relativePath));
        if(!file) throw new Error(`Could not find ${asset.relativePath}.`);
        const url=URL.createObjectURL(file);urls.current.push(url);next.push({path:asset.relativePath,url});
      }
      setLayers(analyzed.layers);setAssets(next);setAttributes([]);setName("");
      setWarnings(analyzed.warnings.map(w=>w.message));
      const json=files.filter(f=>f.name.toLowerCase().endsWith('.json'));
      if(json.length===1) await metadata(json[0]);
      setMessage(json.length===1 ? "Folder and metadata loaded locally. Check the matches and layer order below." : "Folder loaded locally. Choose one NFT metadata JSON next.");
    }catch(error){setMessage(error instanceof Error?error.message:"Could not read folder.");}
    finally{setBusy(false);}
  }
  useEffect(()=>{
    let active=true;
    const ctx=canvas.current?.getContext('2d');
    if(!ctx||!canvas.current)return;
    ctx.clearRect(0,0,canvas.current.width,canvas.current.height);
    if(!result.matched.length)return;
    void(async()=>{
      try{
        const decoded=await Promise.all(result.matched.map(async match=>{
          const source=assets.find(a=>a.path===match.asset.relativePath);
          if(!source)throw new Error("A matched source is missing.");
          const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("Could not decode "+match.asset.relativePath));im.src=source.url;});
          return {image,background:layers.find(l=>l.name===match.asset.layerName)?.likelyBackground};
        }));
        if(!active||!canvas.current)return;
        const first=decoded[0].image;
        if(first.naturalWidth*first.naturalHeight>20_000_000)throw new Error("Source canvas exceeds the 20 megapixel preview limit.");
        if(decoded.some(d=>d.image.naturalWidth!==first.naturalWidth||d.image.naturalHeight!==first.naturalHeight))throw new Error("Layer dimensions differ. Use layers exported on the same canvas.");
        canvas.current.width=first.naturalWidth;canvas.current.height=first.naturalHeight;
        ctx.imageSmoothingEnabled=false;
        if(customBackground){ctx.fillStyle=color;ctx.fillRect(0,0,canvas.current.width,canvas.current.height);}
        for(const d of decoded)if(!(customBackground&&d.background))ctx.drawImage(d.image,0,0);
      }catch(error){if(active)setMessage(error instanceof Error?error.message:"Reconstruction failed.");}
    })();
    return()=>{active=false;};
  },[fingerprint,assets,layers,customBackground,color]);
  return <main style={{maxWidth:1000,margin:"30px auto",padding:24,color:"white",background:"#151020",display:"grid",gap:16}}>
    <h1>Test your trait layers</h1>
    <p>Development test only. Files stay in this browser; nothing uploads, creates a collection claim or publishes. Refresh clears this test.</p>
    <label>1. Choose trait folder<input type="file" multiple accept="image/png,image/webp,.json" disabled={busy} {...({webkitdirectory:"",directory:""} as any)} onChange={event=>{void folder(Array.from(event.target.files||[]));event.target.value="";}} /></label>
    <small>PNG/WebP traits · maximum 2 MB each · 150 MB total · up to 5,000 files. A single metadata JSON inside the folder loads automatically.</small>
    <label>2. Choose sample NFT metadata JSON<input type="file" accept=".json,application/json" disabled={busy||!layers.length} onChange={async event=>{const file=event.target.files?.[0];event.target.value="";if(!file)return;try{await metadata(file);setMessage("Metadata loaded. Review matches below.");}catch(error){setMessage(error instanceof Error?error.message:"Invalid JSON.");}}} /></label>
    <h2>{name||"Metadata matches"}</h2>
    <p>{result.matched.length} matched · {result.missing.length} missing files · {result.unusedMetadata.length} unmapped traits</p>
    {result.missing.map((m,i)=><p key={i}>Missing: {m.traitType} → {m.traitValue}</p>)}
    {result.unusedMetadata.map((m,i)=><p key={i}>Needs mapping: {m.traitType} → {m.traitValue}</p>)}
    <h2>3. Confirm layer order and names</h2>
    <p>Bottom layer first. If metadata uses a different trait name, rename the layer here to match. Source filenames stay unchanged.</p>
    {layers.map((layer,i)=><div key={i} style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <input aria-label={`Layer ${i+1} metadata name`} value={layer.name} onChange={event=>setLayers(previous=>previous.map((l,index)=>index===i?{...l,name:event.target.value,assets:l.assets.map(a=>({...a,layerName:event.target.value}))}:l))} />
      <span>{layer.assets.length} files</span>
      <label><input type="checkbox" checked={layer.likelyBackground} onChange={event=>setLayers(previous=>previous.map((l,index)=>index===i?{...l,likelyBackground:event.target.checked}:l))} />Background layer</label>
      <button disabled={i===0} onClick={()=>setLayers(previous=>{const next=[...previous];[next[i-1],next[i]]=[next[i],next[i-1]];return next.map((l,index)=>({...l,suggestedOrder:index}));})}>Move earlier</button>
      <button disabled={i===layers.length-1} onClick={()=>setLayers(previous=>{const next=[...previous];[next[i+1],next[i]]=[next[i],next[i+1]];return next.map((l,index)=>({...l,suggestedOrder:index}));})}>Move later</button>
    </div>)}
    <label><input type="checkbox" checked={customBackground} onChange={event=>setCustomBackground(event.target.checked)} />Try a replacement background</label>
    {customBackground?<input type="color" aria-label="Replacement background color" value={color} onChange={event=>setColor(event.target.value)} />:null}
    <small>Unchecked uses the original metadata-matched background. Checked omits only designated background layers. Missing matches show an incomplete preview, never a validation pass.</small>
    <canvas ref={canvas} style={{maxWidth:"100%",maxHeight:650,objectFit:"contain",background:"repeating-conic-gradient(#25202c 0% 25%,#39313f 0% 50%) 0 / 20px 20px"}} />
    {warnings.length?<details><summary>Folder warnings ({warnings.length})</summary>{warnings.map((warning,i)=><p key={i}>{warning}</p>)}</details>:null}
    {message?<p role="status">{message}</p>:null}
  </main>;
}
