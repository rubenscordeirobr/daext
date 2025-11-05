import type { EntityId, NewsArticle, NewsArticleDraft, NewsArticleStatus } from '@daext/domain';

import { BaseClient, type ApiClientOptions, type QueryParams } from './base-client';

export interface ListNewsParams extends QueryParams {
    status?: NewsArticleStatus;
    search?: string;
    tag?: string;
    page?: number;
    pageSize?: number;
}

export type CreateNewsPayload = NewsArticleDraft;
export type UpdateNewsPayload = Partial<NewsArticleDraft>;

export class NewsClient extends BaseClient {
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
