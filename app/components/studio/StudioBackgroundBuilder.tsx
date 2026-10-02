// app/components/studio/StudioBackgroundBuilder.tsx
"use client";

import { useMemo, useState } from "react";
import {
  formatBytes,
  validateBackgroundFile,
  validateBackgroundPackage,
} from "../../lib/lockscreened/costGuardrails";

type LocalAsset = {
  file: File;
  url: string;
};

type SlotProps = {
  title: string;
  subtitle: string;
  asset: LocalAsset | null;
  onPick: (file: File | null) => void;
};

function Slot({ title, subtitle, asset, onPick }: SlotProps) {
  return (
    <label
      style={{
        minHeight: 220,
        borderRadius: 18,
        border: "1px dashed rgba(255,255,255,.18)",
        background: "rgba(255,255,255,.035)",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        display: "grid",
      }}
    >
      <input
        type="file"
        accept="image/png,image/webp,image/jpeg"
        style={{ display: "none" }}
        onChange={(event) => onPick(event.target.files?.[0] || null)}
      />

      {asset ? (
        <>
          <img
            src={asset.url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              minHeight: 220,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              padding: "30px 12px 11px",
              background:
                "linear-gradient(to bottom, transparent, rgba(0,0,0,.86))",
              display: "grid",
              gap: 3,
            }}
          >
            <strong style={{ fontSize: 11, letterSpacing: ".12em" }}>
              {title.toUpperCase()}
            </strong>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.56)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {asset.file.name}
            </span>
          </div>
        </>
      ) : (
        <div
          style={{
            minHeight: 220,
            display: "grid",
            placeItems: "center",
            alignContent: "center",
            gap: 7,
            textAlign: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(205,183,255,.18)",
              background: "rgba(205,183,255,.08)",
              color: "#d7c8ff",
              fontSize: 23,
            }}
          >
            +
          </div>
          <strong style={{ fontSize: 11, letterSpacing: ".12em" }}>
            {title.toUpperCase()}
          </strong>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.48)" }}>
            {subtitle}
          </span>
        </div>
      )}
    </label>
  );
}

export default function StudioBackgroundBuilder() {
  const [name, setName] = useState("New Official Background");
  const [phone, setPhone] = useState<LocalAsset | null>(null);
  const [ipad, setIpad] = useState<LocalAsset | null>(null);
  const [desktop, setDesktop] = useState<LocalAsset | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function replace(
    current: LocalAsset | null,
    setter: (next: LocalAsset | null) => void,
    file: File | null
  ) {
    if (!file) {
      if (current) URL.revokeObjectURL(current.url);
      setter(null);
      setFileError(null);
      return;
    }

    const result = validateBackgroundFile(file);
    if (!result.ok) {
      setFileError(result.errors[0] || "This file exceeds the beta upload limit.");
      return;
    }

    if (current) URL.revokeObjectURL(current.url);
    setter({ file, url: URL.createObjectURL(file) });
    setFileError(result.warnings[0] || null);
  }

  const packageBudget = useMemo(
    () =>
      validateBackgroundPackage([
        phone?.file || null,
        ipad?.file || null,
        desktop?.file || null,
      ]),
    [phone, ipad, desktop]
  );

  const complete = Boolean(phone && ipad && desktop);
  const mode = complete
    ? "ART-DIRECTED · PHONE / IPAD / DESKTOP"
    : phone
      ? "PHONE SOURCE · MISSING VARIANTS FALL BACK SAFELY"
      : "WAITING FOR PHONE SOURCE";

  return (
    <section
      style={{
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(9,8,18,.72)",
        boxShadow: "0 24px 70px rgba(0,0,0,.35)",
        padding: 22,
        backdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 18,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#8ee7ff",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: ".22em",
            }}
          >
            OFFICIAL BACKGROUNDS
          </div>
          <h2 style={{ margin: "6px 0", fontSize: 24 }}>
            Build a background package
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: 720,
              color: "rgba(255,255,255,.66)",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            Upload one phone-first background and let LockScreened adapt it, or
            add separate iPad and desktop compositions like our current
            flagship collections.
          </p>
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".12em",
            color: "#9ee9ff",
            textAlign: "right",
          }}
        >
          {mode}
        </div>
      </div>

      <div style={{ marginTop: 17, display: "grid", gap: 6, maxWidth: 520 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".14em",
            color: "rgba(255,255,255,.5)",
          }}
        >
          BACKGROUND NAME
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{
            height: 42,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(0,0,0,.22)",
            color: "#fff",
            padding: "0 12px",
            outline: "none",
          }}
        />
      </div>

      {fileError ? (
        <div
          style={{
            marginTop: 12,
            borderRadius: 12,
            padding: "9px 11px",
            border: "1px solid rgba(255,174,108,.18)",
            background: "rgba(255,174,108,.07)",
            color: "#ffd7b8",
            fontSize: 10,
          }}
        >
          {fileError}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 13,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 11,
        }}
      >
        <Slot
          title="Phone"
          subtitle="Required · canonical source"
          asset={phone}
          onPick={(file) => replace(phone, setPhone, file)}
        />
        <Slot
          title="iPad"
          subtitle="Optional · falls back to phone"
          asset={ipad}
          onPick={(file) => replace(ipad, setIpad, file)}
        />
        <Slot
          title="Desktop"
          subtitle="Optional · falls back to phone"
          asset={desktop}
          onPick={(file) => replace(desktop, setDesktop, file)}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 3 }}>
          <strong style={{ fontSize: 12 }}>
            {name.trim() || "Untitled background"}
          </strong>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>
            {phone
              ? `Local package: ${formatBytes(packageBudget.totalBytes)}. Storage and publishing stay disabled until the collection is verified.`
              : "Choose a phone image to create the package."}
          </span>
        </div>
        <div
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.1)",
            padding: "8px 11px",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".1em",
            color:
              phone && packageBudget.ok
                ? "#a8ffd2"
                : phone
                  ? "#ffd1b3"
                  : "rgba(255,255,255,.34)",
          }}
        >
          {phone
            ? packageBudget.ok
              ? "LOCAL PREVIEW READY"
              : "PACKAGE TOO LARGE"
            : "NOT UPLOADED"}
        </div>
      </div>
    </section>
  );
}
