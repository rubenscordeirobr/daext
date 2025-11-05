import type { EntityId, NewsArticle } from '@daext/domain';

import { JsonStore } from '../../infrastructure/json-store.js';
import type { ListNewsFilter, NewsRepository } from './news.repository.js';

export class JsonNewsRepository implements NewsRepository {
    constructor(private readonly store: JsonStore<NewsArticle>) {}

    async list(filter?: ListNewsFilter): Promise<NewsArticle[]> {
        const items = await this.store.readAll();
        if (!filter) {
            return items;
        }

        return items.filter((item) => {
            if (filter.status && item.status !== filter.status) {
                return false;
            }

            if (filter.tag && !item.tags.includes(filter.tag)) {
                return false;
            }

            if (filter.search) {
                const text = filter.search.toLowerCase();
                return (
                    item.title.toLowerCase().includes(text) ||
                    item.summary.toLowerCase().includes(text) ||
                    item.body.toLowerCase().includes(text)
                );
            }

            return true;
        });
    }

    async findById(id: EntityId): Promise<NewsArticle | null> {
        const items = await this.store.readAll();
        return items.find((item) => item.id === id) ?? null;
    }

    async create(article: NewsArticle): Promise<NewsArticle> {
        const items = await this.store.readAll();
        items.push(article);
        await this.store.writeAll(items);
        return article;
    }

    async update(id: EntityId, article: NewsArticle): Promise<NewsArticle> {
        const items = await this.store.readAll();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error(`News article ${id} not found.`);
        }
        items[index] = article;
        await this.store.writeAll(items);
        return article;
    }

    async delete(id: EntityId): Promise<void> {
        const items = await this.store.readAll();
        const filtered = items.filter((item) => item.id !== id);
        await this.store.writeAll(filtered);
    }
}
