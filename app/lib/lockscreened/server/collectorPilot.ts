import { privatePilotAvailable } from "../privatePilot";
import { isKnownUnsupportedNft } from "../magapixelAvailability";
import { CollectorError, assertCollectorAsset, assertCollectorTraitMatch } from "../collectorPolicy";
import { matchMetadataToTraitAssets } from "../traitMapping";
import { restAsAdmin } from "./supabaseServer";
import { requireCurrentCollectionAuthority } from "./currentAuthority";

export function assertPilotProject(project:any,user:any,id:string) {
  if(!privatePilotAvailable(id)||!user?.id||!project||project.id!==id||project.created_by!==user.id||project.publish_status!=="draft"||project.flagship||project.legacy_assets_locked||project.source_type!=="solana_collection"||project.render_mode!=="layered_traits")throw new CollectorError("This private collector pilot is not available for this wallet.",404);
  const address=String(project.source_config?.collectionIds?.[0]||"");
  if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)||!Number.isFinite(Date.parse(project.render_profile?.layerOrderConfirmedAt)))throw new CollectorError("Confirm the collection and layer order before testing collectors.",409);
  return address;
}

export async function loadCollectorPilot(id:string,user:any) {
  if(!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)||!privatePilotAvailable(id))throw new CollectorError("Private pilot unavailable.",404);
  const rows=await restAsAdmin<any[]>(`collections?id=eq.${id}&select=id,slug,name,created_by,studio_id,source_type,source_config,publish_status,render_mode,render_profile,flagship,legacy_assets_locked&limit=1`);
  const project=rows?.[0],collection=assertPilotProject(project,user,id);
  const claims=await restAsAdmin<any[]>(`collection_claims?collection_id=eq.${id}&requested_by=eq.${user.id}&status=eq.verified&select=id&limit=1`);
  if(!claims.length)throw new CollectorError("Verify your collection authority before testing collectors.",403);
  await requireCurrentCollectionAuthority({user,collectionAddress:collection});
  return {project,collection};
}

export async function loadPilotLibrary(projectId:string) {
  const layers=await restAsAdmin<any[]>(`trait_layers?collection_id=eq.${projectId}&select=id,trait_type,layer_order,is_background&order=layer_order.asc`);
  if(!layers.length||layers.length>32)throw new CollectorError("Upload and confirm the artwork first.",422);
  const assets=await restAsAdmin<any[]>(`trait_assets?layer_id=in.(${layers.map(layer=>layer.id).join(",")})&select=layer_id,trait_value,storage_path`);
  return layers.map(layer=>({name:layer.trait_type,suggestedOrder:layer.layer_order,likelyBackground:layer.is_background,assets:assets.filter(asset=>asset.layer_id===layer.id).map(asset=>({layerName:layer.trait_type,traitValue:asset.trait_value,relativePath:asset.storage_path}))}));
}

export function pilotNftCard(asset:any,collection:string,wallet:string,library:Awaited<ReturnType<typeof loadPilotLibrary>>) {
  let available=true,reason="";
  try {if(isKnownUnsupportedNft(collection,asset.id))throw new CollectorError("Unsupported NFT.",422);const attributes=assertCollectorAsset(asset,asset.id,collection,wallet);assertCollectorTraitMatch(matchMetadataToTraitAssets(library,attributes),attributes);}
  catch {available=false;reason="Wallpaper artwork for this NFT is not available yet.";}
  const image=String(asset.content?.links?.image||"");
  return {mint:String(asset.id),name:String(asset.content?.metadata?.name||"MAGApixel NFT").slice(0,160),image:image.startsWith("https://")?image:"",available,reason};
}

export function assertPilotBackgroundPath(path:string,project:any,packageId:string) {
  if(!path.startsWith(`${project.studio_id}/collections/${project.id}/backgrounds/${packageId}/`)||path.includes("\\")||path.split("/").some(part=>!part||part==="."||part===".."))throw new CollectorError("Invalid private background.",422);
}

// Published holders never pass through the founder-only draft gate.
export async function loadPublishedCollector(id:string) {
  if(process.env.STUDIO_PRIVATE_COLLECTOR_ENABLED!=="true"||!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))throw new CollectorError("This collector project is not available.",404);
  const rows=await restAsAdmin<any[]>(`collections?id=eq.${id}&select=id,slug,public_slug,name,studio_id,source_type,source_config,publish_status,render_mode,render_profile,flagship,legacy_assets_locked&limit=1`);
  const project=rows?.[0];
  if(!project||project.publish_status!=="published"||project.flagship||project.legacy_assets_locked||project.source_type!=="solana_collection"||project.render_mode!=="layered_traits"||project.render_profile?.collectorRenderer!=="private_layers_v1")throw new CollectorError("This collector project is not available.",404);
  const collection=String(project.source_config?.collectionIds?.[0]||"");
  if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(collection))throw new CollectorError("This project has no verified collection.",409);
  const [claims,runs]=await Promise.all([
    restAsAdmin<any[]>(`collection_claims?collection_id=eq.${id}&status=eq.verified&select=id&limit=1`),
    restAsAdmin<any[]>(`collection_validation_runs?collection_id=eq.${id}&select=status,checked_at&order=checked_at.desc&limit=1`)
  ]);
  if(!claims.length||runs?.[0]?.status!=="passed"||!(Date.parse(runs[0].checked_at)>=Date.parse(project.render_profile.layerOrderConfirmedAt)))throw new CollectorError("The founder must validate the current artwork before rendering.",409);
  return {project,collection};
}
