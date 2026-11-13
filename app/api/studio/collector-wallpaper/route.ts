import { privatePilotAvailable } from "../../../lib/lockscreened/privatePilot";
import { isKnownUnsupportedNft } from "../../../lib/lockscreened/magapixelAvailability";
import { NextResponse } from "next/server";
import { extractSolanaWalletAddress } from "../../../lib/lockscreened/authIdentity";
import { CollectorError,cleanCollectorRequest,assertCollectorAsset,assertPrivateTraitPath,assertCollectorTraitMatch } from "../../../lib/lockscreened/collectorPolicy";
import { matchMetadataToTraitAssets } from "../../../lib/lockscreened/traitMapping";
import { composePrivateWallpaper,composePrivatePreview } from "../../../lib/lockscreened/server/privateWallpaper";
import { getAuthenticatedUser,hasSupabaseAdminKey,isTrustedStudioRequestOrigin,restAsAdmin,consumeStudioActionRateLimit,readStudioRenderObject } from "../../../lib/lockscreened/server/supabaseServer";
import {loadCollectorPilot,assertPilotBackgroundPath} from "../../../lib/lockscreened/server/collectorPilot";
import {chooseOverlay} from "../../../lib/lockscreened/overlayLibrary";

export const dynamic="force-dynamic";
export const runtime="nodejs";
let activeRenders=0;
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function POST(request:Request){
  let acquired=false;
  try{
    if(!isTrustedStudioRequestOrigin(request))throw new CollectorError("Cross-site request blocked.",403);
    if(Number(request.headers.get("content-length")||0)>12000)throw new CollectorError("Request is too large.",413);
    const token=(request.headers.get("authorization")||"").match(/^Bearer (.+)$/)?.[1];
    if(!token)throw new CollectorError("Connect your wallet and sign in to make this wallpaper.",401);
    const user=await getAuthenticatedUser(token);const wallet=extractSolanaWalletAddress(user);
    if(!wallet)throw new CollectorError("Your wallet session has expired. Sign in again.",401);
    const reader=request.body?.getReader();const chunks:Uint8Array[]=[];let length=0;
    if(!reader)throw new CollectorError("Invalid request.");
    try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>12000){await reader.cancel();throw new CollectorError("Request is too large.",413);}chunks.push(part.value);}}finally{reader.releaseLock();}
    const text=Buffer.concat(chunks).toString("utf8");
    const body=JSON.parse(text),input=cleanCollectorRequest(body);
    if(body.previewParts===true&&![[360,800],[320,427],[640,360]].some(([w,h])=>input.width===w&&input.height===h))throw new CollectorError("Choose a supported preview size.");
    const pilotId=typeof body.pilotProjectId==="string"?body.pilotProjectId:"";
    const pilotEnabled=privatePilotAvailable(pilotId);
    if((pilotId?!pilotEnabled:process.env.STUDIO_PRIVATE_COLLECTOR_ENABLED!=="true")||!hasSupabaseAdminKey()||!process.env.HELIUS_API_KEY)throw new CollectorError("Collector rendering is waiting for the server connections to be configured.",503);
    if(!await consumeStudioActionRateLimit(token,"collector_render"))throw new CollectorError("Too many previews. Please wait a few minutes.",429);
    if(activeRenders>=2)throw new CollectorError("The wallpaper studio is busy. Try again shortly.",429);
    activeRenders++;acquired=true;
    const pilot=pilotId?await loadCollectorPilot(pilotId,user):null;
    const rows=pilot?[pilot.project]:await restAsAdmin<any[]>(`collections?or=(slug.eq.${input.slug},public_slug.eq.${input.slug})&select=id,studio_id,source_type,source_config,publish_status,render_mode,render_profile,flagship,legacy_assets_locked&limit=1`);
    const project=rows?.[0];
    if(!pilot&&(!project||project.publish_status!=="published"||project.flagship||project.legacy_assets_locked||project.source_type!=="solana_collection"||project.render_mode!=="layered_traits"||project.render_profile?.collectorRenderer!=="private_layers_v1"))throw new CollectorError("This collector project is not available.",404);
    if(pilot&&project.slug!==input.slug)throw new CollectorError("Pilot project does not match.",403);
    const collection=String(project.source_config?.collectionIds?.[0]||"");
    if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(collection))throw new CollectorError("This project has no verified collection.",409);
    if(!pilot){
      const claims=await restAsAdmin<any[]>(`collection_claims?collection_id=eq.${project.id}&status=eq.verified&select=id&limit=1`);
      const runs=await restAsAdmin<any[]>(`collection_validation_runs?collection_id=eq.${project.id}&select=status,checked_at&order=checked_at.desc&limit=1`);
      if(!claims?.length||runs?.[0]?.status!=="passed"||!(Date.parse(runs[0].checked_at)>=Date.parse(project.render_profile.layerOrderConfirmedAt)))throw new CollectorError("The founder must validate the current artwork before rendering.",409);
    }
    // Fresh ownership and membership on every render; client metadata/URIs are ignored.
    const rpc=await fetch(`https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(process.env.HELIUS_API_KEY!)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:"collector-owner",method:"getAsset",params:{id:input.mint,options:{showUnverifiedCollections:false}}}),cache:"no-store",signal:AbortSignal.timeout(12000)});
    if(!rpc.ok)throw new CollectorError("Could not check NFT ownership. Try again shortly.",502);
    const payload=await rpc.json();if(payload.error)throw new CollectorError("Could not check NFT ownership.",502);
    const attributes=assertCollectorAsset(payload.result,input.mint,collection,wallet);
    if(isKnownUnsupportedNft(collection,input.mint))throw new CollectorError("Wallpaper artwork for this NFT is not available yet.",422);
    const layers=await restAsAdmin<any[]>(`trait_layers?collection_id=eq.${project.id}&select=id,trait_type,layer_order,is_background&order=layer_order.asc`);
    if(!layers.length||layers.length>32)throw new CollectorError("This project's layer setup cannot be rendered.",422);
    const assets=await restAsAdmin<any[]>(`trait_assets?layer_id=in.(${layers.map(layer=>layer.id).join(",")})&select=id,layer_id,trait_value,storage_bucket,storage_path`);
    const imported=layers.map(layer=>({name:layer.trait_type,suggestedOrder:layer.layer_order,likelyBackground:layer.is_background,assets:assets.filter(asset=>asset.layer_id===layer.id).map(asset=>({layerName:layer.trait_type,traitValue:asset.trait_value,relativePath:asset.storage_path}))}));
    const match=matchMetadataToTraitAssets(imported,attributes);
    assertCollectorTraitMatch(match,attributes);
    // Validate every selected path before any storage reads. Download in small
    // ordered batches so network latency is not paid once per trait layer.
    const selected=match.matched.map(item=>{
      assertPrivateTraitPath(item.asset.relativePath,project.studio_id,project.id);
      const asset=assets.find(asset=>asset.storage_path===item.asset.relativePath);
      if(asset?.storage_bucket!=="creator-source-private")throw new CollectorError("Invalid private source.",422);
      return {path:item.asset.relativePath,background:Boolean(layers.find(layer=>layer.trait_type===item.asset.layerName)?.is_background)};
    });
    const loadImages=async()=>{
      const images:Array<{bytes:Buffer;background:boolean}>=[];
      for(let offset=0;offset<selected.length;offset+=4){
        images.push(...await Promise.all(selected.slice(offset,offset+4).map(async item=>({bytes:await readStudioRenderObject("creator-source-private",item.path,2*1024*1024),background:item.background}))));
      }
      return images;
    };
    const loadBackground=async()=>{
    let background:Buffer|undefined;
    if(input.backgroundId!=="original"){
      const packages=await restAsAdmin<any[]>(`background_packages?id=eq.${input.backgroundId}&collection_id=eq.${project.id}&publish_status=${pilot?"in.(draft,published)":"eq.published"}&select=id`);
      if(!packages.length)throw new CollectorError("That background is not published for this project.",403);
      const choices=await restAsAdmin<any[]>(`${pilot?"background_source_assets":"background_assets"}?package_id=eq.${input.backgroundId}&select=device,storage_bucket,storage_path`);
      const source=choices.find(item=>item.device===input.device)||choices.find(item=>item.device==="phone");
      if(!source||source.storage_bucket!==(pilot?"creator-source-private":"published-public"))throw new CollectorError("Background is unavailable.",422);
      if(pilot)assertPilotBackgroundPath(source.storage_path,project,input.backgroundId);
      background=await readStudioRenderObject(source.storage_bucket,source.storage_path,8*1024*1024);
    }
    return background;
    };
    const [images,background]=await Promise.all([loadImages(),loadBackground()]);
    // Preserve original background pixels when the founder has not permitted replacement.
    const renderImages=background&&project.render_profile.backgroundHandling!=="omit_original_when_custom"?images.map(item=>({...item,background:false})):images;
    let decoration:Buffer|undefined;
    if(input.overlayId!=="none"){
      try{const png=chooseOverlay(project.render_profile.overlayLibrary,input.overlayId,input.device);if(png)decoration=Buffer.from(png.slice(22),"base64");}
      catch{throw new CollectorError("That overlay is not offered by this project.",403);}
    }
    const renderArgs={layers:renderImages,background,decoration,width:input.width,height:input.height,placement:input.placement||project.render_profile.devicePlacement?.[input.device],logo:project.render_profile.foregroundLogo,showLogo:input.showLogo};
    if(body.previewParts===true)return NextResponse.json(await composePrivatePreview(renderArgs),{headers});
    const output=await composePrivateWallpaper(renderArgs);
    return new Response(new Uint8Array(output),{headers:{...headers,"content-type":"image/png"}});
  }catch(error){
    if(error instanceof SyntaxError)return NextResponse.json({error:"Invalid request."},{status:400,headers});
    if(error instanceof CollectorError)return NextResponse.json({error:error.message},{status:error.status,headers});
    return NextResponse.json({error:"The wallpaper could not be made. Your NFT and saved artwork have not changed."},{status:500,headers});
  }finally{if(acquired)activeRenders--;}
}
