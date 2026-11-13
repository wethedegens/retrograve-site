import {NextResponse} from "next/server";
import {CollectorError} from "../../../lib/lockscreened/collectorPolicy";
import {extractSolanaWalletAddress} from "../../../lib/lockscreened/authIdentity";
import {getAuthenticatedUser,hasSupabaseAdminKey,consumeStudioActionRateLimit,restAsAdmin,isTrustedStudioRequestOrigin} from "../../../lib/lockscreened/server/supabaseServer";
import {loadCollectorPilot,loadPublishedCollector,loadPilotLibrary,pilotNftCard} from "../../../lib/lockscreened/server/collectorPilot";

export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(request:Request) {
  try {
    if(!isTrustedStudioRequestOrigin(request))throw new CollectorError("Cross-site request blocked.",403);
    if(!hasSupabaseAdminKey()||!process.env.HELIUS_API_KEY)throw new CollectorError("Private pilot unavailable.",404);
    const token=(request.headers.get("authorization")||"").match(/^Bearer (.+)$/)?.[1];
    const user=token?await getAuthenticatedUser(token):null,wallet=extractSolanaWalletAddress(user);
    if(!wallet)throw new CollectorError("Sign in with your connected wallet to view your NFTs.",401);
    if(!await consumeStudioActionRateLimit(token!,"collector_render"))throw new CollectorError("Please wait a few minutes before refreshing your NFTs.",429);
    const url=new URL(request.url),id=url.searchParams.get("projectId")||"",page=Number(url.searchParams.get("page")||1);
    if(!Number.isInteger(page)||page<1||page>100)throw new CollectorError("Invalid NFT page.");
    const isPublic=url.searchParams.get("published")==="true";
    const {project,collection}=isPublic?await loadPublishedCollector(id):await loadCollectorPilot(id,user);
    const pageSize=24;
    const [library,rpc,packages]=await Promise.all([
      loadPilotLibrary(id),
      fetch(`https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(process.env.HELIUS_API_KEY||"")}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:"private-pilot-owned",method:"searchAssets",params:{ownerAddress:wallet,grouping:["collection",collection],page,limit:pageSize,options:{showUnverifiedCollections:false}}}),cache:"no-store",signal:AbortSignal.timeout(25000)}),
      restAsAdmin<any[]>(`background_packages?collection_id=eq.${id}&publish_status=${isPublic?"eq.published":"in.(draft,published)"}&select=id,name`)
    ]);
    if(!rpc.ok)throw new CollectorError("Could not load your owned NFTs. Please retry.",502);
    const result=await rpc.json();if(result.error)throw new CollectorError("Could not load your owned NFTs.",502);
    const items=(result.result?.items||[]).filter((asset:any)=>!asset.burnt&&asset.ownership?.owner===wallet&&asset.ownership?.ownership_model==="single"&&asset.grouping?.some((group:any)=>group.group_key==="collection"&&group.group_value===collection&&group.verified!==false));
    const phoneSources=packages.length?await restAsAdmin<any[]>(`${isPublic?"background_assets":"background_source_assets"}?package_id=in.(${packages.map(item=>item.id).join(",")})&device=eq.phone&select=package_id`):[];
    const offered=packages.filter(item=>phoneSources.some(source=>source.package_id===item.id));
    return NextResponse.json({project:{slug:isPublic?(project.public_slug||project.slug):project.slug,name:project.name,render_profile:{devicePlacement:project.render_profile?.devicePlacement,foregroundLogo:project.render_profile?.foregroundLogo,collectorDefaults:project.render_profile?.collectorDefaults},overlays:(project.render_profile?.overlayLibrary?.items||[]).map((item:any)=>({id:item.id,name:item.name,thumbnail:item.thumbnail||""})),backgrounds:offered.map(item=>({id:item.id,name:item.name,deviceAssets:{}}))},items:items.map((asset:any)=>pilotNftCard(asset,collection,wallet,library)),page,hasMore:(result.result?.items?.length||0)===pageSize},{headers});
  }catch(error){
    if(error instanceof Error && ["AbortError","TimeoutError"].includes(error.name))return NextResponse.json({error:"Loading your NFTs took too long. Please tap View my NFTs to try again."},{status:504,headers});
    if(error instanceof TypeError && error.message === "fetch failed")return NextResponse.json({error:"The local server cannot reach the wallet and artwork services. Restart the development server from your own terminal, then try again."},{status:503,headers});
    return NextResponse.json({error:error instanceof CollectorError?error.message:"Could not load your collection. Please try again."},{status:error instanceof CollectorError?error.status:500,headers});}
}
