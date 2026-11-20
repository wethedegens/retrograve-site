
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

async function loadServerModule(name, imports) {
  const file = new URL("../app/lib/lockscreened/server/" + name + ".ts", import.meta.url);
  let source = await readFile(file, "utf8");
  for (const [specifier, relative] of Object.entries(imports)) {
    source = source.replace(JSON.stringify(specifier), JSON.stringify(new URL(relative, file).href));
  }
  const compiled = Buffer.from(stripTypeScriptTypes(source)).toString("base64");
  return import("data:text/javascript;base64," + compiled);
}

const supabase = await loadServerModule("supabaseServer", {
  "../backendConfig": "../backendConfig.ts",
});
const helius = await loadServerModule("heliusAuthority", {
  "./heliusCache": "./heliusCache.ts",
});

function setEnv(t, config) {
  for (const [name, value] of Object.entries(config)) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }
}

const backend = {
  NEXT_PUBLIC_SUPABASE_URL: "https://studio.example",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-fixture",
  SUPABASE_SECRET_KEY: "sb_secret_fixture",
};

test("Studio requests enforce transport settings and preserve user/admin credential separation", async (t) => {
  setEnv(t, backend);
  const calls = t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(new URL(url).origin, backend.NEXT_PUBLIC_SUPABASE_URL);
    assert.equal(init.redirect, "error");
    assert.equal(init.cache, "no-store");
    assert.ok(init.signal instanceof AbortSignal);
    return new Response(null, { status: 204 });
  });

  const init = {
    method: "PATCH",
    headers: new Headers({
      apiKey: "other-key",
      Authorization: "Bearer other-token",
      Prefer: "return=minimal",
    }),
  };
  assert.equal(await supabase.restAsUser("user-token", "collections", init), undefined);
  const userHeaders = new Headers(calls.mock.calls[0].arguments[1].headers);
  assert.equal(userHeaders.get("authorization"), "Bearer user-token");
  assert.equal(userHeaders.get("apikey"), backend.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  assert.equal(userHeaders.get("prefer"), "return=minimal");

  assert.equal(await supabase.restAsAdmin("collections", init), undefined);
  const secretHeaders = new Headers(calls.mock.calls[1].arguments[1].headers);
  assert.equal(secretHeaders.get("authorization"), null);
  assert.equal(secretHeaders.get("apikey"), backend.SUPABASE_SECRET_KEY);

  process.env.SUPABASE_SECRET_KEY = "service-role-fixture";
  await supabase.restAsAdmin("collections", init);
  const legacyHeaders = new Headers(calls.mock.calls[2].arguments[1].headers);
  assert.equal(legacyHeaders.get("authorization"), "Bearer service-role-fixture");
  assert.equal(legacyHeaders.get("apikey"), "service-role-fixture");
});

test("Studio rejects invalid sessions and keeps provider responses private", async (t) => {
  setEnv(t, backend);
  const upstream = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ message: "provider detail" }, { status: 401 })
  );
  assert.equal(await supabase.getAuthenticatedUser("expired-token"), null);

  upstream.mock.mockImplementation(async () =>
    Response.json({ hint: "private provider detail" }, { status: 503 })
  );
  await assert.rejects(supabase.getAuthenticatedUser("user-token"), {
    message: "Creator Studio data service request failed (503).",
  });
  await assert.rejects(supabase.consumeStudioActionRateLimit("user-token", "fixture"), {
    message: "Creator Studio data service request failed (503).",
  });

  upstream.mock.mockImplementation(async () => new Response("private malformed provider body"));
  await assert.rejects(supabase.restAsUser("user-token", "collections"), {
    message: "Creator Studio received an unreadable data service response.",
  });
});

test("Studio Helius membership checks use a deadline and hide RPC error messages", async (t) => {
  setEnv(t, { HELIUS_API_KEY: "test-key" });
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(new URL(url).hostname, "mainnet.helius-rpc.com");
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json({ error: { message: "private RPC detail" } });
  });
  await assert.rejects(
    helius.assetBelongsToCollection({ assetId: "fixture", collectionAddress: "collection" }),
    { message: "Helius could not inspect this NFT." }
  );
});

