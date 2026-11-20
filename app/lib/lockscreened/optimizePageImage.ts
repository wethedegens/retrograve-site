export const MAX_PAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
const TARGET_BYTES = 300 * 1024;

export async function optimizePageImage(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Choose a PNG, JPEG or WebP image.");
  if (file.size > MAX_PAGE_UPLOAD_BYTES) throw new Error("This image is too large. Maximum file size: 8 MB per image.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("Could not open this image. Try another PNG, JPEG or WebP."));
      next.src = url;
    });
    if (image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error("This image has very large dimensions. Resize it below 40 megapixels and try again.");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser could not prepare the image. Try Chrome.");
    let maxDimension = 2560;
    for (let pass = 0; pass < 7; pass++) {
      const factor = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * factor));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * factor));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.9, 0.8, 0.65, 0.5]) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", quality));
        if (blob && blob.size <= TARGET_BYTES) {
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Could not prepare the image for saving."));
            reader.readAsDataURL(blob);
          });
        }
      }
      maxDimension = Math.round(maxDimension * 0.75);
    }
    throw new Error("Could not optimize this image. Try a simpler or smaller image; maximum upload size is 8 MB.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
