import { randomUUID } from 'node:crypto';

import type { EntityId, NewsArticle, NewsArticleDraft } from '@daext/domain';
import { createNewsArticle } from '@daext/domain';

import { NotFoundError } from '../../core/errors.js';
import type { ListNewsFilter, NewsRepository } from './news.repository.js';

export interface ListNewsOptions extends ListNewsFilter {
    page?: number;
    pageSize?: number;
}

export class NewsService {
    constructor(private readonly repository: NewsRepository) {}

    async list(options: ListNewsOptions = {}): Promise<NewsArticle[]> {
        const { page, pageSize, ...filter } = options;
        const items = await this.repository.list(filter);

        if (!page || !pageSize) {
            return items;
        }

        const start = Math.max(page - 1, 0) * pageSize;
        return items.slice(start, start + pageSize);
    }

    getById(id: EntityId): Promise<NewsArticle | null> {
        return this.repository.findById(id);
    }

    async create(input: NewsArticleDraft): Promise<NewsArticle> {
        const article = createNewsArticle({
            ...input,
            id: randomUUID(),
        });
        return this.repository.create(article);
    }

    async update(id: EntityId, patch: Partial<NewsArticleDraft>): Promise<NewsArticle> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundError(`News article ${id} not found.`);
        }

        const updated: NewsArticle = {
            ...existing,
            ...patch,
            tags: patch.tags ?? existing.tags,
            publishedAt: patch.publishedAt === undefined ? existing.publishedAt : patch.publishedAt,
            updatedAt: new Date().toISOString(),
        };

        return this.repository.update(id, updated);
    }

    async delete(id: EntityId): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundError(`News article ${id} not found.`);
        }
        await this.repository.delete(id);
    }
}
