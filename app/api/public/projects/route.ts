// app/api/public/projects/route.ts
import { NextResponse } from "next/server";
import { listPublishedStudioProjects } from "../../../lib/lockscreened/publicStudioData";

export const revalidate = 60;

export async function GET() {
  try {
    const projects = await listPublishedStudioProjects();
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json(
      { error: "Could not load creator projects." },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
