export class CollectorError extends Error {
  status: number;
  constructor(message:string, status=400){super(message);this.status=status;}
}
const sizes:Record<string,number[][]>={
  phone:[[360,800],[1440,3200],[1290,2796],[1179,2556],[1080,2400],[1440,3040]],
  ipad:[[320,427],[2048,2732]], desktop:[[640,360],[2560,1440]],
};
export function cleanCollectorRequest(body:any){
  const slug=String(body?.slug||""); const mint=String(body?.mint||"");
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>120)throw new CollectorError("Choose a valid project.");
  if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint))throw new CollectorError("Choose a valid NFT.");
  const device=String(body?.device||""); const width=Number(body?.width),height=Number(body?.height);
  if(!sizes[device]?.some(([w,h])=>w===width&&h===height))throw new CollectorError("Choose a supported wallpaper size.");
  const p=body?.placement;
  if(p && (!Number.isFinite(p.scale)||p.scale<.4||p.scale>1.8||!["left","center","right"].includes(p.x)||!["top","center","bottom"].includes(p.y)))throw new CollectorError("Invalid artwork placement.");
  const backgroundId=String(body?.backgroundId||"original");
  if(backgroundId!=="original"&&!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(backgroundId))throw new CollectorError("Choose a published background.");
  const overlayId=String(body?.overlayId||"none");
  if(overlayId!=="none"&&!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(overlayId))throw new CollectorError("Choose an offered overlay.");
  return {slug,mint,device:device as "phone"|"ipad"|"desktop",width,height,backgroundId,overlayId,showLogo:body?.showLogo!==false,
    placement:p?{scale:p.scale,x:p.x,y:p.y}:undefined};
}
export function assertCollectorAsset(asset:any,mint:string,collection:string,wallet:string){
  if(!asset||asset.id!==mint||asset.burnt||asset.ownership?.owner!==wallet||asset.ownership?.ownership_model!=="single")throw new CollectorError("This wallet does not own that NFT.",403);
  if(!Array.isArray(asset.grouping)||!asset.grouping.some((group:any)=>group.group_key==="collection"&&group.group_value===collection&&group.verified!==false))throw new CollectorError("That NFT is not in this project's collection.",403);
  if(!Array.isArray(asset.content?.metadata?.attributes)||asset.content.metadata.attributes.length>100)throw new CollectorError("The NFT has no usable trait metadata.",422);
  return asset.content.metadata.attributes;
}
export function assertPrivateTraitPath(path:string,studio:string,collection:string){
  if(!path.startsWith(`${studio}/collections/${collection}/traits/`)||path.includes("\\")||path.split("/").some(segment=>!segment||segment==="."||segment===".."))throw new CollectorError("The saved artwork path is invalid.",422);
}

// Optional layers can be absent from an NFT. Present art traits must map;
// explicitly numeric display-only metadata (for example rarity rank) may be omitted.
export function assertCollectorTraitMatch(match: {matched: Array<{asset:{layerName:string}}>;missing:unknown[];unusedMetadata:Array<{traitType:string}>}, attributes:any[]) {
  if(!match.matched.length||match.missing.length||match.matched.length>32||new Set(match.matched.map(item=>item.asset.layerName)).size!==match.matched.length)throw new CollectorError("This NFT needs additional artwork from the founder.",422);
  const displayOnly=new Set(["number","boost_number","boost_percentage","date"]);
  const unmappedArt=match.unusedMetadata.some(item=>!attributes.some(attribute=>String(attribute?.trait_type||"").trim()===item.traitType&&displayOnly.has(String(attribute?.display_type||"").toLowerCase())));
  if(unmappedArt)throw new CollectorError("Some NFT traits do not have matching artwork yet. The founder needs to complete the layer map.",422);
}
