export function isPhantomMobile() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("phantom") && /iphone|ipad|ipod|android/.test(ua);
}
