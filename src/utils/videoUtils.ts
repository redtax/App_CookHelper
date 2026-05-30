export interface ParsedVideoUrl {
  platform: 'bilibili' | 'kuaishou' | 'none';
  embedUrl: string | null;
  pageUrl: string | null;
  bvId: string | null;
  videoId: string | null;
  originalUrl: string;
}

const URL_REGEX = /https?:\/\/[^\s\u4e00-\u9fa5（）【】<>\"'\s]+/gi;

const BILIBILI_BV_REGEX = /BV[a-zA-Z0-9]+/;
const BILIBILI_URL_BV_REGEX = /(?:bilibili\.com\/video\/|bvid=)(BV[a-zA-Z0-9]+)/;
const KUAISHOU_ID_REGEX = /(?:kuaishou\.com|v\.kuaishou\.com)\/(?:short-video|fw|photo)\/([a-zA-Z0-9]+)/;

export function extractUrlFromText(text: string): string | null {
  const urls = text.match(URL_REGEX);
  if (urls && urls.length > 0) {
    return urls[0].replace(/[）】>"\']+$/, '').replace(/^[（【<"']+/, '');
  }
  return null;
}

export function extractBVId(url: string): string | null {
  const match = url.match(BILIBILI_URL_BV_REGEX) || url.match(BILIBILI_BV_REGEX);
  return match ? match[0] : null;
}

export function extractKuaishouId(url: string): string | null {
  const match = url.match(KUAISHOU_ID_REGEX);
  return match ? match[1] : null;
}

export function buildBilibiliEmbedUrl(bvId: string): string {
  return `https://player.bilibili.com/player.html?bvid=${bvId}&autoplay=0&danmaku=0&no_related=1`;
}

export function buildBilibiliPageUrl(bvId: string): string {
  return `https://www.bilibili.com/video/${bvId}`;
}

export function parseVideoUrl(input: string): ParsedVideoUrl {
  const extractedUrl = extractUrlFromText(input);
  const trimmedUrl = (extractedUrl || input).trim();

  if (trimmedUrl.includes('b23.tv') || trimmedUrl.includes('bilibili.com')) {
    const bvId = extractBVId(trimmedUrl);
    return {
      platform: 'bilibili',
      embedUrl: bvId ? buildBilibiliEmbedUrl(bvId) : null,
      pageUrl: bvId ? buildBilibiliPageUrl(bvId) : null,
      bvId,
      videoId: null,
      originalUrl: trimmedUrl,
    };
  }

  if (trimmedUrl.includes('kuaishou.com') || trimmedUrl.includes('v.kuaishou.com')) {
    const videoId = extractKuaishouId(trimmedUrl);
    return {
      platform: 'kuaishou',
      embedUrl: null,
      pageUrl: null,
      bvId: null,
      videoId: videoId || trimmedUrl,
      originalUrl: trimmedUrl,
    };
  }

  return { platform: 'none', embedUrl: null, pageUrl: null, bvId: null, videoId: null, originalUrl: trimmedUrl };
}

export function isVideoUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.includes('bilibili.com') ||
    trimmed.includes('b23.tv') ||
    trimmed.includes('kuaishou.com') ||
    trimmed.includes('douyin.com') ||
    trimmed.includes('v.douyin.com');
}