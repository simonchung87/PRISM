'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, RefreshCw } from 'lucide-react';
import { BlogPageConfig } from '@/types/page';

interface MediumArticle {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  platform: string;
  categories?: string[];
}

function formatArticleDateTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function BlogPage({
  config,
  embedded = false,
}: {
  config: BlogPageConfig;
  embedded?: boolean;
}) {
  const defaultHandle = (config.medium_username || '').replace(/^@/, '');
  const platformName = config.platform || 'Medium';
  const limit = config.limit || 10;

  const [activeUsername, setActiveUsername] = useState(defaultHandle);
  const [inputUsername, setInputUsername] = useState(defaultHandle);
  const [articles, setArticles] = useState<MediumArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(
    async (usernameToFetch: string) => {
      const cleaned = usernameToFetch.trim().replace(/^@/, '');
      if (!cleaned) {
        setArticles([]);
        setError('No Medium username configured yet.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          username: cleaned,
          platform: platformName,
          limit: String(limit),
        });
        const response = await fetch(`/api/medium/?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          setArticles([]);
          setError(data.error || `Could not load Medium articles for @${cleaned}.`);
          return;
        }

        setArticles(Array.isArray(data.articles) ? data.articles : []);
      } catch {
        setArticles([]);
        setError(`Failed to fetch Medium feed for @${cleaned}.`);
      } finally {
        setLoading(false);
      }
    },
    [limit, platformName]
  );

  useEffect(() => {
    loadArticles(activeUsername);
  }, [activeUsername, loadArticles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputUsername.trim().replace(/^@/, '');
    if (!cleaned) return;
    if (cleaned === activeUsername) {
      loadArticles(cleaned);
    } else {
      setActiveUsername(cleaned);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
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

      {/* Live Medium Feed Source Bar */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60"
      >
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 shrink-0">
          <BookOpen className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="font-medium text-primary">{platformName} Feed</span>
        </div>
        <div className="flex flex-grow items-center gap-2">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 select-none">
              @
            </span>
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Medium username"
              aria-label="Medium username"
              className="w-full pl-7 pr-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-primary focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-dark transition-colors disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Load Feed
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((skeleton) => (
            <div
              key={skeleton}
              className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 animate-pulse"
            >
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-neutral-100 dark:bg-neutral-800/70 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-center space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{error}</p>
          <button
            type="button"
            onClick={() => loadArticles(activeUsername)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-primary hover:bg-accent hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && articles.length === 0 && (
        <div className="p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center text-sm text-neutral-500">
          No published articles found for @{activeUsername} on {platformName}.
        </div>
      )}

      {/* Articles List */}
      {!loading && !error && articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article, index) => {
            const formattedDate = formatArticleDateTime(article.publishedAt);
            return (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(0.05 * index, 0.3) }}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:border-accent/40 transition-all duration-200"
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
