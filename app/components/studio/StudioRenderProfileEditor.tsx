"use client";



import { useEffect, useMemo, useState } from "react";

import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";

import { updateCollectionRenderPlacement } from "../../lib/lockscreened/studioDataClient";

import { downloadStorageBlob } from "../../lib/lockscreened/studioStorageClient";

import { localArtworkSample } from "../../lib/lockscreened/localArtworkSample";

import { matchMetadataToTraitAssets } from "../../lib/lockscreened/traitMapping";

import DefaultLayouts, { type ArtworkPreview, type DeviceLayouts, type Placement } from "../../studio/local-founder/default-layouts";



const DEFAULTS:DeviceLayouts = {

  phone:{scale:1,x:"center",y:"bottom"}, ipad:{scale:1,x:"center",y:"bottom"}, desktop:{scale:1,x:"center",y:"bottom"},

};

function normalized(value:any, fallback:Placement):Placement {

  const scale=Number(value?.scale);

  return {scale:Number.isFinite(scale)?Math.min(1.8,Math.max(.4,scale)):fallback.scale,

    x:["left","center","right"].includes(value?.x)?value.x:fallback.x,

    y:["top","center","bottom"].includes(value?.y)?value.y:fallback.y};

}

function layouts(profile:any):DeviceLayouts {

  const source=profile?.devicePlacement;

  return {phone:normalized(source?.phone,DEFAULTS.phone),ipad:normalized(source?.ipad,DEFAULTS.ipad),desktop:normalized(source?.desktop,DEFAULTS.desktop)};

}

function decode(url:string) {

  return new Promise<HTMLImageElement>((resolve,reject)=>{

    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Could not open the saved artwork image."));image.src=url;

  });

}



export default function StudioRenderProfileEditor({session,collectionId,renderProfile,layers=[],traitAssets=[],privateBackgrounds=[],privateBackgroundAssets=[]}:{

  session:LockScreenedSession;collectionId:string;renderProfile?:any;layers?:any[];traitAssets?:any[];privateBackgrounds?:any[];privateBackgroundAssets?:any[];

}) {

  const savedKey=JSON.stringify(layouts(renderProfile));

  const [placements,setPlacements]=useState<DeviceLayouts>(()=>layouts(renderProfile));

  const [baseline,setBaseline]=useState(savedKey);

  const [busy,setBusy]=useState(false);

  const [message,setMessage]=useState("");

  const [artwork,setArtwork]=useState<ArtworkPreview|null>(null);

  const [artError,setArtError]=useState("");

  const [loading,setLoading]=useState(false);

  const [attributes,setAttributes]=useState<any[]|null>(null);

  const [sampleName,setSampleName]=useState("");

  const [sampleError,setSampleError]=useState("");

  const [retry,setRetry]=useState(0);
  const [backgroundId,setBackgroundId]=useState("");
  const [overlayId,setOverlayId]=useState("none");
  const [showLogo,setShowLogo]=useState(true);
  const [backgroundSources,setBackgroundSources]=useState<ArtworkPreview["backgroundSources"]>({});
  const [backgroundError,setBackgroundError]=useState("");
  const [backgroundLoading,setBackgroundLoading]=useState(false);
  const selectedBackgroundKey=JSON.stringify(privateBackgroundAssets.filter(asset=>asset.package_id===backgroundId).map(asset=>({device:asset.device,bucket:asset.storage_bucket,path:asset.storage_path})));

  useEffect(()=>{
    let active=true;
    const urls:string[]=[];
    setBackgroundSources({});setBackgroundError("");
    if(!backgroundId){setBackgroundLoading(false);return;}
    setBackgroundLoading(true);
    void(async()=>{
      try {
        const assets: Array<{device:string;bucket:string;path:string}>=JSON.parse(selectedBackgroundKey);
        if(!assets.some(asset=>asset.device==="phone"))throw new Error("This package has no saved phone source yet.");
        const loaded=await Promise.all(assets.filter(asset=>["phone","ipad","desktop"].includes(asset.device)).map(async asset=>{
          if(asset.bucket!=="creator-source-private")throw new Error("Unexpected background storage.");
          const blob=await downloadStorageBlob({session,bucket:asset.bucket,path:asset.path});
          if(!active)return null;
          const url=URL.createObjectURL(blob);urls.push(url);
          return {device:asset.device,url};
        }));
        if(!active)return;
        const phone=loaded.find(asset=>asset?.device==="phone")?.url;
        setBackgroundSources({phone,ipad:loaded.find(asset=>asset?.device==="ipad")?.url||phone,desktop:loaded.find(asset=>asset?.device==="desktop")?.url||phone});
      }catch(error){if(active)setBackgroundError(error instanceof Error?error.message:"Could not preview the saved background.");}
      finally{if(active)setBackgroundLoading(false);}
    })();
    return()=>{active=false;urls.forEach(URL.revokeObjectURL);};
  },[backgroundId,selectedBackgroundKey,session.access_token]);

  const previewArtwork=useMemo(()=>{
    if(!artwork)return null;
    const selectedOverlay=renderProfile?.overlayLibrary?.items?.find((item:any)=>item.id===overlayId);
    const decorated={...artwork,decorationSources:selectedOverlay?.images,logo:showLogo?renderProfile?.foregroundLogo:null};
    if(!backgroundId||!backgroundSources?.phone)return decorated;
    const keepOriginal=renderProfile?.backgroundHandling!=="omit_original_when_custom";
    return {...decorated,backgroundSource:undefined,backgroundSources,
      sources:keepOriginal&&artwork.backgroundSource?[artwork.backgroundSource,...(artwork.sources||[])]:artwork.sources};
  },[artwork,backgroundId,backgroundSources,renderProfile,overlayId,showLogo]);

  // Unrelated workspace refreshes must not erase unsaved slider changes.

  useEffect(()=>{setPlacements(JSON.parse(savedKey));setBaseline(savedKey);},[savedKey]);

  const selected=useMemo(()=>{

    const ordered=[...layers].sort((a,b)=>a.layer_order-b.layer_order);

    if(!attributes)return ordered.flatMap(layer=>{

      const asset=traitAssets.filter(asset=>asset.layer_id===layer.id).sort((a,b)=>a.trait_value.localeCompare(b.trait_value))[0];

      return asset?[{path:asset.storage_path,background:Boolean(layer.is_background)}]:[];

    });

    const imported=ordered.map(layer=>({name:layer.trait_type,suggestedOrder:layer.layer_order,likelyBackground:Boolean(layer.is_background),

      assets:traitAssets.filter(asset=>asset.layer_id===layer.id).map(asset=>({layerName:layer.trait_type,traitValue:asset.trait_value,relativePath:asset.storage_path}))}));

    return matchMetadataToTraitAssets(imported,attributes).matched.map(item=>({path:item.asset.relativePath,background:Boolean(ordered.find(layer=>layer.trait_type===item.asset.layerName)?.is_background)}));

  },[layers,traitAssets,attributes]);

  const sourceKey=JSON.stringify(selected);

  const treatmentKey=JSON.stringify(renderProfile?.finishedArtwork||{});

  useEffect(()=>{

    let active=true;

    const urls:string[]=[];

    setLoading(true);setArtError("");setArtwork(null);

    void(async()=>{

      try {

        const sources:typeof selected=JSON.parse(sourceKey);

        if(sources.length){

          const loaded=await Promise.all(sources.map(async source=>{

            const blob=await downloadStorageBlob({session,bucket:"creator-source-private",path:source.path});

            if(!active)return null;

            const url=URL.createObjectURL(blob);urls.push(url);

            return {...source,url};

          }));

          if(!active)return;

          const available=loaded.filter((item):item is NonNullable<typeof item>=>item!==null);

          setArtwork({sources:available.filter(item=>!item.background).map(item=>item.url),backgroundSource:available.find(item=>item.background)?.url,color:"#171717",pixelated:true});

        }else{

          const file=await localArtworkSample(JSON.stringify([session.user.id,collectionId]));

          if(!active)return;

          if(!file)throw new Error("No preview sample is available yet. Upload trait artwork above, or choose a representative NFT in the finished-artwork section.");

          const url=URL.createObjectURL(file);urls.push(url);

          const image=await decode(url);

          if(!active)return;

          const treatment=JSON.parse(treatmentKey);

          setArtwork({image,color:treatment.sampledColor||"#171717",extensionStyle:treatment.extensionStyle||"edge_color"});

        }

      }catch(error){if(active)setArtError(error instanceof Error?error.message:"Could not load saved artwork.");}

      finally{if(active)setLoading(false);}

    })();

    return()=>{active=false;urls.forEach(URL.revokeObjectURL);};

  },[sourceKey,treatmentKey,session.access_token,session.user.id,collectionId,retry]);



  async function chooseMetadata(file?:File){

    if(!file)return;

    setSampleError("");

    try{

      if(file.size>1024*1024)throw new Error("Choose a metadata JSON under 1 MB.");

      const data=JSON.parse(await file.text());

      if(!Array.isArray(data.attributes)||!data.attributes.length)throw new Error("This JSON needs an attributes array.");

      const imported=layers.map(layer=>({name:layer.trait_type,suggestedOrder:layer.layer_order,likelyBackground:Boolean(layer.is_background),assets:traitAssets.filter(asset=>asset.layer_id===layer.id).map(asset=>({layerName:layer.trait_type,traitValue:asset.trait_value,relativePath:asset.storage_path}))}));

      const match=matchMetadataToTraitAssets(imported,data.attributes);

      if(!match.matched.length||match.missing.length)throw new Error(`Sample has ${match.missing.length} missing traits. Keeping the previous preview.`);

      setAttributes(data.attributes);setSampleName(String(data.name||file.name));

    }catch(error){setSampleError(error instanceof Error?error.message:"Could not read sample metadata.");}

  }

  async function save(){

    if(busy)return;

    const snapshot=placements;

    setBusy(true);setMessage("");

    try{

      await updateCollectionRenderPlacement({session,collectionId,currentRenderProfile:renderProfile,devicePlacement:snapshot});

      setBaseline(JSON.stringify(snapshot));setMessage("Starting layouts saved for phone, iPad and desktop.");

    }catch(error){setMessage(error instanceof Error?error.message:"Could not save placement.");}

    finally{setBusy(false);}

  }

  const dirty=JSON.stringify(placements)!==baseline;

  return <section className="placement-editor">

    <div className="eyebrow">HOLDERS’ STARTING LAYOUTS</div>

    {layers.length?<details><summary>Preview sample: {sampleName||"first saved trait from each layer"}</summary>

      <p>This sample helps you position the artwork. To preview a particular NFT, choose its metadata. The sample choice does not change your collection.</p>

      <label>Sample metadata · JSON · maximum 1 MB <input type="file" accept=".json,application/json" onChange={event=>void chooseMetadata(event.target.files?.[0])}/></label>

      {sampleError?<p role="alert">{sampleError}</p>:null}

    </details>:null}

    {loading?<p role="status">Loading your saved artwork…</p>:null}

    {artError?<p role="alert">{artError} <button type="button" onClick={()=>setRetry(value=>value+1)}>Retry preview</button></p>:null}

    {layers.length&&privateBackgrounds.length?<div style={{display:"grid",gap:8,marginBottom:16}}>
      <label htmlFor={`private-background-${collectionId}`}>Preview background</label>
      <select id={`private-background-${collectionId}`} value={backgroundId} onChange={event=>setBackgroundId(event.target.value)} style={{padding:12,borderRadius:8,background:"#222",color:"#eee",border:"1px solid #555"}}>
        <option value="">Original NFT background</option>
        {privateBackgrounds.filter(background=>privateBackgroundAssets.some(asset=>asset.package_id===background.id)).map(background=><option key={background.id} value={background.id}>{background.name}</option>)}
      </select>
      <small>Preview only. Each device uses its saved image; missing iPad or desktop images use the phone source. Saving layouts saves size and position, not this selection.</small>
      {backgroundId&&renderProfile?.backgroundHandling!=="omit_original_when_custom"?<small>Original background is kept over this image. To replace it, enable “Remove the NFT’s original background” in layer configuration.</small>:null}
      {backgroundLoading?<span role="status">Loading private background…</span>:null}
      {backgroundError?<span role="alert">{backgroundError}</span>:null}
    </div>:null}

    {renderProfile?.overlayLibrary?.items?.length?<label style={{display:"grid",gap:8,marginBottom:16}}>Preview overlay<select value={overlayId} onChange={event=>setOverlayId(event.target.value)} style={{padding:12,borderRadius:8,background:"#222",color:"#eee",border:"1px solid #555"}}><option value="none">None</option>{renderProfile.overlayLibrary.items.map((item:any)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>:null}
    {renderProfile?.foregroundLogo?<label style={{display:"flex",gap:8,marginBottom:16}}><input type="checkbox" checked={showLogo} onChange={event=>setShowLogo(event.target.checked)}/>Show project logo in preview</label>:null}

    <fieldset disabled={busy}>

      <DefaultLayouts name="your collection" artwork={previewArtwork} layouts={placements} onChange={next=>{setPlacements(next);setMessage("");}}/>

    </fieldset>

    <div className="save-row"><button className="save" type="button" onClick={()=>void save()} disabled={busy}>{busy?"Saving…":"Save starting layouts"}</button>

      <span role="status">{message||(dirty?"Unsaved changes":"No unsaved changes · these settings match your saved defaults")}</span>

    </div>

    <style jsx>{`

      .placement-editor{padding:20px;border:1px solid #3a3a3a;border-radius:16px;background:#111;color:#eee}

      .eyebrow{font-size:11px;letter-spacing:.12em;color:#bbb;margin-bottom:16px}

      details{margin-bottom:16px;font-size:13px;color:#ccc}summary{cursor:pointer}p{line-height:1.6}

      fieldset{border:0;margin:0;padding:0;min-width:0}fieldset:disabled{opacity:.7}

      .save-row{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-top:20px;font-size:13px;color:#ccc}

      button{border:1px solid #555;border-radius:8px;padding:10px 16px;cursor:pointer;font:inherit}.save{background:#eee;color:#111;font-weight:bold}button:disabled{opacity:.45;cursor:not-allowed}

    `}</style>

  </section>;

}
