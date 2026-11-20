/** Use the dominant opaque border color, not an average polluted by foreground art. */
export function edgeBackgroundColor(pixels: ArrayLike<number>, width: number, height: number) {
  const colors = new Map<number, number>();
  let winner = 0;
  let highestCount = 0;
  const border = Math.max(1, Math.floor(Math.min(width, height) / 32));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= border && x < width - border && y >= border && y < height - border) continue;
      const i = (y * width + x) * 4;
      // Partially transparent colors depend on the surface beneath them.
      if (pixels[i + 3] < 250) continue;
      const rgb = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
      const count = (colors.get(rgb) || 0) + 1;
      colors.set(rgb, count);
      if (count > highestCount) { highestCount = count; winner = rgb; }
    }
  }
  return highestCount ? "#" + winner.toString(16).padStart(6, "0") : "#241c38";
}
