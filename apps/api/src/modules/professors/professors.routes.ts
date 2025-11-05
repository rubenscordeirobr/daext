import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { ProfessorProfileDraft } from '@daext/domain';

import { NotFoundError } from '../../core/errors.js';
import type { ProfessorsService } from './professors.service.js';

const listQuerySchema = z.object({
    search: z.string().min(1).optional(),
    area: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const profileSchema = z.object({
    fullName: z.string().min(3),
    academicTitle: z.string().min(2),
    researchAreas: z.array(z.string().min(2)).min(1),
    bio: z.string().min(10),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    lattesUrl: z.string().url().optional(),
    avatarUrl: z.string().url().optional(),
});

const profilePatchSchema = profileSchema.partial();

export interface RegisterProfessorsRoutesOptions {
    service: ProfessorsService;
}

export function registerProfessorsRoutes(
    fastify: FastifyInstance,
    options: RegisterProfessorsRoutesOptions
) {
    const { service } = options;

    fastify.get('/professors', async (request) => {
        const query = listQuerySchema.parse(request.query);
        return service.list(query);
    });

    fastify.get('/professors/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        const professor = await service.getById(params.id);
        if (!professor) {
            return reply.code(404).send({ message: 'Professor not found.' });
        }
        return professor;
    });

    fastify.post('/professors', async (request, reply) => {
        const body: ProfessorProfileDraft = profileSchema.parse(request.body);
        const created = await service.create(body);
        return reply.code(201).send(created);
    });

    fastify.patch('/professors/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        const body = profilePatchSchema.parse(request.body);

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

    fastify.delete('/professors/:id', async (request, reply) => {
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
