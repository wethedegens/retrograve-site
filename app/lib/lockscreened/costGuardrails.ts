// app/lib/lockscreened/costGuardrails.ts
//
// Cheap-by-construction upload limits for LockScreened Creator Studio.
// These are intentionally conservative enough for a Supabase Free beta while
// still being generous for pixel-art trait packs and curated wallpapers.
//
// IMPORTANT: these application limits are NOT a substitute for provider-side
// billing/spend caps. They are a second layer of protection.

const MB = 1024 * 1024;

export const COST_GUARDRAILS = {
  traitImport: {
    maxFiles: 1500,
    maxFileBytes: 2 * MB,
    maxBatchBytes: 100 * MB,
  },
  background: {
    maxFileBytes: 8 * MB,
    maxPackageBytes: 20 * MB,
    maxPackagesPerCollection: 40,
  },
  project: {
    softSourceStorageBytes: 50 * MB,
    hardSourceStorageBytes: 150 * MB,
  },
  freeTier: {
    /**
     * Stop accepting NEW source uploads before reaching the provider's full
     * storage allowance. This leaves breathing room for DB/storage metadata,
     * thumbnails, and mistakes during beta.
     */
    globalSourceStorageStopBytes: 850 * MB,
  },
} as const;

export type UploadGuardrailResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  totalBytes: number;
};

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

export function validateTraitImportFiles(
  files: Array<{ name: string; size?: number }>
): UploadGuardrailResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);

  if (files.length > COST_GUARDRAILS.traitImport.maxFiles) {
    errors.push(
      `This folder contains ${files.length} files. The beta limit is ${COST_GUARDRAILS.traitImport.maxFiles.toLocaleString()} trait files per import.`
    );
  }

  const oversized = files.filter(
    (file) => (file.size || 0) > COST_GUARDRAILS.traitImport.maxFileBytes
  );

  if (oversized.length) {
    errors.push(
      `${oversized.length} trait file${oversized.length === 1 ? "" : "s"} exceed the ${formatBytes(COST_GUARDRAILS.traitImport.maxFileBytes)} per-file beta limit.`
    );
  }

  if (totalBytes > COST_GUARDRAILS.traitImport.maxBatchBytes) {
    errors.push(
      `This trait folder is ${formatBytes(totalBytes)}. The beta import limit is ${formatBytes(COST_GUARDRAILS.traitImport.maxBatchBytes)}.`
    );
  } else if (
    totalBytes >
    COST_GUARDRAILS.project.softSourceStorageBytes
  ) {
    warnings.push(
      `This source pack is ${formatBytes(totalBytes)}, above our ${formatBytes(COST_GUARDRAILS.project.softSourceStorageBytes)} low-cost target for a collection.`
    );
  }

  return { ok: errors.length === 0, errors, warnings, totalBytes };
}

export function validateBackgroundFile(
  file: { name: string; size?: number } | null | undefined
): UploadGuardrailResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const totalBytes = file?.size || 0;

  if (!file) return { ok: true, errors, warnings, totalBytes: 0 };

  if (totalBytes > COST_GUARDRAILS.background.maxFileBytes) {
    errors.push(
      `${file.name} is ${formatBytes(totalBytes)}. Background source files are limited to ${formatBytes(COST_GUARDRAILS.background.maxFileBytes)} during beta.`
    );
  } else if (totalBytes > 5 * MB) {
    warnings.push(
      `${file.name} is fairly large (${formatBytes(totalBytes)}). We will generate lightweight previews before publishing.`
    );
  }

  return { ok: errors.length === 0, errors, warnings, totalBytes };
}

export function validateBackgroundPackage(
  files: Array<{ name: string; size?: number } | null | undefined>
): UploadGuardrailResult {
  const present = files.filter(Boolean) as Array<{
    name: string;
    size?: number;
  }>;

  const errors: string[] = [];
  const warnings: string[] = [];
  const totalBytes = present.reduce((sum, file) => sum + (file.size || 0), 0);

  for (const file of present) {
    const result = validateBackgroundFile(file);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (totalBytes > COST_GUARDRAILS.background.maxPackageBytes) {
    errors.push(
      `This background package totals ${formatBytes(totalBytes)}. The beta package limit is ${formatBytes(COST_GUARDRAILS.background.maxPackageBytes)}.`
    );
  }

  return { ok: errors.length === 0, errors, warnings, totalBytes };
}
