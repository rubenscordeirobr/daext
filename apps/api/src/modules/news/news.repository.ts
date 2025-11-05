import type { EntityId, NewsArticle, NewsArticleStatus } from '@daext/domain';

export interface ListNewsFilter {
    status?: NewsArticleStatus;
    search?: string;
    tag?: string;
}

export interface NewsRepository {
    list(filter?: ListNewsFilter): Promise<NewsArticle[]>;
    findById(id: EntityId): Promise<NewsArticle | null>;
    create(article: NewsArticle): Promise<NewsArticle>;
    update(id: EntityId, article: NewsArticle): Promise<NewsArticle>;
    delete(id: EntityId): Promise<void>;
}
