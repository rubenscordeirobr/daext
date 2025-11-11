import { HttpError, newsClient } from '@daext/api-client';
import type { NewsArticle, NewsArticleDraft } from '@daext/domain';
import { NewsArticleStatus } from '@daext/domain';

class NewsService {
    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    private toDraft(payload: NewsArticleDraft): NewsArticleDraft {
        return {
            ...payload,
            status: payload.status ?? NewsArticleStatus.Draft,
            publishedAt: payload.publishedAt ?? null,
        };
    }

    async getAll(): Promise<NewsArticle[]> {
        const articles = await newsClient.list();
        return articles.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    async getById(id: string): Promise<NewsArticle | null> {
        try {
            return await newsClient.getById(id);
        } catch (error) {
            if (error instanceof HttpError && error.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async create(payload: NewsArticleDraft): Promise<NewsArticle> {
        return newsClient.create(this.toDraft(payload));
    }

    async update(id: string, updates: Partial<NewsArticleDraft>): Promise<NewsArticle> {
        return newsClient.update(id, updates);
    }

    delete(id: string): Promise<void> {
        return newsClient.delete(id);
    }

    async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
        const articles = await newsClient.list();
        return !articles.some((article) => article.slug === slug && article.id !== excludeId);
    }

    async duplicate(id: string): Promise<NewsArticle> {
        const original = await this.getById(id);
        if (!original) {
            throw new Error('Noticia nao encontrada');
        }

        const copyTitle = `Copia de ${original.title}`;
        const payload: NewsArticleDraft = {
            title: copyTitle,
            slug: this.generateSlug(copyTitle),
            summary: original.summary,
            body: original.body,
            tags: [...original.tags],
            status: NewsArticleStatus.Draft,
            publishedAt: null,
        };

        return this.create(payload);
    }
}

export const ServiceNewsMock = new NewsService();
