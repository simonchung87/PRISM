import { NextRequest, NextResponse } from 'next/server';

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

function parseRssItems(xml: string, platform: string, limit: number): MediumArticle[] {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUsername = (searchParams.get('username') || '').trim().replace(/^@/, '');
  const platform = (searchParams.get('platform') || 'Medium').trim() || 'Medium';
  const rawLimit = Number(searchParams.get('limit') || '10');
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 25) : 10;

  if (!rawUsername) {
    return NextResponse.json(
      { error: 'Please provide a Medium username.' },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(rawUsername)) {
    return NextResponse.json(
      { error: 'Invalid Medium username format.' },
      { status: 400 }
    );
  }

  const feedUrl = `https://medium.com/feed/@${encodeURIComponent(rawUsername)}`;

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; AcademicPortfolioRSS/1.0)',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Unable to load Medium feed for @${rawUsername} (HTTP ${response.status}).`,
          username: rawUsername,
          platform,
          articles: [],
        },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const xml = await response.text();
    const articles = parseRssItems(xml, platform, limit);

    return NextResponse.json({
      username: rawUsername,
      platform,
      articles,
    });
  } catch (error) {
    console.error('Error fetching Medium RSS feed:', error);
    return NextResponse.json(
      {
        error: `Failed to connect to Medium RSS feed for @${rawUsername}.`,
        username: rawUsername,
        platform,
        articles: [],
      },
      { status: 502 }
    );
  }
}
