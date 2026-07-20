import { UAParser } from "ua-parser-js";
import { isbot } from "isbot";

export interface ParsedUA {
  browser: string | null;
  os: string | null;
  deviceType: string | null;
}

export function parseUserAgent(userAgent: string): ParsedUA {
  const { browser, os, device } = UAParser(userAgent);
  return {
    browser: browser.name ?? null,
    os: os.name ?? null,
    deviceType: device.type ?? "desktop",
  };
}

// Non-page paths that shouldn't count as a real "visit" even when logged.
const NON_PAGE_PATH_PATTERNS = [
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/_next\//,
  /^\/assets\//,
  /\.(png|jpg|jpeg|gif|svg|ico|css|js|map|woff2?|ttf)$/,
];

export function isNonPagePath(path: string): boolean {
  return NON_PAGE_PATH_PATTERNS.some((re) => re.test(path));
}

export function isLikelyBot(userAgent: string, path: string): boolean {
  if (isNonPagePath(path)) return true;
  return isbot(userAgent);
}
