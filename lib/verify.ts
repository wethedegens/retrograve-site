export async function verifyHolder(owner: string): Promise<boolean> {
  const r = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner })
  });
  if (!r.ok) return false;
  const j = await r.json();
  return !!j?.verified;
}

export async function listMyNfts(owner: string) {
  const r = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner })
  });
  if (!r.ok) throw new Error("Failed to load NFTs");
  const j = await r.json();
  return (j?.items || []) as Array<{ mint: string; name: string; image: string }>;
}
