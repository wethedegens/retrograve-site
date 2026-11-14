"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {LEGACY_PROJECTS} from "../lib/lockscreened/legacyProjects";
import styles from "./ProjectSearch.module.css";
type Project={name:string;slug:string};
export default function ProjectSearch(){
 const router=useRouter();const [query,setQuery]=useState("");const [open,setOpen]=useState(false);const [projects,setProjects]=useState<Project[]>([]);const [loaded,setLoaded]=useState(false);const [failed,setFailed]=useState(false);
 useEffect(()=>{if(!open||loaded)return;const controller=new AbortController();fetch("/api/public/projects",{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{setProjects(data.projects||[]);setLoaded(true);setFailed(false);}).catch(()=>{if(!controller.signal.aborted){setLoaded(true);setFailed(true);}});return()=>controller.abort();},[open,loaded]);
 const all=[...LEGACY_PROJECTS.map(p=>({name:p.name,href:p.lockerPath})),...projects.map(p=>({name:p.name,href:"/projects/"+p.slug}))];const matches=all.filter(p=>p.name.toLowerCase().includes(query.trim().toLowerCase()));
 return <div className={styles.search} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
 <form role="search" onSubmit={e=>{e.preventDefault();setOpen(false);router.push("/projects?q="+encodeURIComponent(query.trim()));}}><label className={styles.label} htmlFor="header-project-search">Find a project</label><input id="header-project-search" type="search" autoComplete="off" placeholder="Find a project…" value={query} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onKeyDown={e=>{if(e.key==="Escape")setOpen(false);}} aria-expanded={open} aria-controls="project-search-results"/></form>
 {open?<div id="project-search-results" className={styles.results}><ul aria-label="Matching projects">{matches.slice(0,8).map(p=><li key={p.href}><Link href={p.href} onClick={()=>setOpen(false)}>{p.name}</Link></li>)}</ul>{!matches.length?<p>No matching projects.</p>:null}{failed?<p>New projects could not load. Open the directory to retry.</p>:null}<Link className={styles.all} href={"/projects?q="+encodeURIComponent(query.trim())} onClick={()=>setOpen(false)}>Open project directory</Link></div>:null}
 </div>;
}
