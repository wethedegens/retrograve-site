"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {getFreshSession,signInWithSolana} from "../../lib/lockscreened/web3AuthClient";
import {extractSolanaWalletAddress} from "../../lib/lockscreened/authIdentity";
import PrivateCollectorLocker from "./PrivateCollectorLocker";

type Card={mint:string;name:string;image:string;available:boolean;reason:string};
type PilotData={project:{slug:string;name:string;render_profile:any;backgrounds:Array<{id:string;name:string;deviceAssets:Record<string,string>}>;overlays?:Array<{id:string;name:string;thumbnail?:string}>};items:Card[];hasMore:boolean};
export default function CollectorPilot({projectId,publicSlug}:{projectId:string;publicSlug?:string}) {
  const wallet=useWallet(),address=wallet.publicKey?.toBase58()||"",search=useSearchParams(),mint=search.get("mint")||"";
  const [data,setData]=useState<PilotData|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[page,setPage]=useState(()=>{const value=Number(search.get("page")||1);return Number.isInteger(value)&&value>=1&&value<=100?value:1;});
  const generation=useRef(0);
  const load=useCallback(async()=>{
    const run=++generation.current;
    setBusy(true);setMessage("");setData(null);
    try {
      const session=await getFreshSession();
      if(!address||extractSolanaWalletAddress(session?.user)!==address)throw new Error("Connect your wallet, then choose View my NFTs below.");
      const response=await fetch(`/api/studio/collector-pilot?projectId=${encodeURIComponent(projectId)}&page=${page}${publicSlug?"&published=true":""}`,{headers:{Authorization:"Bearer "+session!.access_token},cache:"no-store",signal:AbortSignal.timeout(60000)});
      const result=await response.json();if(!response.ok)throw new Error(result?.error||"Could not load your NFTs.");
      if(run===generation.current)setData(result);
    }catch(error){if(run===generation.current)setMessage(error instanceof Error&&["AbortError","TimeoutError"].includes(error.name)?"Loading your NFTs took too long. Please tap View my NFTs to try again.":error instanceof Error?error.message:"Could not open your NFTs.");}
    finally{if(run===generation.current)setBusy(false);}
  },[address,projectId,page,publicSlug]);
  useEffect(()=>{void load();return()=>{generation.current++;};},[load]);
  async function viewOwned(){
    setBusy(true);setMessage("");
    try {
      const current=await getFreshSession();
      if(!address)throw new Error("Connect your wallet using the button above first.");
      if(extractSolanaWalletAddress(current?.user)!==address)await signInWithSolana({publicKey:wallet.publicKey,signMessage:wallet.signMessage},"collector");
      await load();
    }catch(error){setMessage(error instanceof Error?error.message:"Could not verify your wallet.");setBusy(false);}
  }
  return <section className="pilot">
    {!(data&&mint)?<>
    {!publicSlug?<><a href={`/studio/manage/${projectId}`}>← Return to founder workspace</a>
    <p className="note">Private collector test · Only your signed-in founder wallet can open this draft. Nothing here publishes your project.</p></>:null}
    <h1>{data?`My ${data.project.name} NFTs`:"View my NFTs"}</h1>
    <button type="button" disabled={busy||!address} onClick={()=>void viewOwned()}>{busy?"Checking your wallet…":data?"Refresh my NFTs":"View my NFTs"}</button>
    </>:null}
    {message?<p role="alert">{message}</p>:null}
    {data&&mint&&data.items.some(item=>item.mint===mint&&item.available)?<PrivateCollectorLocker key={`${projectId}-${mint}-${address}`} project={data.project} pilotProjectId={publicSlug?undefined:projectId} originalThumbnail={data.items.find(item=>item.mint===mint)?.image}/>:null}
    {data&&!mint?<>
      <p>Choose one of your NFTs to make a wallpaper. NFTs with unsupported artwork are marked unavailable.</p>
      <div className="grid">{data.items.map(item=><article key={item.mint}>
        {item.image?<img src={item.image} alt={item.name} referrerPolicy="no-referrer" loading="lazy"/>:<div className="no-image">No thumbnail</div>}
        <h2>{item.name}</h2>
        {item.available?<Link prefetch={false} className="choose" href={`${publicSlug?`/projects/${publicSlug}/locker`:`/studio/pilot/${projectId}`}?mint=${encodeURIComponent(item.mint)}&page=${page}`}>Make my wallpaper →</Link>:<p>{item.reason}</p>}
      </article>)}</div>
      {!data.items.length?<p>No NFTs from this collection were found in the connected wallet.</p>:null}
      <nav aria-label="Owned NFT pages"><button disabled={busy||page===1} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page}</span><button disabled={busy||!data.hasMore} onClick={()=>setPage(value=>value+1)}>Next</button></nav>
    </>:null}
    <style jsx>{`
      .pilot{color:#eee}a{color:#eee}h1{font-size:32px}.note{font-size:13px;color:#bbb;line-height:1.6}
      button,.choose{font:inherit;border:1px solid #555;background:#eee;color:#111;border-radius:10px;padding:12px 16px;cursor:pointer;display:inline-block;text-decoration:none}button:disabled{opacity:.45;cursor:default}
      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px;margin:24px 0}article{border:1px solid #444;background:#141414;border-radius:14px;padding:12px;min-width:0}article img,.no-image{width:100%;aspect-ratio:1;object-fit:contain;border-radius:8px;background:#222}h2{font-size:16px}article p{font-size:13px;line-height:1.5;color:#bbb}nav{display:flex;align-items:center;gap:16px}button:focus-visible,a:focus-visible{outline:2px solid white;outline-offset:3px}
    `}</style>
  </section>;
}
