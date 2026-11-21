'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Award, Download, ExternalLink, Mic, Presentation } from 'lucide-react';
import { PresentationFormat, Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from './FormattedBibTeXText';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

const MONTH_ABBR: Record<string, string> = {
    '1': 'Jan',
    '2': 'Feb',
    '3': 'Mar',
    '4': 'Apr',
    '5': 'May',
    '6': 'Jun',
    '7': 'Jul',
    '8': 'Aug',
    '9': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
};

function formatDateLabel(month?: string, year?: number): string {
    if (!year) return '';
    if (!month) return String(year);
    const trimmed = month.trim();
    const mapped = MONTH_ABBR[trimmed] || trimmed.charAt(0).toUpperCase() + trimmed.slice(1, 3);
    return `${mapped} ${year}`;
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedPresentation, setSelectedPresentation] = useState<'all' | PresentationFormat>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

    // Extract unique years and presentation formats for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    const presentations = useMemo(() => {
        const found = new Set<PresentationFormat>();
        publications.forEach(p => {
            if (p.presentation) {
                found.add(p.presentation);
            }
        });
        const order: PresentationFormat[] = ['oral', 'poster'];
        return order.filter(format => found.has(format));
    }, [publications]);

    const hasPresentations = presentations.length > 0;

    // Filter publications
    const filteredPublications = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return publications.filter(pub => {
            const presentationSearchText = pub.presentation === 'oral'
                ? `oral oral presentation ${messages.publications.oral} ${messages.publications.oralPresentation}`.toLowerCase()
                : pub.presentation === 'poster'
                    ? `poster poster presentation ${messages.publications.poster} ${messages.publications.posterPresentation}`.toLowerCase()
                    : '';

            const matchesSearch =
                !query ||
                pub.title.toLowerCase().includes(query) ||
                pub.authors.some(author => author.name.toLowerCase().includes(query)) ||
                pub.journal?.toLowerCase().includes(query) ||
                pub.conference?.toLowerCase().includes(query) ||
                pub.location?.toLowerCase().includes(query) ||
                pub.doi?.toLowerCase().includes(query) ||
                pub.awards?.some(award => award.toLowerCase().includes(query)) ||
                String(pub.year).includes(query) ||
                presentationSearchText.includes(query);

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesPresentation =
                selectedPresentation === 'all' || pub.presentation === selectedPresentation;

            return matchesSearch && matchesYear && matchesPresentation;
        });
    }, [
        publications,
        searchQuery,
        selectedYear,
        selectedPresentation,
        messages.publications.oral,
        messages.publications.oralPresentation,
        messages.publications.poster,
        messages.publications.posterPresentation,
    ]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={
                                hasPresentations
                                    ? messages.publications.searchWithPresentationPlaceholder
                                    : messages.publications.searchPlaceholder
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    {hasPresentations && (
                        <div
                            role="group"
                            aria-label={messages.publications.presentation}
                            className="inline-flex items-center p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shrink-0 self-start sm:self-auto"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedPresentation('all')}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer",
                                    selectedPresentation === 'all'
                                        ? "bg-accent text-white shadow-sm"
                                        : "text-neutral-600 dark:text-neutral-400 hover:text-primary"
                                )}
                            >
                                {messages.common.all}
                            </button>
                            {presentations.map((format) => (
                                <button
                                    key={format}
                                    type="button"
                                    onClick={() => setSelectedPresentation(format)}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer",
                                        selectedPresentation === format
                                            ? "bg-accent text-white shadow-sm"
                                            : "text-neutral-600 dark:text-neutral-400 hover:text-primary"
                                    )}
                                >
                                    {format === 'oral' ? (
                                        <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                                    ) : (
                                        <Presentation className="h-3.5 w-3.5" aria-hidden="true" />
                                    )}
                                    {format === 'oral' ? messages.publications.oral : messages.publications.poster}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors cursor-pointer",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                type="button"
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors tabular-nums cursor-pointer",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Publications Grid */}
            <div className="space-y-6">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => {
                        const venueName = pub.conference || pub.journal;
                        const dateLabel = formatDateLabel(pub.month, pub.year);
                        const doiHref = pub.doi ? `https://doi.org/${pub.doi}` : null;

                        return (
                            <motion.div
                                key={pub.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 * index }}
                                className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
                            >
                                {pub.presentation && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide whitespace-nowrap shrink-0",
                                                    pub.presentation === 'oral'
                                                        ? "bg-accent/15 text-accent-dark dark:text-accent border border-accent/30"
                                                        : "bg-neutral-100 text-primary border border-neutral-200"
                                                )}
                                            >
                                                {pub.presentation === 'oral' ? (
                                                    <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                                                ) : (
                                                    <Presentation className="h-3.5 w-3.5" aria-hidden="true" />
                                                )}
                                                {pub.presentation === 'oral'
                                                    ? messages.publications.oralPresentation
                                                    : messages.publications.posterPresentation}
                                            </span>
                                            {pub.awards && pub.awards.length > 0 && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/25 text-xs font-medium text-primary">
                                                    <Award className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                                                    <span>{pub.awards.join(' · ')}</span>
                                                </span>
                                            )}
                                        </div>
                                        {dateLabel && (
                                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
                                                {dateLabel}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row gap-6">
                                    {pub.preview && (
                                        <div className="w-full md:w-48 flex-shrink-0">
                                            <div className="aspect-video md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                <Image
                                                    src={`/papers/${pub.preview}`}
                                                    alt={pub.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary mb-2 leading-tight`}>
                                            {doiHref ? (
                                                <a
                                                    href={doiHref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex items-baseline gap-1.5 hover:text-accent transition-colors"
                                                >
                                                    <span>
                                                        <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                                    </span>
                                                    <ExternalLink
                                                        className="h-3.5 w-3.5 shrink-0 self-center text-neutral-400 group-hover:text-accent transition-colors"
                                                        aria-hidden="true"
                                                    />
                                                </a>
                                            ) : (
                                                <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                            )}
                                        </h3>
                                        {!pub.presentation && pub.awards && pub.awards.length > 0 && (
                                            <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-xs font-medium text-primary inline-flex items-center gap-2">
                                                <Award className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                                                <span>{pub.awards.join(' · ')}</span>
                                            </div>
                                        )}
                                        <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-400 mb-2`}>
                                            {pub.authors.map((author, idx) => (
                                                <span key={idx}>
                                                    <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                        {author.name}
                                                    </span>
                                                    {author.isCorresponding && (
                                                        <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                                    )}
                                                    {idx < pub.authors.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </p>

                                        {pub.presentation ? (
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-neutral-700 dark:text-neutral-500 mb-3">
                                                {venueName && <span>{venueName}</span>}
                                                {venueName && pub.location && (
                                                    <span aria-hidden="true" className="text-neutral-400">·</span>
                                                )}
                                                {pub.location && (
                                                    <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                                                        {pub.location}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-600 mb-3">
                                                {pub.journal || pub.conference}
                                            </p>
                                        )}

                                        {pub.description && (
                                            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-3">
                                                {pub.description.split(/\n{2,}/).map((paragraph, pIdx) => (
                                                    <p key={pIdx}>{paragraph}</p>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2 mt-auto">
                                            {pub.pdfUrl && (
                                                <a
                                                    href={pub.pdfUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                                >
                                                    <Download className="h-3 w-3 mr-1.5" aria-hidden="true" />
                                                    PDF
                                                </a>
                                            )}
                                            {pub.url && !pub.doi && (
                                                <a
                                                    href={pub.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                                >
                                                    URL
                                                </a>
                                            )}
                                            {pub.code && (
                                                <a
                                                    href={pub.code}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                                >
                                                    {messages.publications.code}
                                                </a>
                                            )}
                                            {pub.abstract && (
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedAbstractId(expandedAbstractId === pub.id ? null : pub.id)}
                                                    className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                                        expandedAbstractId === pub.id
                                                            ? "bg-accent text-white"
                                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                                    )}
                                                >
                                                    <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                                    {messages.publications.abstract}
                                                </button>
                                            )}
                                            {!pub.presentation && dateLabel && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 text-xs font-medium text-neutral-600 tabular-nums">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-neutral-500 shrink-0" aria-hidden="true" />
                                                    <span>{dateLabel}</span>
                                                </div>
                                            )}
                                            {!pub.presentation && pub.doi && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 text-xs text-neutral-600">
                                                    <span className="font-semibold text-primary">DOI:</span>
                                                    <span className="font-mono select-all break-all">{pub.doi}</span>
                                                </div>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {expandedAbstractId === pub.id && pub.abstract ? (
                                                <motion.div
                                                    key="abstract"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden mt-4"
                                                >
                                                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 space-y-3">
                                                        {pub.abstract.split(/\n{2,}/).map((paragraph, pIdx) => (
                                                            <p key={pIdx} className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                                                {paragraph}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}

