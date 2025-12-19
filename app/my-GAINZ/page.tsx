// app/my-GAINZ/page.tsx
"use client";

export default function MyGAINZPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "120px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
        GAINZ — Locker (WIP)
      </h1>

      <p style={{ maxWidth: "520px", opacity: 0.8 }}>
        This is a placeholder page to validate routing and deployment.
        Cosmetics and locker logic will be added after structure is confirmed.
      </p>
    </main>
  );
}
