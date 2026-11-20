const IPFS_GATEWAY = "https://gateway.pinata.cloud";

const IPFS_MEDIA_HOSTS = new Set([
  "gateway.pinata.cloud",
  "ipfs.io",
  "dweb.link",
  "nftstorage.link",
  "cloudflare-ipfs.com",
]);

const NFT_MEDIA_HOSTS = new Set([
  ...IPFS_MEDIA_HOSTS,
  "arweave.net",
  "cdn.helius-rpc.com",
  "cdn.doggy.market",
  "gateway.pinit.io",
  "na-assets.pinit.io",
]);

export const NFT_IMAGE_TYPES = new Set([
  "image/png", "image/jpeg", "image/webp", "image/gif", "image/avif",
]);

export function getPublicNftMediaUrl(input: string): URL | null {
  const source = input.trim();
  if (!source || source.length > 4096) return null;

  try {
    const url = source.startsWith("ipfs://")
      ? new URL("/ipfs/" + source.slice(7).replace(/^ipfs\//, ""), IPFS_GATEWAY)
      : new URL(source);
    if (url.protocol !== "https:" || url.username || url.password || url.port) {
      return null;
    }
    const host = url.hostname;
    const mediaHosts = process.env.LOCKSCREENED_NFT_MEDIA_HOSTS
      ?.split(",")
      .map((value) => value.trim().toLowerCase());
    if (!NFT_MEDIA_HOSTS.has(host) && !mediaHosts?.includes(host)) return null;
    if (IPFS_MEDIA_HOSTS.has(host) && !url.pathname.startsWith("/ipfs/")) {
      return null;
    }
    if (host === "cdn.doggy.market" && !/^\/content\/[0-9a-f]{64}i\d+$/i.test(url.pathname)) {
      return null;
    }
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export async function fetchPublicNftMedia(url: URL) {
  return fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8_000),
    headers: { "user-agent": "LockScreened NFT Media" },
  });
}

export async function readBoundedNftMedia(response: Pick<Response, "body" | "headers">, maxBytes: number) {
  const body = response.body;
  if (!body) throw new Error("Missing upstream body.");
  if (Number(response.headers.get("content-length")) > maxBytes) {
    void body.cancel().catch(() => {});
    throw new Error("Upstream body is too large.");
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        void reader.cancel().catch(() => {});
        throw new Error("Upstream body is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function fetchPublicNftMetadata(url: URL) {
  const response = await fetchPublicNftMedia(url);
  if (!response.ok) {
    void response.body?.cancel().catch(() => {});
    throw new Error("Upstream metadata unavailable.");
  }
  const bytes = await readBoundedNftMedia(response, 512 * 1024);
  const metadata: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("Invalid NFT metadata.");
  }
  return metadata;
}