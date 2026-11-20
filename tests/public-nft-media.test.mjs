import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire, stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import { NextRequest } from "next/server.js";
import {
  fetchPublicNftMetadata,
  getPublicNftMediaUrl,
  readBoundedNftMedia,
} from "../app/lib/lockscreened/server/publicNftMedia.ts";
import { getPublicSupabaseConfig } from "../app/lib/lockscreened/backendConfig.ts";

test("public NFT media accepts the verified MAGApixel host and known gateways", () => {
  assert.equal(getPublicNftMediaUrl("ipfs://sample/metadata.json").href,
    "https://gateway.pinata.cloud/ipfs/sample/metadata.json");
  assert.equal(getPublicNftMediaUrl("https://na-assets.pinit.io/example").hostname,
    "na-assets.pinit.io");
  for (const input of [
    "",
    "http://arweave.net/asset",
    "https://unapproved.example/art.png",
    "https://arweave.net:8443/asset",
    "https://user@arweave.net/asset",
    "https://gateway.pinata.cloud/not-an-ipfs-resource",
  ]) {
    assert.equal(getPublicNftMediaUrl(input), null);
  }
});

test("public media bounds streamed bytes and metadata accepts only JSON objects", async (t) => {
  assert.deepEqual(await readBoundedNftMedia(new Response("abc"), 3),
    new Uint8Array([97, 98, 99]));
  await assert.rejects(readBoundedNftMedia(new Response("abcd"), 3), /too large/);

  const source = new URL("https://arweave.net/sample");
  const stub = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, source);
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ name: "Fixture NFT" });
  });
  assert.deepEqual(await fetchPublicNftMetadata(source), { name: "Fixture NFT" });
  stub.mock.mockImplementation(async () => Response.json([]));
  await assert.rejects(fetchPublicNftMetadata(source), /Invalid NFT metadata/);
});

test("hosted production builds require a complete explicit Supabase pair", () => {
  const names = ["NODE_ENV", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
  const previous = names.map((name) => process.env[name]);
  try {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    assert.equal(getPublicSupabaseConfig(), null);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://configured.example";
    assert.equal(getPublicSupabaseConfig(), null);
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-test-key";
    assert.deepEqual(getPublicSupabaseConfig(), {
      url: "https://configured.example",
      publishableKey: "publishable-test-key",
    });
  } finally {
    names.forEach((name, index) => {
      if (previous[index] === undefined) delete process.env[name];
      else process.env[name] = previous[index];
    });
  }
});

const resolve = createRequire(import.meta.url).resolve;
const nextServer = pathToFileURL(resolve("next/server.js")).href;
const mediaModule = new URL("../app/lib/lockscreened/server/publicNftMedia.ts", import.meta.url);
async function loadRoute(name) {
  const routeFile = new URL("../app/api/" + name + "/route.ts", import.meta.url);
  const source = (await readFile(routeFile, "utf8"))
    .replace('"next/server"', JSON.stringify(nextServer))
    .replace('"@solana/web3.js"', JSON.stringify(pathToFileURL(resolve("@solana/web3.js")).href))
    .replace('"../../lib/lockscreened/server/publicNftMedia"', JSON.stringify(mediaModule.href));
  const compiled = Buffer.from(stripTypeScriptTypes(source)).toString("base64");
  return import("data:text/javascript;base64," + compiled);
}

const mediaRoutes = (await Promise.all(["img", "meta", "nft-by-mint"].map(loadRoute)))
  .map((route) => route.GET);
const { POST: verifyOwner } = await loadRoute("verify");

function fixtureRequest(route, query, source) {
  const url = new URL("https://lockscreened.example/api/" + route);
  url.searchParams.set(query, source);
  return new NextRequest(url);
}

test("all three media endpoints reject unapproved origins before fetching", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("An unapproved URL reached the outbound client.");
  });
  for (const [index, route] of ["img", "meta", "nft-by-mint"].entries()) {
    const query = index === 2 ? "uri" : "u";
    const result = await mediaRoutes[index](fixtureRequest(route, query, "https://unapproved.example/nft"));
    assert.equal(result.status, 400);
  }
  assert.equal(upstream.mock.callCount(), 0);
});

test("image handler blocks non-raster responses and sets image response isolation headers", async (t) => {
  const imageRequest = fixtureRequest("img", "u", "https://na-assets.pinit.io/fixture");
  const upstream = t.mock.method(globalThis, "fetch", async () => {
    return new Response("fixture", { headers: { "content-type": "text/html" } });
  });
  assert.equal((await mediaRoutes[0](imageRequest)).status, 502);

  const raster = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
  upstream.mock.mockImplementation(async () => {
    return new Response(raster, { headers: { "content-type": "image/png" } });
  });
  const result = await mediaRoutes[0](imageRequest);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("content-type"), "image/png");
  assert.equal(result.headers.get("x-content-type-options"), "nosniff");
  assert.match(result.headers.get("content-security-policy"), /^sandbox/);
  assert.deepEqual(Buffer.from(await result.arrayBuffer()), raster);
});
test("the existing Doge Miners inscription URL remains supported", () => {
  const inscription = "f362c61d2d77abea3fff98f86ef2c45f13710692d38f13740f74d2f7ca6063b2i0";
  const url = "https://cdn.doggy.market/content/" + inscription;
  assert.equal(getPublicNftMediaUrl(url)?.href, url);
  assert.equal(getPublicNftMediaUrl("https://cdn.doggy.market/other"), null);
});

test("legacy holder verification validates and bounds input before requesting Helius", async (t) => {
  const oldKey = process.env.HELIUS_API_KEY;
  process.env.HELIUS_API_KEY = "test-key";
  t.after(() => {
    if (oldKey === undefined) delete process.env.HELIUS_API_KEY;
    else process.env.HELIUS_API_KEY = oldKey;
  });
  const owner = "11111111111111111111111111111111";
  const request = (body) => new NextRequest("https://lockscreened.example/api/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const upstream = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url.hostname, "api.helius.xyz");
    assert.equal(url.pathname, "/v0/addresses/" + owner + "/nfts");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json([]);
  });
  assert.equal((await verifyOwner(request({ owner: "invalid wallet" }))).status, 400);
  assert.equal((await verifyOwner(request({ owner, extra: "x".repeat(4096) }))).status, 400);
  assert.equal(upstream.mock.callCount(), 0);
  const result = await verifyOwner(request({ owner }));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { items: [], verified: false });

  upstream.mock.mockImplementation(async () => { throw new Error("private fixture detail"); });
  const failed = await verifyOwner(request({ owner }));
  assert.equal(failed.status, 502);
  assert.deepEqual(await failed.json(), { error: "NFT verification is temporarily unavailable." });
});

test("mint lookup rejects invalid addresses and keeps provider failures private", async (t) => {
  const oldRpc = process.env.SOLANA_RPC_URL;
  process.env.SOLANA_RPC_URL = "https://rpc.example";
  t.after(() => {
    if (oldRpc === undefined) delete process.env.SOLANA_RPC_URL;
    else process.env.SOLANA_RPC_URL = oldRpc;
  });
  const mint = "So11111111111111111111111111111111111111112";
  const get = mediaRoutes[2];
  const upstream = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://rpc.example");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(JSON.parse(options.body).params.id, mint);
    return Response.json({ result: { content: { metadata: { name: "Fixture" } } } });
  });
  assert.equal((await get(fixtureRequest("nft-by-mint", "mint", "invalid mint"))).status, 400);
  assert.equal(upstream.mock.callCount(), 0);
  const result = await get(fixtureRequest("nft-by-mint", "mint", mint));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { id: mint, name: "Fixture", image: "", attributes: [] });

  upstream.mock.mockImplementation(async () => { throw new Error("private fixture detail"); });
  const failed = await get(fixtureRequest("nft-by-mint", "mint", mint));
  assert.equal(failed.status, 502);
  assert.deepEqual(await failed.json(), { error: "NFT metadata lookup is temporarily unavailable." });
});
