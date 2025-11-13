"use client";

import { useEffect, useState } from "react";

export default function FontDebug() {
  const [archiUsed, setArchiUsed] = useState("");
  const [pixelUsed, setPixelUsed] = useState("");
  const [systemUsed, setSystemUsed] = useState("");

  useEffect(() => {
    const a = document.getElementById("s-archi");
    const p = document.getElementById("s-pixel");
    const s = document.getElementById("s-system");
    if (a) setArchiUsed(getComputedStyle(a).fontFamily);
    if (p) setPixelUsed(getComputedStyle(p).fontFamily);
    if (s) setSystemUsed(getComputedStyle(s).fontFamily);
  }, []);

  return (
    <div className="debug-wrap">
      <div className="debug-card">
        <p className="debug-title">Custom font sample (ArchitypeVan via @font-face)</p>
        <div id="s-archi" className="sample fnt-archi">RETROGRAVE LOCKSCREEN LOCKER</div>
        <div className="code">computed: {archiUsed}</div>
      </div>

      <div className="debug-card">
        <p className="debug-title">Pixel font sample (Press Start 2P)</p>
        <div id="s-pixel" className="sample fnt-pixel">RETROGRAVE LOCKSCREEN LOCKER</div>
        <div className="code">computed: {pixelUsed}</div>
      </div>

      <div className="debug-card">
        <p className="debug-title">System font sample</p>
        <div id="s-system" className="sample fnt-system">RETROGRAVE LOCKSCREEN LOCKER</div>
        <div className="code">computed: {systemUsed}</div>
      </div>

      <div className="debug-card">
        <p className="debug-title">Font file check</p>
        <a className="code" href="/fonts/ArchitypeVan.ttf" target="_blank" rel="noreferrer">
          /fonts/ArchitypeVan.ttf
        </a>
        <p className="code">This link should download the font, not 404.</p>
      </div>
    </div>
  );
}
