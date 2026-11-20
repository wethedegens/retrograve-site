const LEGACY_FILENAMES: Readonly<Record<string, string>> = {
  "body/64-new-york-military-academy": "64-new-york- military- academy.png",
  "body/87-puma-helicopter-suit": "87-puma- helicopter- suit.png",
  "head/hair-2-0": "hair-2.0.png",
  "head/uss-gerard-l-ford-hat": "uss-gerard-l.-ford-hat.png",
  "head/white-gold-logo-golf-hat": "white-gold logo-golf-hat.png",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[+]/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function magapixelLayerCandidates(type: string, value: string) {
  const typeSlug = slugify(type);
  const valueSlug = slugify(value);
  const key = typeSlug + "/" + valueSlug;
  const paths = [`/magapixel/${key}.png`, `/magapixel/${key}.webp`];
  const legacyFilename = LEGACY_FILENAMES[key];
  if (legacyFilename) paths.unshift(`/magapixel/${typeSlug}/${encodeURIComponent(legacyFilename)}`);
  return paths;
}
