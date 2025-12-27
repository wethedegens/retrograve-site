// app/retrogs/page.tsx
import { redirect } from "next/navigation";

/**
 * LEGACY ROUTE (DEPRECATED)
 * ------------------------
 * /retrogs used to be the MAGApixel owner grid route.
 * Keep it so old links/bookmarks don't break.
 * Redirect to the current canonical route:
 *   /magapixel-nfts
 */

export const dynamic = "force-dynamic";

export default function RetrogsRedirectPage() {
  redirect("/magapixel-nfts");
}
