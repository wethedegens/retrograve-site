// app/lib/lockscreened/traitImport.ts
//
// Pure trait-folder analysis used by the future Creator Studio uploader.
// It intentionally performs NO writes and NO publishing. Founders will review
// the detected layers/order/mappings before anything becomes active.

export type UploadedTraitFile = {
  relativePath: string;
  name: string;
  size?: number;
  type?: string;
};

export type ImportedTraitAsset = {
  layerName: string;
  traitValue: string;
  relativePath: string;
  rarityGroup?: string;
};

export type ImportedTraitLayer = {
  name: string;
  suggestedOrder: number;
  likelyBackground: boolean;
  assets: ImportedTraitAsset[];
};

export type TraitImportWarning = {
  code:
    | "unsupported_file"
    | "duplicate_trait_value"
    | "empty_layer_name"
    | "no_trait_assets";
  message: string;
  path?: string;
};

export type TraitImportAnalysis = {
  layers: ImportedTraitLayer[];
  warnings: TraitImportWarning[];
  ignoredFiles: string[];
};

const SUPPORTED_EXTENSIONS = new Set(["png", "webp"]);
const BACKGROUND_LAYER_NAMES = new Set([
  "background",
  "backgrounds",
  "bg",
  "backdrop",
  "backdrops",
  "environment",
  "environments",
]);

function cleanPath(path: string) {
  return String(path || "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\/+|\/+$/g, "");
}

function ext(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] || "";
}

function withoutExt(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

function normalizedLayerName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function shouldIgnore(path: string) {
  const lower = path.toLowerCase();
  const segments = lower.split("/");
  return (
    segments.some((segment) => segment === "__macosx") ||
    segments.some((segment) => segment.startsWith(".")) ||
    lower.endsWith("/thumbs.db") ||
    lower.endsWith("/desktop.ini")
  );
}

/**
 * If every file lives under the same outer folder (for example
 * "MyCollection/Body/Hoodie.png"), strip that collection wrapper so Body
 * becomes the layer. This mirrors how founders typically zip/export art packs.
 */
function stripCommonCollectionRoot(paths: string[]) {
  const split = paths.map((path) => cleanPath(path).split("/"));
  if (!split.length) return paths;

  const first = split[0]?.[0];
  const hasCommonRoot =
    !!first &&
    split.every((segments) => segments.length >= 3 && segments[0] === first);

  if (!hasCommonRoot) return paths;
  return split.map((segments) => segments.slice(1).join("/"));
}

export function analyzeTraitFolder(
  uploadedFiles: UploadedTraitFile[]
): TraitImportAnalysis {
  const warnings: TraitImportWarning[] = [];
  const ignoredFiles: string[] = [];

  const cleaned = uploadedFiles
    .map((file) => ({
      ...file,
      relativePath: cleanPath(file.relativePath || file.name),
    }))
    .filter((file) => {
      if (!file.relativePath || shouldIgnore(file.relativePath)) {
        ignoredFiles.push(file.relativePath || file.name);
        return false;
      }

      if (!SUPPORTED_EXTENSIONS.has(ext(file.name || file.relativePath))) {
        ignoredFiles.push(file.relativePath);
        warnings.push({
          code: "unsupported_file",
          message: `Ignored unsupported trait file: ${file.relativePath}`,
          path: file.relativePath,
        });
        return false;
      }

      return true;
    });

  const strippedPaths = stripCommonCollectionRoot(
    cleaned.map((file) => file.relativePath)
  );

  const layerMap = new Map<string, ImportedTraitLayer>();

  cleaned.forEach((file, index) => {
    const relativePath = strippedPaths[index] || file.relativePath;
    const segments = relativePath.split("/").filter(Boolean);

    if (segments.length < 2) {
      warnings.push({
        code: "empty_layer_name",
        message: `Trait file is not inside a layer folder: ${relativePath}`,
        path: relativePath,
      });
      return;
    }

    const layerName = segments[0]?.trim() || "";
    if (!layerName) {
      warnings.push({
        code: "empty_layer_name",
        message: `Could not determine layer for: ${relativePath}`,
        path: relativePath,
      });
      return;
    }

    const fileName = segments[segments.length - 1] || file.name;
    const rarityGroup =
      segments.length >= 3 ? segments.slice(1, -1).join("/") : undefined;
    const traitValue = withoutExt(fileName).trim();

    let layer = layerMap.get(layerName);
    if (!layer) {
      layer = {
        name: layerName,
        suggestedOrder: layerMap.size,
        likelyBackground: BACKGROUND_LAYER_NAMES.has(
          normalizedLayerName(layerName)
        ),
        assets: [],
      };
      layerMap.set(layerName, layer);
    }

    if (
      layer.assets.some(
        (asset) =>
          asset.traitValue.trim().toLowerCase() === traitValue.toLowerCase()
      )
    ) {
      warnings.push({
        code: "duplicate_trait_value",
        message: `Duplicate trait value "${traitValue}" found in layer "${layerName}".`,
        path: relativePath,
      });
    }

    layer.assets.push({
      layerName,
      traitValue,
      relativePath,
      rarityGroup,
    });
  });

  const layers = Array.from(layerMap.values());

  if (!layers.length) {
    warnings.push({
      code: "no_trait_assets",
      message:
        "No supported trait images were found. LockScreened currently expects PNG or WebP trait artwork.",
    });
  }

  return { layers, warnings, ignoredFiles };
}
