'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { BlogPageConfig } from '@/types/page';
import type { MediumArticle } from '@/lib/medium';

function formatArticleDateTime(value: string): string {
  if (!value) return '';
  const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') + 'Z' : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(value);
    if (Number.isNaN(fallback.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(fallback);
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

interface Rss2JsonItem {
  guid?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  categories?: string[];
}

export default function BlogPage({
  config,
  initialArticles = [],
  embedded = false,
}: {
  config: BlogPageConfig;
  initialArticles?: MediumArticle[];
  embedded?: boolean;
}) {
  const configuredHandle = (config.medium_username || '').trim().replace(/^@/, '');
  const platformName = config.platform || 'Medium';
  const limit = config.limit || 10;
  const hasInitialArticles = initialArticles.length > 0;

  const [articles, setArticles] = useState<MediumArticle[]>(initialArticles);
  const [loading, setLoading] = useState(!hasInitialArticles);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    if (!configuredHandle) {
      if (!hasInitialArticles) {
        setArticles([]);
        setError('No Medium username configured in blog settings.');
      }
      setLoading(false);
      return;
    }

    if (!hasInitialArticles) {
      setLoading(true);
    }
    setError(null);

    try {
      const rssUrl = `https://medium.com/feed/@${encodeURIComponent(configuredHandle)}`;
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();

      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        const mapped: MediumArticle[] = (data.items as Rss2JsonItem[])
          .slice(0, limit)
          .map((item, idx) => {
            const rawLink = item.link || '';
            const link = rawLink.split('?source=rss')[0] || rawLink;
            const rawDate = item.pubDate || '';
            const isoCandidate = rawDate.includes(' ') && !rawDate.includes('T')
              ? rawDate.replace(' ', 'T') + 'Z'
              : rawDate;
            const parsedDate = isoCandidate ? new Date(isoCandidate) : null;
            return {
              id: item.guid || link || `medium-${idx}`,
              title: item.title || 'Untitled Article',
              link,
              publishedAt:
                parsedDate && !Number.isNaN(parsedDate.getTime())
                  ? parsedDate.toISOString()
                  : rawDate,
              platform: platformName,
              categories: Array.isArray(item.categories) ? item.categories.slice(0, 4) : [],
            };
          })
          .filter((item) => Boolean(item.link));

        if (mapped.length > 0) {
          setArticles(mapped);
        }
      } else if (!hasInitialArticles) {
        setArticles([]);
      }
    } catch {
      if (!hasInitialArticles) {
        setArticles([]);
        setError(`Failed to fetch ${platformName} feed for @${configuredHandle}.`);
      }
    } finally {
      setLoading(false);
    }
  }, [configuredHandle, hasInitialArticles, limit, platformName]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={embedded ? 'mb-6' : 'mb-8'}>
        <h1 className={`${embedded ? 'text-2xl' : 'text-4xl'} font-serif font-bold text-primary mb-4`}>
          {config.title}
        </h1>
        {config.description && (
          <p className={`${embedded ? 'text-base' : 'text-lg'} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
            {config.description}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((skeleton) => (
            <div
              key={skeleton}
              className="liquid-glass p-6 rounded-2xl animate-pulse"
            >
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-neutral-100 dark:bg-neutral-800/70 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-2xl liquid-glass-subtle text-center space-y-3">
          <p className="text-sm text-neutral-600">{error}</p>
          <button
            type="button"
            onClick={loadArticles}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium liquid-glass-button text-primary hover:text-accent transition-[border-color,box-shadow,color] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && articles.length === 0 && (
        <div className="p-8 rounded-2xl liquid-glass-subtle text-center text-sm text-neutral-500">
          No published articles found for @{configuredHandle} on {platformName}.
        </div>
      )}

      {/* Articles List */}
      {!loading && !error && articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article) => {
            const formattedDate = formatArticleDateTime(article.publishedAt);
            return (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 44, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.12 }}
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="liquid-glass p-6 rounded-2xl hover:border-accent/40 transition-[border-color,box-shadow] duration-300"
              >
                <div className="flex flex-col gap-2.5">
                  <h2 className={`${embedded ? 'text-lg' : 'text-xl'} font-semibold text-primary leading-snug`}>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-2 hover:text-accent transition-colors duration-200"
                    >
                      <span>{article.title}</span>
                      <ArrowUpRight
                        className="h-4 w-4 mt-1 flex-shrink-0 text-neutral-400 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                        aria-hidden="true"
                      />
                    </a>
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="font-medium text-accent">{article.platform}</span>
                    {formattedDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <time dateTime={article.publishedAt} className="tabular-nums">
                          {formattedDate}
                        </time>
                      </>
                    )}
                    {article.categories && article.categories.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {article.categories.join(' · ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
