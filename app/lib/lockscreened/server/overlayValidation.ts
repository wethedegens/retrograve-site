import sharp from "sharp";
import type {OverlayLibrary} from "../overlayLibrary";
export async function validateOverlayImages(library:OverlayLibrary) {
  for(const item of library.items)for(const dataUrl of Object.values(item.images)) {
    const image=sharp(Buffer.from(dataUrl.slice(22),"base64"),{limitInputPixels:4_194_304,animated:false});
    const meta=await image.metadata();
    if(meta.format!=="png"||!meta.hasAlpha||(meta.pages||1)!==1)throw new Error("Overlays need still PNG images with transparency.");
    const stats=await image.stats();
    if(stats.isOpaque)throw new Error("This PNG has no transparent areas. Use a transparent overlay so the NFT stays visible.");
  }
}
