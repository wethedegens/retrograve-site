// Server-side gate for one founder-only private collector pilot.
export function privatePilotAvailable(id:string) {
  if(!id || process.env.STUDIO_PRIVATE_PILOT_PROJECT_ID!==id)return false;
  if(process.env.NODE_ENV==="development")return true;
  if(process.env.VERCEL_ENV!=="preview" || process.env.STUDIO_PRIVATE_PILOT_PREVIEW_ENABLED!=="true")return false;
  // Hosted tests may use only the established development backend.
  try{return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||"").origin==="https://vndfiqblyndnantsntnq.supabase.co";}catch{return false;}
}
