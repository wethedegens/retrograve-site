"use client";
import {useEffect,useState} from "react";
import ProjectCard from "./ProjectCard";
import {LEGACY_PROJECTS,type LockerProject} from "../lib/lockscreened/legacyProjects";
type PublishedProject={id:string;slug:string;name:string;preview?:string};
export default function ProjectDirectory({initialProjects,hideRetrograve=false}:{initialProjects?:PublishedProject[];hideRetrograve?:boolean}){
 const [projects,setProjects]=useState<PublishedProject[]>(initialProjects||[]);
 const [query,setQuery]=useState("");
 const [error,setError]=useState(false);
 useEffect(()=>{if(initialProjects)return;const controller=new AbortController();fetch("/api/public/projects",{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error();return r.json();}).then(data=>setProjects(data.projects||[])).catch(()=>{if(!controller.signal.aborted)setError(true);});return()=>controller.abort();},[initialProjects]);
 const added:LockerProject[]=projects.map(p=>({name:p.name,status:"live",label:"Live",lockerPath:"/projects/"+p.slug,glow:"studio",preview:p.preview}));
 const all=[...LEGACY_PROJECTS,...added].filter(p=>!hideRetrograve||p.lockerPath!=="/retrograve");
 const filtered=all.filter(p=>p.name.toLowerCase().includes(query.trim().toLowerCase()));
 return <section aria-label="Project directory">
 <div className="search"><label htmlFor="project-search">Find a project</label><input id="project-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search project names…"/><span role="status">{filtered.length} projects</span></div>
 {error?<p role="status">New Studio projects could not load. Refresh to try again.</p>:null}
 <div className="project-grid">{filtered.map(p=><ProjectCard key={p.lockerPath} p={p}/>)}</div>
 {!filtered.length?<p>No projects match “{query}”.</p>:null}
 <style jsx>{`
 .search{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin:20px 0 24px;color:#ddd;font-size:13px}.search label{font-weight:700}.search input{width:min(360px,100%);min-height:44px;padding:10px 14px;border:1px solid #666;border-radius:10px;background:#161616;color:#fff;font:inherit}.search input:focus-visible{outline:2px solid #fff;outline-offset:3px}
 .project-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px;justify-items:center;align-items:start}.project-grid :global(a){min-width:0;max-width:100%}
 @media(max-width:1100px){.project-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:720px){.project-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}
 `}</style></section>;
}
