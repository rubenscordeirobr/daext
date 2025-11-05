import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { NEWS_ARTICLE_STATUSES, type NewsArticleDraft } from '@daext/domain';

import { NotFoundError } from '../../core/errors.js';
import type { ListNewsOptions, NewsService } from './news.service.js';

const newsQuerySchema = z.object({
    status: z.enum(NEWS_ARTICLE_STATUSES).optional(),
    search: z.string().min(1).optional(),
    tag: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const newsDraftSchema = z.object({
    title: z.string().min(3),
    slug: z.string().min(3),
    summary: z.string().min(3),
    body: z.string().min(3),
    tags: z.array(z.string()).optional(),
    status: z.enum(NEWS_ARTICLE_STATUSES).optional(),
    publishedAt: z.string().datetime().nullable().optional(),
});

const newsPatchSchema = newsDraftSchema.partial();

export interface RegisterNewsRoutesOptions {
    service: NewsService;
}

export function registerNewsRoutes(fastify: FastifyInstance, options: RegisterNewsRoutesOptions) {
    const { service } = options;

    fastify.get('/news', async (request) => {
        const query = newsQuerySchema.parse(request.query);
        return service.list(query as ListNewsOptions);
    });

    fastify.get('/news/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        const article = await service.getById(params.id);
        if (!article) {
            return reply.code(404).send({ message: 'News article not found.' });
        }
        return article;
    });

    fastify.post('/news', async (request, reply) => {
        const body: NewsArticleDraft = newsDraftSchema.parse(request.body);
        const created = await service.create(body);
        return reply.code(201).send(created);
    });

    fastify.patch('/news/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        const body = newsPatchSchema.parse(request.body);

        try {
            const updated = await service.update(params.id, body);
            return reply.code(200).send(updated);
        } catch (error: unknown) {
            if (error instanceof NotFoundError) {
                return reply.code(404).send({ message: error.message });
            }
            throw error;
        }
    });

    fastify.delete('/news/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        try {
            await service.delete(params.id);
            return reply.code(204).send();
        } catch (error: unknown) {
            if (error instanceof NotFoundError) {
                return reply.code(404).send({ message: error.message });
            }
            throw error;
        }
    });
}
