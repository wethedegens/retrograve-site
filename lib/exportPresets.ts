// Common portrait lock-screen resolutions (logical pixels).
// Add/modify as you like — the editor reads this list.
export type ExportPreset = {
  id: string;
  label: string;       // shown in the dropdown
  width: number;
  height: number;
};

export const EXPORT_PRESETS: ExportPreset[] = [
  // Universal
  { id: "FHD-1080x1920", label: "1080 × 1920 (Full HD)", width: 1080, height: 1920 },

  // iPhone
  { id: "iph-x-1125x2436",     label: "iPhone X / XS / 11 Pro — 1125 × 2436", width: 1125, height: 2436 },
  { id: "iph-xr-828x1792",     label: "iPhone XR / 11 — 828 × 1792",          width: 828,  height: 1792 },
  { id: "iph-12-1170x2532",    label: "iPhone 12 / 12 Pro / 13 / 14 — 1170 × 2532", width: 1170, height: 2532 },
  { id: "iph-12pm-1284x2778",  label: "iPhone 12/13/14 Pro Max — 1284 × 2778", width: 1284, height: 2778 },
  { id: "iph-15pro-1179x2556", label: "iPhone 15 Pro — 1179 × 2556",           width: 1179, height: 2556 },
  { id: "iph-15pm-1290x2796",  label: "iPhone 15 Pro Max — 1290 × 2796",       width: 1290, height: 2796 },

  // Android (popular)
  { id: "and-1080x2340", label: "Android 1080 × 2340", width: 1080, height: 2340 }, // e.g., Galaxy S21/S22/S23 base
  { id: "and-1080x2400", label: "Android 1080 × 2400", width: 1080, height: 2400 }, // Pixel 6/7/8, many others
  { id: "and-1200x2664", label: "Android 1200 × 2664", width: 1200, height: 2664 }, // some mid/high devices
  { id: "and-1344x2992", label: "Android 1344 × 2992", width: 1344, height: 2992 }, // Pixel 8 Pro, etc.
  { id: "and-1440x3040", label: "Android 1440 × 3040", width: 1440, height: 3040 }, // Galaxy S10/S20 class
  { id: "and-1440x3088", label: "Android 1440 × 3088", width: 1440, height: 3088 }, // S22+/S23+
  { id: "and-1440x3200", label: "Android 1440 × 3200", width: 1440, height: 3200 }, // S20/S21/S22/S23 Ultra

  // Fallback / future
  { id: "QHD-1440x2560", label: "1440 × 2560 (QHD portrait)", width: 1440, height: 2560 },

  // Custom (UI will expose width/height fields)
  { id: "custom", label: "Custom…", width: 1080, height: 1920 }
];
