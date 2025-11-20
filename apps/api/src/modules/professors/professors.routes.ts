import type { FastifyInstance } from 'fastify';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { z } from 'zod';

import {
    AcademicArea,
    buildProfessorAvatarUrl,
    professorProfilePatchSchema,
    professorProfileSchema,
} from '@daext/domain';

import { NotFoundError } from '../../core/errors.js';
import type { ProfessorsService } from './professors.service.js';

const listQuerySchema = z.object({
    search: z.string().trim().min(1).optional(),
    area: z.nativeEnum(AcademicArea).optional(),
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const avatarParamsSchema = z.object({ id: z.string() });
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxAvatarSize = 5 * 1024 * 1024; // 5MB, matches multipart limit

// Works in both src (ts) and dist (compiled) folders: up three levels to project root, then public.
const avatarRoot = fileURLToPath(new URL('../../../public/assets/professors', import.meta.url));

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
        const body = professorProfileSchema.parse(request.body);
        const created = await service.create(body);
        return reply.code(201).send(created);
    });

    fastify.patch('/professors/:id', async (request, reply) => {
        const params = z.object({ id: z.string() }).parse(request.params);
        const body = professorProfilePatchSchema.parse(request.body);

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

    fastify.post('/professors/:id/avatar', async (request, reply) => {
        const params = avatarParamsSchema.parse(request.params);
        const file = await request.file();
        if (!file) {
            return reply.code(400).send({ message: 'Nenhum arquivo enviado.' });
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return reply
                .code(400)
                .send({ message: 'Formato de imagem não suportado. Use JPG, PNG ou WebP.' });
        }

        if (file.file.truncated || file.fields?.length) {
            return reply.code(400).send({ message: 'Imagem muito grande.' });
        }

        const buffer = await file.toBuffer();
        if (buffer.byteLength > maxAvatarSize) {
            return reply.code(400).send({ message: 'Imagem muito grande (máx. 5MB).' });
        }

        const professor = await service.getById(params.id);
        if (!professor) {
            return reply.code(404).send({ message: 'Professor not found.' });
        }

        const outputDir = join(avatarRoot, params.id);
        await mkdir(outputDir, { recursive: true });
        const outputPath = join(outputDir, 'avatar.webp');
        const avatarUrl = buildProfessorAvatarUrl(params.id);

        await sharp(buffer)
            .rotate()
            .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);

        const updated = await service.updateAvatar(params.id, avatarUrl);
        return reply.code(200).send(updated);
    });
}
