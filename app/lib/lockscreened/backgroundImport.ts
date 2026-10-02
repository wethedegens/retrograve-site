// app/lib/lockscreened/backgroundImport.ts
//
// Validation helpers for founder-created background packages.
// A creator may upload one phone/background image and let LockScreened adapt it,
// or provide art-directed phone/iPad/desktop variants like the current flagship
// collections already use.

import type { DeviceAssetSet } from "./types";

export type BackgroundImportDraft = {
  name: string;
  phone?: string;
  ipad?: string;
  desktop?: string;
  autoAdaptMissingVariants?: boolean;
};

export type BackgroundImportValidation = {
  valid: boolean;
  assets?: DeviceAssetSet;
  errors: string[];
  warnings: string[];
};

export function validateBackgroundImport(
  draft: BackgroundImportDraft
): BackgroundImportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const name = String(draft.name || "").trim();
  const phone = String(draft.phone || "").trim();
  const ipad = String(draft.ipad || "").trim();
  const desktop = String(draft.desktop || "").trim();

  if (!name) errors.push("Background name is required.");

  // Phone remains the canonical/fallback asset because the current Locker is
  // phone-first and Composer already knows how to adapt a single image.
  if (!phone) {
    errors.push("A phone/background source image is required.");
  }

  if (!ipad && !draft.autoAdaptMissingVariants) {
    warnings.push(
      "No iPad-specific artwork was provided. The phone artwork will be used as the fallback."
    );
  }

  if (!desktop && !draft.autoAdaptMissingVariants) {
    warnings.push(
      "No desktop-specific artwork was provided. The phone artwork will be used as the fallback."
    );
  }

  if (errors.length || !phone) {
    return { valid: false, errors, warnings };
  }

  return {
    valid: true,
    errors,
    warnings,
    assets: {
      phone,
      ...(ipad ? { ipad } : {}),
      ...(desktop ? { desktop } : {}),
    },
  };
}
