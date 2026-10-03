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
