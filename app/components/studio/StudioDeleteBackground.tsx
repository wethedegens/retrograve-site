"use client";
import {useState} from "react";
import {getFreshSession} from "../../lib/lockscreened/web3AuthClient";

export default function StudioDeleteBackground({packageId,name}:{packageId:string;name:string}){
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function remove(){
    if(!window.confirm(`Are you sure you want to delete “${name}”?\n\nThis removes its phone, iPad and desktop versions from your gallery and collector choices. If it is a starting background, holders will start with their own NFT’s original background.\n\nThe source files are kept privately for recovery.`))return;
    setBusy(true);setMessage("");
    const controller=new AbortController(),timer=window.setTimeout(()=>controller.abort(),25000);
    try{
      const session=await getFreshSession();if(!session)throw new Error("Sign in to Studio again.");
      const response=await fetch("/api/studio/background-lifecycle",{method:"POST",signal:controller.signal,headers:{"content-type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({packageId,action:"delete"})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||"Could not delete this background.");
      setMessage("Background deleted from your gallery.");
      window.dispatchEvent(new CustomEvent("lockscreened-background-removed",{detail:{packageId}}));
      window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
    }catch(error){setMessage(controller.signal.aborted?"This is taking too long. Refresh to check whether the background was removed.":error instanceof Error?error.message:"Could not delete background.");}
    finally{window.clearTimeout(timer);setBusy(false);}
  }
  return <div><button type="button" disabled={busy} onClick={()=>void remove()} style={{padding:"10px 14px",border:"1px solid #986767",borderRadius:9,background:"#211616",color:"#ffcece",cursor:busy?"wait":"pointer"}}>{busy?"Deleting…":"Delete background"}</button>{message?<p role="status">{message}</p>:null}</div>;
}
