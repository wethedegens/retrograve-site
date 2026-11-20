export type PageKind = "welcome" | "gallery" | "editor";
export type PageBackground = { image: string; mode: "cover" | "repeat"; x: number; y: number; darkness: number };
export type PageAppearance = { separate: boolean; shared: PageBackground; welcome: PageBackground; gallery: PageBackground; editor: PageBackground };
export const defaultPageBackground: PageBackground = { image: "", mode: "cover", x: 50, y: 50, darkness: 45 };
export function cleanPageAppearance(value: any): PageAppearance {
  const clean = (input: any): PageBackground => {
    const image = typeof input?.image === "string" ? input.image : "";
    if (image) {
      if (image.length > 410000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image)) throw new Error("Use PNG, JPEG or WebP page images under 300 KB.");
      const data = atob(image.split(",")[1]);
      const valid = image.startsWith("data:image/png;") ? data.startsWith("\x89PNG\r\n\x1a\n") : image.startsWith("data:image/jpeg;") ? data.startsWith("\xff\xd8\xff") : data.startsWith("RIFF") && data.slice(8,12) === "WEBP";
      if (!valid || data.length > 300 * 1024) throw new Error("Invalid or oversized page image.");
    }
    const number = (n: unknown, fallback: number) => typeof n === "number" && Number.isFinite(n) ? Math.max(0,Math.min(100,n)) : fallback;
    return { image, mode: input?.mode === "repeat" ? "repeat" : "cover", x: number(input?.x,50), y: number(input?.y,50), darkness: number(input?.darkness,45) };
  };
  return { separate: value?.separate === true, shared: clean(value?.shared), welcome: clean(value?.welcome), gallery: clean(value?.gallery), editor: clean(value?.editor) };
}
export function pageBackground(appearance: PageAppearance, page: PageKind) {
  return appearance.separate ? appearance[page] : appearance.shared;
}
export function pageBackgroundStyle(background: PageBackground) {
  return { backgroundImage: background.image ? `url("${background.image}")` : undefined,
    backgroundPosition: `${background.x}% ${background.y}%`, backgroundSize: background.mode === "repeat" ? "240px auto" : "cover",
    backgroundRepeat: background.mode === "repeat" ? "repeat" : "no-repeat" } as const;
}
