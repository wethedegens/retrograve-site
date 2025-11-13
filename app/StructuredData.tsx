// app/StructuredData.tsx
export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RetroGrave",
    url: "https://retrograve.tv",
    sameAs: ["https://x.com/retrograve"],
    logo: "https://retrograve.tv/og-default.jpg",
    description:
      "RetroGrave lets you create crisp, perfectly-sized NFT lockscreen wallpapers for any phone.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
