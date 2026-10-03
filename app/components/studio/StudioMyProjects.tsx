// app/components/studio/StudioMyProjects.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getFreshSession,
  readStoredSession,
} from "../../lib/lockscreened/web3AuthClient";
import {
  listMyStudioCollections,
  type StudioCollectionRow,
} from "../../lib/lockscreened/studioDataClient";

type Row = StudioCollectionRow & { claim_status?: string };

export default function StudioMyProjects() {
  const [rows, setRows] = useState<Row[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const session = (await getFreshSession()) || readStoredSession();
      if (!active) return;

      setSignedIn(Boolean(session));

      if (!session) {
        setRows([]);
        return;
      }

      try {
        const data = await listMyStudioCollections(session);
        if (active) setRows(data);
      } catch {
        if (active) setRows([]);
      }
    }

    load();
    const listener = () => load();
    window.addEventListener("lockscreened-auth-changed", listener);
    window.addEventListener("lockscreened-studio-data-changed", listener);

    return () => {
      active = false;
      window.removeEventListener("lockscreened-auth-changed", listener);
      window.removeEventListener("lockscreened-studio-data-changed", listener);
    };
  }, []);

  if (!signedIn) return null;

  const activeRows = rows.filter((row) => row.publish_status !== "archived");
  const archivedRows = rows.filter((row) => row.publish_status === "archived");

  return (
    <section
      style={{
        marginBottom: 24,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,.09)",
        background: "rgba(10,8,20,.62)",
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#ff8dce",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".17em",
            }}
          >
            MY STUDIO DATA
          </div>
          <h2 style={{ margin: "5px 0 0", fontSize: 19 }}>
            My LockScreened projects
          </h2>
        </div>
        <span
          style={{
            color: "rgba(255,255,255,.42)",
            fontSize: 9,
          }}
        >
          {activeRows.length} active · {archivedRows.length} archived
        </span>
      </div>

      {!rows.length ? (
        <p
          style={{
            margin: "12px 0 0",
            color: "rgba(255,255,255,.5)",
            fontSize: 10,
          }}
        >
          No founder projects yet. Verify a collection below to create your first
          Supabase-backed LockScreened project.
        </p>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 14 }}>
          {activeRows.length ? (
            <ProjectGroup title="ACTIVE PROJECTS" rows={activeRows} />
          ) : null}

          {archivedRows.length ? (
            <ProjectGroup title="ARCHIVED · PRESERVED" rows={archivedRows} muted />
          ) : null}
        </div>
      )}
    </section>
  );
}


function ProjectGroup({
  title,
  rows,
  muted = false,
}: {
  title: string;
  rows: Row[];
  muted?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      <div
        style={{
          color: muted ? "rgba(255,255,255,.34)" : "#ff8dce",
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: ".14em",
        }}
      >
        {title}
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            borderRadius: 13,
            border: "1px solid rgba(255,255,255,.07)",
            background: muted
              ? "rgba(255,255,255,.015)"
              : "linear-gradient(135deg,rgba(255,63,180,.025),rgba(143,107,255,.025))",
            padding: 11,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 10,
            alignItems: "center",
            opacity: muted ? 0.72 : 1,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <strong
              style={{
                display: "block",
                fontSize: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.name}
            </strong>
            <span
              style={{
                color: "rgba(255,255,255,.43)",
                fontSize: 9,
              }}
            >
              {row.render_mode} · {row.source_type}
            </span>
          </div>

          <div
            style={{
              textAlign: "right",
              display: "grid",
              gap: 5,
              justifyItems: "end",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: ".1em",
                color:
                  row.claim_status === "verified"
                    ? "#a9ffd2"
                    : "#ffd99d",
              }}
            >
              CLAIM {(row.claim_status || "NONE").toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,.38)",
              }}
            >
              PROJECT {row.publish_status.toUpperCase()}
            </span>
            <a
              href={"/studio/manage/" + row.id}
              style={{
                color: "#ff9bd8",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: ".08em",
                textDecoration: "none",
              }}
            >
              {row.publish_status === "archived" ? "OPEN / RESTORE →" : "MANAGE →"}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
