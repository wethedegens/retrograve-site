"use client";

export default function StudioWordmark() {
  return <span className="studio-wordmark" role="img" aria-label="LockScreened">
    <svg aria-hidden="true" width="30" height="38" viewBox="0 0 30 38" fill="none">
      <rect x="2" y="1" width="26" height="36" rx="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 13a4 4 0 0 0-2.2 7.35L11 27h8l-1.8-6.65A4 4 0 0 0 15 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
    <span>LOCK<span className="screened">SCREENED</span><small>ART BEYOND THE FRAME</small></span>
    <style jsx>{`
      .studio-wordmark{display:inline-flex;align-items:center;gap:12px;color:#f2f2f2;font:800 clamp(17px,2.5vw,24px)/1.1 Arial,sans-serif;letter-spacing:-.06em;white-space:nowrap}
      .screened{font-weight:400;letter-spacing:-.04em}small{display:block;font:10px/1.5 ui-monospace,monospace;letter-spacing:.2em;color:#aaa;margin-top:4px}
      @media(max-width:480px){.studio-wordmark{gap:8px}small{font-size:8px;letter-spacing:.12em}}
    `}</style>
  </span>;
}
