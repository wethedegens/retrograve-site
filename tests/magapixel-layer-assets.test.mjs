import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { magapixelLayerCandidates } from "../app/lib/lockscreened/magapixelLayerAssets.ts";

test("MAGApixel layer lookup finds shipped assets with legacy filenames", async () => {
  for (const [type, value] of [
    ["Body", "64 New York Military Academy"],
    ["Body", "87 Puma Helicopter Suit"],
    ["Head", "Hair 2.0"],
    ["Head", "USS Gerard L. Ford Hat"],
    ["Head", "White Gold Logo Golf Hat"],
  ]) {
    const [first] = magapixelLayerCandidates(type, value);
    await access(new URL("../public" + first, import.meta.url));
  }

  assert.deepEqual(magapixelLayerCandidates("Skin", "Teflon Don"), [
    "/magapixel/skin/teflon-don.png",
    "/magapixel/skin/teflon-don.webp",
  ]);
});
