import type { EntityId, ISODateString, Slug } from './primitives.js';

export const NEWS_ARTICLE_STATUSES = ['draft', 'scheduled', 'published'] as const;

export type NewsArticleStatus = (typeof NEWS_ARTICLE_STATUSES)[number];

export interface NewsArticle {
    id: EntityId;
    title: string;
    slug: Slug;
    summary: string;
    body: string;
    tags: string[];
    status: NewsArticleStatus;
    publishedAt: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface NewsArticleDraft {
    title: string;
    slug: Slug;
    summary: string;
    body: string;
    tags?: string[];
    status?: NewsArticleStatus;
    publishedAt?: ISODateString | null;
}

export const DEFAULT_NEWS_STATUS: NewsArticleStatus = 'draft';

export function isNewsArticle(value: unknown): value is NewsArticle {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.slug === 'string' &&
        typeof candidate.summary === 'string' &&
        typeof candidate.body === 'string' &&
        Array.isArray(candidate.tags) &&
        candidate.tags.every((tag) => typeof tag === 'string') &&
        typeof candidate.status === 'string' &&
        (NEWS_ARTICLE_STATUSES as readonly string[]).includes(candidate.status) &&
        (candidate.publishedAt === null || typeof candidate.publishedAt === 'string') &&
        typeof candidate.createdAt === 'string' &&
        typeof candidate.updatedAt === 'string'
    );
}

export function createNewsArticle(
    data: NewsArticleDraft & {
        id: EntityId;
        createdAt?: ISODateString;
        updatedAt?: ISODateString;
    }
): NewsArticle {
    const now = new Date().toISOString();
    return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        body: data.body,
        tags: data.tags ?? [],
        status: data.status ?? DEFAULT_NEWS_STATUS,
        publishedAt: data.publishedAt ?? null,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
    };
}
