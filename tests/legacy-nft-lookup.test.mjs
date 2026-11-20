import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire, stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { NextRequest } from "next/server.js";

const resolve = createRequire(import.meta.url).resolve;
const path = new URL("../app/api/nfts/route.ts", import.meta.url);
const source = (await readFile(path, "utf8"))
  .replace('"next/server"', JSON.stringify(pathToFileURL(resolve("next/server.js")).href))
  .replace('"@solana/web3.js"', JSON.stringify(pathToFileURL(resolve("@solana/web3.js")).href))
  .replace('"../../lib/lockscreened/server/publicNftMedia"',
    JSON.stringify(new URL("../app/lib/lockscreened/server/publicNftMedia.ts", import.meta.url).href));
const compiled = Buffer.from(stripTypeScriptTypes(source)).toString("base64");
const { POST } = await import("data:text/javascript;base64," + compiled);

const owner = "11111111111111111111111111111111";
const creator = "So11111111111111111111111111111111111111112";
const makeRequest = (body) => new NextRequest("https://lockscreened.example/api/nfts", {
  method: "POST",
  body: JSON.stringify({ owner, ...body }),
});

function configureRpc(t) {
  const env = process.env;
  const names = ["NEXT_PUBLIC_SOLANA_RPC", "HELIUS_API_KEY", "NEXT_PUBLIC_COLLECTION_ID", "NEXT_PUBLIC_CREATOR_ALLOWLIST"];
  const previous = names.map((name) => env[name]);
  names.forEach((name) => delete env[name]);
  env.NEXT_PUBLIC_SOLANA_RPC = "https://rpc.example";
  t.after(() => names.forEach((name, index) => {
    if (previous[index] === undefined) delete env[name];
    else env[name] = previous[index];
  }));
}

test("Legacy NFT lookup validates the owner and compares creator addresses exactly", async (t) => {
  configureRpc(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ result: {
    items: [
      { id: "exact", creators: [{ address: creator }] },
      { id: "different", creators: [{ address: creator.toLowerCase() }] },
    ],
  } }));
  assert.equal((await POST(makeRequest({ owner: "invalid wallet" }))).status, 400);
  assert.equal((await POST(makeRequest({ padding: "x".repeat(16 * 1024) }))).status, 400);
  assert.equal(fetch.mock.callCount(), 0);
  const response = await POST(makeRequest({ creators: [creator] }));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).nfts.map((nft) => nft.id), ["exact"]);
  assert.equal(fetch.mock.callCount(), 1);
});

test("Legacy NFT lookup stops at twenty full upstream pages with an explicit error", async (t) => {
  configureRpc(t);
  const items = Array.from({ length: 500 }, (_, index) => ({ id: "fixture-" + index }));
  const fetch = t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.redirect, "error");
    return Response.json({ result: { items } });
  });
  const response = await POST(makeRequest({}));
  assert.equal(response.status, 422);
  assert.equal(fetch.mock.callCount(), 20);
});