"use client";

import { useMemo, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { matchMetadataToTraitAssets } from "../../lib/lockscreened/traitMapping";
import StudioReconstructionPreview from "./StudioReconstructionPreview";

export default function StudioPrivateLayerSample({ session, layers, traitAssets }: { session:LockScreenedSession; layers:any[]; traitAssets:any[] }) {
  const [sample, setSample] = useState<{name:string; attributes:any[]}|null>(null);
  const [message,setMessage] = useState("");
  const [revision,setRevision] = useState(0);
  const imported = useMemo(() => layers.map(layer => ({
    name:layer.trait_type, suggestedOrder:Number(layer.layer_order), likelyBackground:Boolean(layer.is_background),
    assets:traitAssets.filter(asset=>asset.layer_id===layer.id).map(asset=>({layerName:layer.trait_type,traitValue:asset.trait_value,relativePath:asset.storage_path})),
  })), [layers,traitAssets]);
  const match = sample ? matchMetadataToTraitAssets(imported,sample.attributes) : null;
  async function readSample(file?:File) {
    setSample(null); setMessage(""); setRevision(value=>value+1);
    if(!file)return;
    try {
      if(file.size>1024*1024)throw new Error("Choose a metadata JSON file under 1 MB.");
      const data=JSON.parse(await file.text());
      if(!Array.isArray(data.attributes)||!data.attributes.length)throw new Error("The metadata needs an attributes array with at least one trait.");
      setSample({name:String(data.name||file.name).slice(0,160),attributes:data.attributes});
    } catch(error) {setMessage(error instanceof Error?error.message:"Could not read sample metadata.");}
  }
  if(!traitAssets.length)return null;
  return <section style={{padding:20,marginTop:16,border:"1px solid #444",borderRadius:12,background:"#111"}}>
    <h2>Check your saved artwork</h2>
    <p>Choose one NFT’s metadata JSON to rebuild it from your privately stored layers. This also works before mint. This sample check does not verify the collection or approve publishing.</p>
    <label>Sample metadata · JSON · maximum 1 MB <input type="file" accept=".json,application/json" onChange={event=>readSample(event.target.files?.[0])}/></label>
    {message?<p role="status">{message}</p>:null}
    {match?<p role="status">{match.matched.length} matched · {match.missing.length} missing · {match.unusedMetadata.length} unmapped</p>:null}
    {match?.missing.map((item,index)=><p key={index}>Missing: {item.traitType} / {item.traitValue}</p>)}
    {sample&&match&&match.matched.length>0&&!match.missing.length?<StudioReconstructionPreview key={revision+JSON.stringify(traitAssets.map(asset=>asset.storage_path))} sampleOnly session={session} nft={{id:"local-sample",name:sample.name}} matched={match.matched}/>:null}
  </section>;
}
