import {NextResponse} from "next/server";
import sharp from "sharp";
import {CollectorError} from "../../../lib/lockscreened/collectorPolicy";
import {validDecorationId} from "../../../lib/lockscreened/overlayLibrary";
import {extractSolanaWalletAddress} from "../../../lib/lockscreened/authIdentity";
import {loadCollectorPilot,assertPilotBackgroundPath} from "../../../lib/lockscreened/server/collectorPilot";
import {getAuthenticatedUser,restAsAdmin,readStudioRenderObject,consumeStudioActionRateLimit,isTrustedStudioRequestOrigin} from "../../../lib/lockscreened/server/supabaseServer";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function GET(request:Request){
  try{
    if(!isTrustedStudioRequestOrigin(request))throw new CollectorError("Cross-site request blocked.",403);
    const token=(request.headers.get("authorization")||"").match(/^Bearer (.+)$/)?.[1],user=token?await getAuthenticatedUser(token):null;
    if(!extractSolanaWalletAddress(user))throw new CollectorError("Sign in first.",401);
    if(!await consumeStudioActionRateLimit(token!,"collector_render"))throw new CollectorError("Please wait before loading more thumbnails.",429);
    const url=new URL(request.url),id=url.searchParams.get("projectId")||"",backgroundId=url.searchParams.get("backgroundId")||"";
    if(!validDecorationId(backgroundId))throw new CollectorError("Choose an offered background.");
    const {project}=await loadCollectorPilot(id,user);
    const rows=await restAsAdmin<any[]>(`background_packages?id=eq.${backgroundId}&collection_id=eq.${id}&publish_status=in.(draft,published)&select=id&limit=1`);
    if(!rows.length)throw new CollectorError("That background is not offered here.",404);
    const sources=await restAsAdmin<any[]>(`background_source_assets?package_id=eq.${backgroundId}&device=eq.phone&select=storage_bucket,storage_path&limit=1`),source=sources[0];
    if(source?.storage_bucket!=="creator-source-private")throw new CollectorError("Thumbnail unavailable.",404);
    assertPilotBackgroundPath(source.storage_path,project,backgroundId);
    const bytes=await readStudioRenderObject(source.storage_bucket,source.storage_path,8*1024*1024);
    const image=sharp(bytes,{limitInputPixels:16_777_216,animated:false}),meta=await image.metadata();
    if(!["png","jpeg","webp"].includes(meta.format||""))throw new CollectorError("Unsupported background.");
    const thumbnail=await image.resize(160,120,{fit:"cover"}).flatten({background:"#222"}).jpeg({quality:65}).toBuffer();
    return new Response(new Uint8Array(thumbnail),{headers:{...headers,"content-type":"image/jpeg"}});
  }catch(error){return NextResponse.json({error:error instanceof CollectorError?error.message:"Thumbnail unavailable."},{status:error instanceof CollectorError?error.status:500,headers});}
}
