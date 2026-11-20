import Link from "next/link";
import {notFound} from "next/navigation";
import styles from "./welcome.module.css";
import {getPublishedStudioProjectBySlug} from "../../lib/lockscreened/publicStudioData";
import LockScreenedPublicShell from "../../components/studio/LockScreenedPublicShell";
export const dynamic="force-dynamic";
export default async function ProjectWelcome({params}:{params:Promise<{slug:string}>}){
 const project=await getPublishedStudioProjectBySlug((await params).slug);
 if(!project)notFound();
 const profile=project.public_profile||{};
 const preview=project.preview||project.backgrounds.find((p:any)=>p.deviceAssets?.phone)?.deviceAssets.phone;
 return <LockScreenedPublicShell projectName={project.name} appearance={project.render_profile?.pageAppearance} pageKind="welcome" maxWidth={1200}>
 <section className={styles.welcome}>
 <div className={styles.copy}>
 <h1>{project.name}</h1><h2>LOCKSCREEN LOCKER</h2>
 <p><strong>Phone-native wallpapers</strong> for {project.name}.<br/>{profile.description||"Connect your wallet, pick an NFT, swap backgrounds, and export for any device."}</p>
 <div className={styles.actions}><Link prefetch={false} href={"/projects/"+project.route_slug+"/collection"}>VIEW MY COLLECTION</Link>{profile.marketplace?<a href={profile.marketplace} target="_blank" rel="noreferrer">COLLECT NOW</a>:null}</div>
 <div className={styles.links}>{profile.discord?<a href={profile.discord} target="_blank" rel="noreferrer">Community</a>:null}{profile.x?<a href={profile.x} target="_blank" rel="noreferrer">Follow on X</a>:null}{profile.website?<a href={profile.website} target="_blank" rel="noreferrer">Website</a>:null}</div>
 </div>
 <div className={styles.phoneFrame}><div className={styles.phoneScreen}><span className={styles.notch} aria-hidden="true"/>{preview?<img src={preview} alt={project.name+" wallpaper example"}/>:<span>Wallpaper preview coming soon</span>}</div></div>
 </section></LockScreenedPublicShell>;
}
