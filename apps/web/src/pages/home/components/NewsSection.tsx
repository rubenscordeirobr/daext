import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsClient } from '@daext/api-client';
import type { NewsArticle, NewsCategory } from '@daext/domain';
import { NewsArticleStatus, NewsCategoryList } from '@daext/domain';

import { getAssetPath } from '../../../utils/assetPath';

const FALLBACK_IMAGE = getAssetPath('assets/images/no-image-avalaible.png');
const DEFAULT_CATEGORY = {
    label: 'Noticia',
    color: 'bg-gray-100 text-gray-800',
};

const CATEGORY_MAP = new Map(NewsCategoryList.map((category) => [category.id, category]));
const CATEGORY_IDS = NewsCategoryList.map((category) => category.id);

const NewsSection = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const articles = await newsClient.list();
                const published = articles
                    .filter((article) => article.status === NewsArticleStatus.Published)
                    .sort((a, b) => {
                        //sort by published date descending
                        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                        return dateB - dateA;
                    })
                    .slice(0, 3); // Get only the first 3 published articles

                setArticles(published);
            } catch (err) {
                console.error('Erro ao carregar dados das noticias:', err);
                setError('Nao foi possivel carregar as noticias. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        void loadNews();
    }, []);

    const featuredNews = useMemo(
        () => [...articles].sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a)).slice(0, 3),
        [articles]
    );

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-16">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                            Ultimas Noticias
                        </h2>
                        <p className="text-lg text-[#8d9199]">
                            Acompanhe as principais atividades e conquistas do departamento
                        </p>
                    </div>
                    <Link
                        to="/news"
                        className="hidden md:flex items-center space-x-2 bg-[#ffbf00] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#e6ac00] transition-colors whitespace-nowrap"
                    >
                        <span>Ver Todas</span>
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-arrow-right-line"></i>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {loading &&
                        Array.from({ length: 3 }).map((_, index) => (
                            <article
                                key={`skeleton-${index}`}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 animate-pulse"
                            >
                                <div className="h-48 bg-gray-200" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-5 bg-gray-200 rounded w-5/6" />
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded" />
                                        <div className="h-3 bg-gray-200 rounded w-4/5" />
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                </div>
                            </article>
                        ))}

                    {!loading && error && (
                        <div className="col-span-1 md:col-span-3 text-center text-[#8d9199]">
                            {error}
                        </div>
                    )}

                    {!loading && !error && featuredNews.length === 0 && (
                        <div className="col-span-1 md:col-span-3 text-center text-[#8d9199]">
                            Nenhuma noticia publicada ate o momento.
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        featuredNews.map((article) => {
                            const category = getCategoryPresentation(article);
                            return (
                                <article
                                    key={article.id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={extractCoverImage(article)}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${category.colorClass}`}
                                            >
                                                {category.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center text-sm text-[#8d9199] mb-3">
                                            <div className="w-4 h-4 flex items-center justify-center mr-2">
                                                <i className="ri-calendar-line"></i>
                                            </div>
                                            <span>{formatDate(article.publishedAt)}</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-black mb-3 leading-tight group-hover:text-[#ffbf00] transition-colors">
                                            {article.title}
                                        </h3>

                                        <p className="text-[#8d9199] text-sm leading-relaxed mb-4">
                                            {article.summary}
                                        </p>

                                        <div className="flex items-center text-[#ffbf00] font-medium text-sm group-hover:text-[#e6ac00] transition-colors">
                                            <span>Leia mais</span>
                                            <div className="w-4 h-4 flex items-center justify-center ml-2 group-hover:translate-x-1 transition-transform">
                                                <i className="ri-arrow-right-line"></i>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                </div>

                <div className="text-center mt-12 md:hidden">
                    <Link
                        to="/news"
                        className="inline-flex items-center space-x-2 bg-[#ffbf00] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#e6ac00] transition-colors whitespace-nowrap"
                    >
                        <span>Ver Todas as Noticias</span>
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-arrow-right-line"></i>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
};

function getSortTimestamp(article: NewsArticle): number {
    const referenceDate = article.publishedAt ?? article.createdAt ?? '';
    const timestamp = new Date(referenceDate).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDate(value: string | null): string {
    if (!value) return 'Sem data';
    const date = new Date(value);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function extractCoverImage(article: NewsArticle): string {
    const remoteImage = article.tags.find((tag) => tag.startsWith('http'));
    if (remoteImage) {
        return remoteImage;
    }

    const assetTag = article.tags.find(
        (tag) => tag.includes('assets/') || tag.startsWith('/assets/')
    );
    if (assetTag) {
        return getAssetPath(assetTag);
    }

    return FALLBACK_IMAGE;
}

function getCategoryPresentation(article: NewsArticle): { label: string; colorClass: string } {
    const category = matchKnownCategory(article);

    if (category) {
        const info = CATEGORY_MAP.get(category);
        if (info) {
            return {
                label: info.displayName,
                colorClass: info.color,
            };
        }
    }

    const fallbackLabel = extractFallbackCategoryTag(article);
    const fallbackColor = extractCategoryColor(article);

    return {
        label: fallbackLabel ?? DEFAULT_CATEGORY.label,
        colorClass: fallbackColor ?? DEFAULT_CATEGORY.color,
    };
}

function matchKnownCategory(article: NewsArticle): NewsCategory | null {
    const candidate = article.tags.find((tag): tag is NewsCategory =>
        CATEGORY_IDS.includes(tag as NewsCategory)
    );
    return candidate ?? null;
}

function extractFallbackCategoryTag(article: NewsArticle): string | null {
    const tag = article.tags.find((value) => !isColorToken(value) && !isAssetToken(value));
    if (!tag) {
        return null;
    }
    return tag
        .split(/[-_]/)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}

function extractCategoryColor(article: NewsArticle): string | null {
    return article.tags.find((tag) => isColorToken(tag)) ?? null;
}

function isColorToken(tag: string): boolean {
    return tag.startsWith('bg-');
}

function isAssetToken(tag: string): boolean {
    return tag.includes('/') || tag.startsWith('http');
}

export default NewsSection;
