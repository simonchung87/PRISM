export interface MediumArticle {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  platform: string;
  categories: string[];
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .trim();
}

function extractTag(block: string, tagName: string): string {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
  return match ? decodeXmlEntities(match[1]) : '';
}

function extractCategories(block: string): string[] {
  const matches = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)];
  return matches
    .map((m) => decodeXmlEntities(m[1]))
    .filter(Boolean)
    .slice(0, 4);
}

export function parseMediumRssXml(xml: string, platform: string, limit: number): MediumArticle[] {
  const itemMatches = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];

  return itemMatches
    .slice(0, limit)
    .map((match, index) => {
      const itemXml = match[1];
      const title = extractTag(itemXml, 'title') || 'Untitled Article';
      const rawLink = extractTag(itemXml, 'link');
      const link = rawLink.split('?source=rss')[0] || rawLink;
      const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date');
      const guid = extractTag(itemXml, 'guid') || link || `medium-${index}`;
      const categories = extractCategories(itemXml);

      const parsedDate = pubDate ? new Date(pubDate) : null;
      const publishedAt =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString()
          : pubDate;

      return {
        id: guid,
        title,
        link,
        publishedAt,
        platform,
        categories,
      };
    })
    .filter((article) => Boolean(article.link));
}

export async function fetchMediumArticles(
  rawUsername: string,
  platform = 'Medium',
  limit = 10
): Promise<{ articles: MediumArticle[]; error?: string }> {
  const username = (rawUsername || '').trim().replace(/^@/, '');
  const resolvedPlatform = (platform || 'Medium').trim() || 'Medium';
  const resolvedLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 25) : 10;

  if (!username || !/^[a-zA-Z0-9._-]+$/.test(username)) {
    return {
      articles: [],
      error: 'Invalid or missing Medium username.',
    };
  }

  const feedUrl = `https://medium.com/feed/@${encodeURIComponent(username)}`;

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; AcademicPortfolioRSS/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        articles: [],
        error: `Unable to load ${resolvedPlatform} feed for @${username} (HTTP ${response.status}).`,
      };
    }

    const xml = await response.text();
    return {
      articles: parseMediumRssXml(xml, resolvedPlatform, resolvedLimit),
    };
  } catch {
    return {
      articles: [],
      error: `Failed to connect to ${resolvedPlatform} RSS feed for @${username}.`,
    };
  }
}
