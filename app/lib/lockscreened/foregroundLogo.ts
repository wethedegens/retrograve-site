export type ForegroundLogo = { dataUrl: string; width: number; x: "left" | "center" | "right"; y: "top" | "center" | "bottom"; defaultVisible: boolean };

// Small PNGs only: the logo is stored with the private render settings, not as a source/background.
export function cleanForegroundLogo(value: any): ForegroundLogo | null {
  if (value === null) return null;
  if (!value || typeof value.dataUrl !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.dataUrl)) throw new Error("Choose a PNG logo.");
  const encoded = value.dataUrl.slice(22);
  if (encoded.length > 700000) throw new Error("Choose a PNG logo under 512 KB.");
  const binary = atob(encoded);
  if (binary.length > 512 * 1024 || binary.length < 33 ||
      [...[137,80,78,71,13,10,26,10]].some((n,i) => binary.charCodeAt(i) !== n) || binary.slice(12,16) !== "IHDR") throw new Error("Invalid PNG logo.");
  const dimension = (offset: number) => [0,1,2,3].reduce((n,i) => n * 256 + binary.charCodeAt(offset+i), 0);
  if (![dimension(16), dimension(20)].every(n => n > 0 && n <= 4096)) throw new Error("Logo dimensions must be at most 4096 pixels.");
  return { dataUrl: value.dataUrl, width: Math.max(0.05, Math.min(0.5, Number(value.width) || 0.2)),
    x: ["left","center","right"].includes(value.x) ? value.x : "right",
    y: ["top","center","bottom"].includes(value.y) ? value.y : "top", defaultVisible: value.defaultVisible !== false };
}

export function drawForegroundLogo(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, logo: ForegroundLogo) {
  const margin = Math.min(width, height) * 0.04;
  const scale = Math.min(width * logo.width / image.width, height * 0.25 / image.height);
  const w = image.width * scale, h = image.height * scale;
  const x = logo.x === "left" ? margin : logo.x === "right" ? width-w-margin : (width-w)/2;
  const y = logo.y === "top" ? margin : logo.y === "bottom" ? height-h-margin : (height-h)/2;
  ctx.drawImage(image,x,y,w,h);
}
