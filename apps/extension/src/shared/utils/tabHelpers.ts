export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function shouldTrackUrl(url: string): boolean {
  const ignoreList = ["chrome://", "about:", "file://", "localhost"];
  return !ignoreList.some((prefix) => url.startsWith(prefix));
}
