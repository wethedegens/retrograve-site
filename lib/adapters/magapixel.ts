// lib/adapters/magapixel.ts

/**
 * Minimal MAGApixel adapter
 * - Given a standard Metaplex-style metadata JSON, return the fields
 *   your UI needs (id/name/image). You can extend this later to do
 *   trait-aware rebuilding with local layers.
 */

export type MetaAttribute = { trait_type?: string; value?: string | number | null };
export type MagapixelMeta = {
  name?: string;
  image?: string;                 // remote image url (png/jpg)
  attributes?: MetaAttribute[];   // standard array
};

export type SimpleNft = { id: string; name?: string; image?: string };

/**
 * Build a SimpleNft for the locker from an off-chain metadata JSON.
 * If you later want to rebuild layers locally (ignoring Background),
 * add that logic here and return `image` as a data URL you render.
 */
export function buildMagapixelNft(
  mint: string,
  meta: MagapixelMeta | null | undefined
): SimpleNft | null {
  if (!meta) return null;

  // Basic normalization (you can enhance later)
  const name = meta.name?.trim() || mint;
  const image = meta.image || undefined;

  return { id: mint, name, image };
}
