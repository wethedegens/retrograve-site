import { privatePilotAvailable } from "../../../lib/lockscreened/privatePilot";
import {Suspense} from "react";
import {notFound} from "next/navigation";
import CollectorPilot from "../../../components/studio/CollectorPilot";
import LockScreenedStudioShell from "../../../components/studio/LockScreenedStudioShell";
export const dynamic="force-dynamic";
export default async function PilotPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{mint?:string}>}) {
  const {id}=await params;
  const editing=Boolean((await searchParams).mint);
  if(!privatePilotAvailable(id))notFound();
  return <LockScreenedStudioShell title={editing?undefined:"Your collection's Locker"} subtitle={editing?undefined:"Choose your NFT, customize its wallpaper and save it for your device."} badge={editing?undefined:"PRIVATE COLLECTOR PILOT"} backHref={`/studio/manage/${id}`} backLabel="FOUNDER WORKSPACE"><Suspense fallback={<p>Loading collector test…</p>}><CollectorPilot projectId={id}/></Suspense></LockScreenedStudioShell>;
}
