"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoadedItem = {
  id: string;
  name: string;
  imageUrl: string;
};

const DOGGY_CDN = "https://cdn.doggy.market/content/";
const DOGE_BG5_COLOR = "#2b2440"; // ✅ tweak if you want it lighter/darker

function shortId(id: string) {
  return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

async function validateImageUrl(url: string): Promise<{
  ok: boolean;
  contentType?: string;
}> {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) {
      return { ok: true, contentType: head.headers.get("content-type") || "" };
    }
  } catch {}

  try {
    const get = await fetch(url, { method: "GET" });
    if (get.ok) {
      return { ok: true, contentType: get.headers.get("content-type") || "" };
    }
  } catch {}

  return { ok: false };
}

export default function DogeMinersNftsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const inscription = (sp.get("inscription") || "").trim();

  const item: LoadedItem | null = useMemo(() => {
    if (!inscription) return null;
    const imageUrl = `${DOGGY_CDN}${encodeURIComponent(inscription)}`;
    return {
      id: inscription,
      name: `DOGE MINERS ${shortId(inscription)}`,
      imageUrl,
    };
  }, [inscription]);

  const [status, setStatus] = useState<
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; contentType?: string }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!item) {
        setStatus({ kind: "error", message: "No inscription provided." });
        return;
      }

      setStatus({ kind: "loading" });
      const res = await validateImageUrl(item.imageUrl);

      if (cancelled) return;

      if (!res.ok) {
        setStatus({
          kind: "error",
          message:
            "Couldn’t load that inscription image from Doggy Market CDN. Double-check the Inscription ID.",
        });
        return;
      }

      setStatus({ kind: "ready", contentType: res.contentType });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [item]);

  function openInProjectNft() {
    if (!item) return;

    try {
      localStorage.setItem(
        "lockscreened:selectedNft",
        JSON.stringify({
          chain: "doge",
          id: item.id,
          name: item.name,
          image: item.imageUrl,
          source: "doggy.market",
        })
      );
    } catch {}

    router.push(
      `/project-nft?chain=doge&id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(
        item.name
      )}&image=${encodeURIComponent(item.imageUrl)}`
    );
  }

  return (
    <main
      className="magapixel-grid-page"
      style={{
        minHeight: "100vh",
        backgroundColor: DOGE_BG5_COLOR,
        backgroundImage: "none",
      }}
    >
      <div className="inner">
        <p className="back-row">
          <a href="/doge-miners" className="back-link">
            ← BACK TO DOGE MINERS
          </a>
        </p>

        <header className="page-header">
          <h1 className="page-title">DOGE MINERS</h1>
          <p className="page-subtitle">Inscription preview</p>
        </header>

        {!item ? (
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.28)",
              color: "white",
            }}
          >
            No inscription found in URL.
          </div>
        ) : (
          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.28)",
                color: "white",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>Inscription ID</div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 12,
                  wordBreak: "break-all",
                  opacity: 0.95,
                }}
              >
                {item.id}
              </div>
            </div>

            <div
              onClick={() => status.kind === "ready" && openInProjectNft()}
              style={{
                cursor: status.kind === "ready" ? "pointer" : "default",
                padding: 16,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.14)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.30))",
                color: "white",
                display: "grid",
                gap: 12,
                justifyItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>{item.name}</div>

              <div
                style={{
                  width: "min(420px, 92vw)",
                  aspectRatio: "9/16",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {status.kind === "loading" ? (
                  <div style={{ opacity: 0.8 }}>Loading preview…</div>
                ) : status.kind === "error" ? (
                  <div style={{ opacity: 0.9, padding: 12, textAlign: "center" }}>
                    {status.message}
                  </div>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (status.kind === "ready") openInProjectNft();
                }}
                disabled={status.kind !== "ready"}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background:
                    status.kind === "ready"
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.06)",
                  color:
                    status.kind === "ready"
                      ? "white"
                      : "rgba(255,255,255,0.55)",
                  cursor: status.kind === "ready" ? "pointer" : "not-allowed",
                  width: "min(320px, 92vw)",
                }}
              >
                Use this in Locker →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
