import type { NewsArticle as DomainNewsArticle, NewsArticleStatus } from '@daext/domain';

export type NewsArticle = DomainNewsArticle & {
    author?: string;
};

export type { NewsArticleStatus };

export interface NewsFilters {
    search: string;
    status: 'all' | NewsArticleStatus;
}
