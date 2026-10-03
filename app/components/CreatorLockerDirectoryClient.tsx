// app/components/CreatorLockerDirectoryClient.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Project = {
  id: string;
  slug: string;
  name: string;
  render_mode: string;
  public_profile?: {
    tagline?: string;
    description?: string;
  };
  preview?: string;
  published_at?: string | null;
};

function labelRenderMode(mode: string) {
  const value = String(mode || "").replace(/_/g, " ").trim();
  return value ? value.toUpperCase() : "LOCKSCREENED";
}

export default function CreatorLockerDirectoryClient({
  projects,
}: {
  projects: Project[];
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");

  const modes = useMemo(
    () =>
      Array.from(
        new Set(projects.map((project) => project.render_mode).filter(Boolean))
      ),
    [projects]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return projects.filter((project) => {
      const modeMatch = mode === "all" || project.render_mode === mode;
      if (!modeMatch) return false;

      if (!needle) return true;

      const haystack = [
        project.name,
        project.public_profile?.tagline,
        project.public_profile?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [projects, query, mode]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={controls}>
        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
          <div style={controlLabel}>SEARCH CREATOR LOCKERS</div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Project name or keyword"
            style={input}
          />
        </div>

        <div style={{ minWidth: 180, flex: "0 1 260px" }}>
          <div style={controlLabel}>RENDER TYPE</div>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            style={input}
          >
            <option value="all">All creator lockers</option>
            {modes.map((item) => (
              <option key={item} value={item}>
                {labelRenderMode(item)}
              </option>
            ))}
          </select>
        </div>

        <div style={countPill}>
          {filtered.length} / {projects.length}
        </div>
      </section>

      {!filtered.length ? (
        <div style={empty}>
          No Creator Lockers match that search yet.
        </div>
      ) : (
        <section style={grid}>
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={"/projects/" + project.slug}
              style={card}
            >
              <div style={phone}>
                {project.preview ? (
                  <img
                    src={project.preview}
                    alt={project.name}
                    style={image}
                  />
                ) : (
                  <div style={placeholder}>LOCKSCREENED</div>
                )}

                <div style={verified}>AUTHORITY VERIFIED</div>
              </div>

              <div style={cardText}>
                <strong style={{ fontSize: 12 }}>{project.name}</strong>
                <span style={tagline}>
                  {project.public_profile?.tagline ||
                    "Creator Studio locker"}
                </span>
                <span style={modeLabel}>
                  {labelRenderMode(project.render_mode)}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

const controls = {
  borderRadius: 18,
  padding: 12,
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(10,8,20,.66)",
  display: "flex",
  gap: 10,
  alignItems: "end",
  flexWrap: "wrap",
} as const;

const controlLabel = {
  marginBottom: 5,
  color: "#ff8dce",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".12em",
} as const;

const input = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: 38,
  borderRadius: 11,
  border: "1px solid rgba(255,255,255,.1)",
  background: "#11101a",
  color: "#fff",
  padding: "0 10px",
  outline: "none",
  fontSize: 10,
} as const;

const countPill = {
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 11px",
  border: "1px solid rgba(255,99,194,.14)",
  color: "#ff9bd8",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".08em",
} as const;

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
  gap: 14,
} as const;

const card = {
  minWidth: 0,
  borderRadius: 20,
  padding: 9,
  background:
    "linear-gradient(145deg,rgba(14,10,28,.72),rgba(9,8,18,.62))",
  border: "1px solid rgba(255,255,255,.1)",
  color: "#fff",
  textDecoration: "none",
  boxShadow: "0 18px 42px rgba(0,0,0,.22)",
} as const;

const phone = {
  position: "relative",
  width: "100%",
  aspectRatio: "9 / 19.5",
  overflow: "hidden",
  borderRadius: 14,
  background: "rgba(255,255,255,.035)",
} as const;

const image = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
} as const;

const placeholder = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "rgba(255,255,255,.28)",
  fontSize: 8,
  letterSpacing: ".12em",
} as const;

const verified = {
  position: "absolute",
  left: 9,
  top: 9,
  borderRadius: 999,
  padding: "4px 6px",
  background: "rgba(7,6,13,.78)",
  border: "1px solid rgba(169,255,210,.2)",
  color: "#a9ffd2",
  fontSize: 6,
  fontWeight: 900,
  letterSpacing: ".07em",
} as const;

const cardText = {
  padding: "9px 3px 3px",
  display: "grid",
  gap: 4,
} as const;

const tagline = {
  color: "rgba(255,255,255,.52)",
  fontSize: 8,
  lineHeight: 1.4,
} as const;

const modeLabel = {
  color: "#ff8dce",
  fontSize: 7,
  fontWeight: 900,
  letterSpacing: ".07em",
} as const;

const empty = {
  borderRadius: 20,
  padding: 22,
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(10,8,20,.66)",
  color: "rgba(255,255,255,.58)",
  fontSize: 11,
} as const;
