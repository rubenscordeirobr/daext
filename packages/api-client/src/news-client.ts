import type { EntityId, NewsArticle, NewsArticleDraft, NewsArticleStatus } from '@daext/domain';

import { BaseClient } from './base-client';
import type { ApiClientOptions, QueryParams } from './base-types';
import { apiBaseUrl } from './config.js';

export interface ListNewsParams extends QueryParams {
    status?: NewsArticleStatus;
    search?: string;
    tag?: string;
    page?: number;
    pageSize?: number;
}

export type CreateNewsPayload = NewsArticleDraft;
export type UpdateNewsPayload = Partial<NewsArticleDraft>;

class NewsClient extends BaseClient {
    constructor(options: ApiClientOptions) {
        super(options);
    }

    list(params?: ListNewsParams): Promise<NewsArticle[]> {
        return this.request<NewsArticle[]>('/news', {
            query: params,
        });
    }

    getById(id: EntityId): Promise<NewsArticle> {
        return this.request<NewsArticle>(`/news/${id}`);
    }

    create(payload: CreateNewsPayload): Promise<NewsArticle> {
        return this.request<NewsArticle>('/news', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    update(id: EntityId, payload: UpdateNewsPayload): Promise<NewsArticle> {
        return this.request<NewsArticle>(`/news/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    delete(id: EntityId): Promise<void> {
        return this.request<void>(`/news/${id}`, {
            method: 'DELETE',
        });
    }
}

export const newsClient = new NewsClient({
    baseUrl: apiBaseUrl,
});
