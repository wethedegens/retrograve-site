// Only settings cross this boundary. Local URLs, files and authority claims do not.
export function founderDraftSettings(input: any) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  if (!name || name.length > 120) throw new Error("Use a project name of 1–120 characters.");
  if (!["premint", "live"].includes(input?.stage)) throw new Error("Choose your collection stage.");
  if (!["finished_artwork", "layered_traits"].includes(input?.artworkMode)) throw new Error("Choose your artwork path.");
  const text = (value: unknown, limit: number) => {
    if (value == null) return "";
    if (typeof value !== "string" || value.length > limit) throw new Error("A project detail is too long or invalid.");
    return value.trim();
  };
  const candidateAddress = text(input.collectionAddress, 44);
  if (candidateAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(candidateAddress)) {
    throw new Error("Enter a valid Solana collection address, or leave it blank until verification.");
  }
  const layered = input.artworkMode === "layered_traits";
  const renderProfile: Record<string, unknown> = layered
    ? { engine: "universal_trait_engine", backgroundHandling: "creator_designated" }
    : { engine: "finished_artwork_engine", backgroundHandling: "preserve_finished_artwork", placement: "bottom_center" };
  if (!layered) {
    const art = input.renderProfile?.finishedArtwork;
    if (!art || !["edge_color", "gradient", "blur"].includes(art.extensionStyle) ||
        !["top", "center", "bottom"].includes(art.verticalAlign) ||
        !/^#[0-9a-f]{6}$/i.test(art.sampledColor) ||
        !Number.isFinite(art.artworkScale) || art.artworkScale < 0.4 || art.artworkScale > 1.8) {
      throw new Error("Preview and confirm your finished-artwork settings first.");
    }
    renderProfile.finishedArtwork = {
      extensionStyle: art.extensionStyle, verticalAlign: art.verticalAlign,
      sampledColor: art.sampledColor, artworkScale: art.artworkScale,
    };
  }
  const layers = input.layerMap;
  if (input.renderProfile?.devicePlacement) {
    const clean:Record<string,unknown> = {};
    for (const device of ["phone","ipad","desktop"]) {
      const placement = input.renderProfile.devicePlacement[device];
      if (!placement || !Number.isFinite(placement.scale) || placement.scale<0.4 || placement.scale>1.8 ||
        !["left","center","right"].includes(placement.x) || !["top","center","bottom"].includes(placement.y)) throw new Error("Confirm valid layouts for phone, iPad and desktop.");
      clean[device] = {scale:placement.scale,x:placement.x,y:placement.y};
    }
    renderProfile.devicePlacement=clean;
  }
  if (layered && (!Array.isArray(layers) || !layers.length || layers.length > 100)) {
    throw new Error("Confirm between 1 and 100 artwork layers first.");
  }
  return {
    name,
    publicProfile: {
      tagline: text(input.publicProfile?.tagline, 160),
      description: text(input.publicProfile?.description, 1200),
    },
    renderProfile,
    renderMode: layered ? "layered_traits" : "flat_background_extend",
    sourceConfig: {
      preMint: true, collectionIds: [], createdBeforeMint: input.stage === "premint",
      artworkMode: input.artworkMode,
      setupDraft: {
        version: 1, requestedStage: input.stage,
        candidateCollectionAddress: candidateAddress || null,
        // A plan only: no asset paths or reconstruction confirmation are trusted.
        layerPlan: layered ? layers.map((layer: any, index: number) => ({
          name: text(layer?.name, 120), order: index,
          isBackground: layer?.likelyBackground === true,
        })) : [],
        sourceArtUploaded: false,
      },
    },
  };
}
