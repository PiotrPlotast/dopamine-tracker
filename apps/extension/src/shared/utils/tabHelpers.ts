export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch (e) {
    return "";
  }
}

export function shouldTrackUrl(url: string): boolean {
  const ignoreList = ["chrome://", "about:", "file://", "localhost"];
  return !ignoreList.some((prefix) => url.startsWith(prefix));
}

export function domainChanged(oldUrl: string, newUrl: string): boolean {
  const oldDomain = getDomainFromUrl(oldUrl);
  const newDomain = getDomainFromUrl(newUrl);
  return oldDomain !== newDomain;
}
