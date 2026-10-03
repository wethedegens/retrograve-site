// app/components/studio/StudioTraitValidation.tsx
"use client";

import { useMemo, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { matchMetadataToTraitAssets } from "../../lib/lockscreened/traitMapping";

type Props = {
  session: LockScreenedSession;
  collectionId: string;
  verified: boolean;
  layers: any[];
  traitAssets: any[];
};

export default function StudioTraitValidation({
  session,
  collectionId,
  verified,
  layers,
  traitAssets,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [sample, setSample] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const importedLayers = useMemo(
    () =>
      layers.map((layer: any) => ({
        name: layer.display_name || layer.trait_type,
        suggestedOrder: Number(layer.layer_order || 0),
        likelyBackground: Boolean(layer.is_background),
        assets: traitAssets
          .filter((asset: any) => asset.layer_id === layer.id)
          .map((asset: any) => ({
            layerName: layer.display_name || layer.trait_type,
            traitValue: asset.trait_value,
            relativePath: asset.storage_path,
          })),
      })),
    [layers, traitAssets]
  );

  const results = useMemo(
    () =>
      sample.map((nft) => ({
        nft,
        match: matchMetadataToTraitAssets(
          importedLayers,
          nft.attributes || []
        ),
      })),
    [sample, importedLayers]
  );

  const totals = useMemo(() => {
    const matched = results.reduce(
      (sum, result) => sum + result.match.matched.length,
      0
    );
    const missing = results.reduce(
      (sum, result) => sum + result.match.missing.length,
      0
    );
    const unused = results.reduce(
      (sum, result) => sum + result.match.unusedMetadata.length,
      0
    );

    return { matched, missing, unused };
  }, [results]);

  async function runValidation() {
    setBusy(true);
    setMessage("");
    setSample([]);

    try {
      const response = await fetch("/api/studio/validation-sample", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({ collectionId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Validation sample failed.");
      }

      setSample(data.sample || []);
      setMessage(
        `Checked ${data.sample?.length || 0} minted NFTs against the private trait library.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Validation failed."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={panel}>
      <div style={eyebrow}>RECONSTRUCTION VALIDATION</div>
      <h2 style={heading}>Check real minted metadata</h2>
      <p style={copy}>
        Pull a small Helius sample and verify that each minted trait can find
        the founder&apos;s uploaded source asset before visual reconstruction.
      </p>

      <div style={{ marginTop: 11, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={runValidation}
          disabled={
            busy ||
            !verified ||
            !layers.length ||
            !traitAssets.length
          }
          style={button}
        >
          {busy ? "CHECKING SAMPLE…" : "RUN TRAIT VALIDATION"}
        </button>

        {!verified ? <span style={pill}>VERIFY CLAIM FIRST</span> : null}
        {verified && !traitAssets.length ? (
          <span style={pill}>UPLOAD TRAIT SOURCES FIRST</span>
        ) : null}
      </div>

      {message ? <div style={notice}>{message}</div> : null}

      {results.length ? (
        <>
          <div style={stats}>
            <Stat label="NFT SAMPLE" value={String(results.length)} />
            <Stat label="TRAITS MATCHED" value={String(totals.matched)} />
            <Stat label="MISSING FILES" value={String(totals.missing)} />
            <Stat label="UNMAPPED METADATA" value={String(totals.unused)} />
          </div>

          <div style={{ marginTop: 11, display: "grid", gap: 7 }}>
            {results.map(({ nft, match }) => {
              const problemCount =
                match.missing.length + match.unusedMetadata.length;

              return (
                <div key={nft.id} style={row}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "rgba(255,255,255,.04)",
                      flex: "0 0 auto",
                    }}
                  >
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {nft.name}
                    </strong>
                    <span style={muted}>
                      {match.matched.length} matched · {match.missing.length}{" "}
                      missing · {match.unusedMetadata.length} unmapped
                    </span>

                    {problemCount ? (
                      <div
                        style={{
                          marginTop: 5,
                          display: "flex",
                          gap: 5,
                          flexWrap: "wrap",
                        }}
                      >
                        {match.missing.slice(0, 4).map((item: any) => (
                          <span
                            key={"m-" + item.traitType + item.traitValue}
                            style={badChip}
                          >
                            MISSING {item.traitType}: {item.traitValue}
                          </span>
                        ))}
                        {match.unusedMetadata
                          .slice(0, 4)
                          .map((item: any) => (
                            <span
                              key={"u-" + item.traitType + item.traitValue}
                              style={warnChip}
                            >
                              UNMAPPED {item.traitType}
                            </span>
                          ))}
                      </div>
                    ) : null}
                  </div>

                  <span
                    style={{
                      ...statusPill,
                      color: problemCount ? "#ffd49e" : "#a9ffd2",
                    }}
                  >
                    {problemCount ? "REVIEW" : "MATCH"}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        padding: 9,
        border: "1px solid rgba(255,255,255,.07)",
        background: "rgba(255,255,255,.025)",
        display: "grid",
        gap: 2,
      }}
    >
      <span style={{ fontSize: 8, color: "rgba(255,255,255,.4)" }}>
        {label}
      </span>
      <strong style={{ fontSize: 15 }}>{value}</strong>
    </div>
  );
}

const panel = {
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(10,8,20,.72)",
  boxShadow: "0 20px 60px rgba(0,0,0,.25)",
} as const;
const eyebrow = {
  color: "#8ee7ff",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".17em",
} as const;
const heading = { margin: "6px 0 5px", fontSize: 19 } as const;
const copy = {
  margin: 0,
  color: "rgba(255,255,255,.55)",
  fontSize: 11,
  lineHeight: 1.55,
} as const;
const button = {
  display: "inline-flex",
  minHeight: 36,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "0 12px",
  border: "1px solid rgba(142,231,255,.16)",
  background: "rgba(77,185,224,.09)",
  color: "#fff",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".08em",
} as const;
const pill = {
  display: "inline-flex",
  minHeight: 36,
  alignItems: "center",
  borderRadius: 999,
  padding: "0 9px",
  border: "1px solid rgba(255,255,255,.08)",
  color: "rgba(255,255,255,.42)",
  fontSize: 8,
  fontWeight: 900,
} as const;
const notice = {
  marginTop: 10,
  borderRadius: 12,
  padding: 9,
  background: "rgba(255,255,255,.025)",
  border: "1px solid rgba(255,255,255,.07)",
  color: "rgba(255,255,255,.6)",
  fontSize: 10,
} as const;
const stats = {
  marginTop: 11,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
  gap: 7,
} as const;
const row = {
  borderRadius: 13,
  padding: 9,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.025)",
  display: "flex",
  gap: 9,
  alignItems: "center",
} as const;
const muted = {
  color: "rgba(255,255,255,.42)",
  fontSize: 9,
} as const;
const statusPill = {
  borderRadius: 999,
  padding: "5px 7px",
  border: "1px solid rgba(255,255,255,.08)",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".08em",
} as const;
const badChip = {
  borderRadius: 999,
  padding: "3px 5px",
  background: "rgba(255,98,98,.07)",
  border: "1px solid rgba(255,98,98,.14)",
  color: "#ffb2b2",
  fontSize: 7,
} as const;
const warnChip = {
  borderRadius: 999,
  padding: "3px 5px",
  background: "rgba(255,184,78,.06)",
  border: "1px solid rgba(255,184,78,.14)",
  color: "#ffd49e",
  fontSize: 7,
} as const;
