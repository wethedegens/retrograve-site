"use client";
import {useEffect,useState} from "react";
import {getFreshSession} from "../../lib/lockscreened/web3AuthClient";
export default function CollectorBackgroundThumbnail({projectId,backgroundId}:{projectId:string;backgroundId:string}){
  const [url,setUrl]=useState("");
  useEffect(()=>{let active=true,objectUrl="";const controller=new AbortController();setUrl("");
    void(async()=>{try{const session=await getFreshSession();if(!session)return;const response=await fetch(`/api/studio/collector-background-thumbnail?projectId=${encodeURIComponent(projectId)}&backgroundId=${encodeURIComponent(backgroundId)}`,{headers:{Authorization:"Bearer "+session.access_token},signal:controller.signal,cache:"no-store"});if(!response.ok)return;const blob=await response.blob();if(active){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}}catch{}})();
    return()=>{active=false;controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[projectId,backgroundId]);
  return url?<img src={url} alt="" style={{width:"100%",height:84,objectFit:"cover",borderRadius:6}}/>:<span aria-hidden="true" style={{display:"grid",placeItems:"center",height:84,background:"#292929",borderRadius:6}}>▧</span>;
}
