import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { ResearchProjectStatus, AcademicArea, type ResearchProjectDraft } from '@daext/domain';

import { NotFoundError } from '../../core/errors.js';
import type { ListResearchOptions, ResearchService } from './research.service.js';

const listQuerySchema = z.object({
    status: z.nativeEnum(ResearchProjectStatus).optional(),
    keyword: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const projectSchema = z.object({
    title: z.string().min(3, 'Title must have at least 3 characters'),
    area: z.nativeEnum(AcademicArea),
    supervisor: z.string().min(3, 'Supervisor name must have at least 3 characters'),
    collaborators: z.array(z.string().min(2)).optional(),
    summary: z.string().min(10, 'Summary must have at least 10 characters'),
    statusColor: z.string().min(1, 'Status color is required'),
    imageUrl: z.string().url('Must be a valid image URL'),
    description: z.string().min(10, 'Description must have at least 10 characters'),
    leadProfessorId: z.string().uuid('Lead professor ID must be a valid UUID'),
    status: z.nativeEnum(ResearchProjectStatus),
    keywords: z.array(z.string().min(2)).optional(),
    startedAt: z.string().datetime('Invalid start date format'),
    finishedAt: z.string().datetime('Invalid finish date format').nullable().optional(),
});

const projectPatchSchema = projectSchema.partial();

export interface RegisterResearchRoutesOptions {
    service: ResearchService;
}

export function registerResearchRoutes(
    fastify: FastifyInstance,
    options: RegisterResearchRoutesOptions
) {
    const { service } = options;

    fastify.get('/research', async (request) => {
        const query = listQuerySchema.parse(request.query);
        return service.list(query as ListResearchOptions);
    });

    fastify.get('/research/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        const project = await service.getById(params.id);
        if (!project) {
            return reply.code(404).send({ message: 'Research project not found.' });
        }
        return project;
    });

    fastify.post('/research', async (request, reply) => {
        const body: ResearchProjectDraft = projectSchema.parse(request.body);
        const created = await service.create(body);
        return reply.code(201).send(created);
    });

    fastify.patch('/research/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        const body = projectPatchSchema.parse(request.body);

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

    fastify.delete('/research/:id', async (request, reply) => {
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
