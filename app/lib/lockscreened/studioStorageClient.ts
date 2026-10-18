// app/lib/lockscreened/studioStorageClient.ts
"use client";

import { getPublicSupabaseConfig } from "./backendConfig";
import type { LockScreenedSession } from "./web3AuthClient";

function config() {
  const value = getPublicSupabaseConfig();
  if (!value) throw new Error("LockScreened Supabase is not configured.");
  return value;
}

function encodedPath(path: string) {
  return String(path || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function storageError(response: Response) {
  try {
    const data = await response.json();
    return (
      data?.message ||
      data?.error ||
      data?.statusCode ||
      `Storage request failed (${response.status}).`
    );
  } catch {
    return `Storage request failed (${response.status}).`;
  }
}

export async function uploadStorageFile(args: {
  session: LockScreenedSession;
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}) {
  const { url, publishableKey } = config();

  const allowedBuckets = new Set(["creator-source-private"]);
  if (!allowedBuckets.has(String(args.bucket || ""))) {
    throw new Error("Browser uploads are restricted to the private creator source bucket.");
  }

  const normalizedPath = String(args.path || "").replace(/\\/g, "/");
  if (
    !normalizedPath ||
    normalizedPath.startsWith("/") ||
    normalizedPath.includes("../") ||
    normalizedPath.includes("/..") ||
    normalizedPath.split("/").some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Unsafe storage path was blocked.");
  }

  const safeTypes = new Set(["image/png", "image/webp", "image/jpeg"]);
  if (!safeTypes.has(String(args.file.type || "").toLowerCase())) {
    throw new Error("Only PNG, WebP, and JPEG image uploads are accepted.");
  }

  const maxBrowserUploadBytes = 8 * 1024 * 1024;
  if (!Number.isFinite(args.file.size) || args.file.size <= 0 || args.file.size > maxBrowserUploadBytes) {
    throw new Error("This image is empty or exceeds the 8 MB browser upload limit.");
  }

  const response = await fetch(
    `${url}/storage/v1/object/${encodeURIComponent(args.bucket)}/${encodedPath(args.path)}`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${args.session.access_token}`,
        "content-type": args.file.type || "application/octet-stream",
        "x-upsert": args.upsert === false ? "false" : "true",
      },
      body: args.file,
    }
  );

  if (!response.ok) {
    throw new Error(await storageError(response));
  }

  return await response.json();
}

export async function deleteStorageFile(args: {
  session: LockScreenedSession;
  bucket: string;
  path: string;
}) {
  const { url, publishableKey } = config();

  const response = await fetch(
    `${url}/storage/v1/object/${encodeURIComponent(args.bucket)}`,
    {
      method: "DELETE",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${args.session.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ prefixes: [args.path] }),
    }
  );

  if (!response.ok) {
    throw new Error(await storageError(response));
  }
}


export async function downloadStorageBlob(args: {
  session: LockScreenedSession;
  bucket: string;
  path: string;
}) {
  const { url, publishableKey } = config();

  const response = await fetch(
    url +
      "/storage/v1/object/authenticated/" +
      encodeURIComponent(args.bucket) +
      "/" +
      encodedPath(args.path),
    {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Authorization: "Bearer " + args.session.access_token,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(await storageError(response));
  }

  return await response.blob();
}
