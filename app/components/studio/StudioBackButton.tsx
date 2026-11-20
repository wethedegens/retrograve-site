import Link from "next/link";
export default function StudioBackButton({href,label}:{href:string;label:string}){
 return <Link href={href} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:40,padding:"9px 14px",border:"1px solid #555",borderRadius:9,background:"#1b1b1b",color:"#f2f2f2",textDecoration:"none",fontSize:11,fontWeight:700,letterSpacing:".04em",lineHeight:1.3,textAlign:"center",flexShrink:0}}>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{href==="/"?<><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-8h6v8"/></>:<path d="m14 6-6 6 6 6"/>}</svg>{label}
 </Link>;
}
