import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { AuthService, InvalidCredentialsError, UserNotFoundError } from './auth.service.js';

const loginSchema = z.object({
    loginId: z.string().min(1),
    password: z.string().min(1),
});

const logoutSchema = z.object({
    token: z.string().min(10),
});

const requestCodeSchema = z.object({
    loginId: z.string().min(1),
});

const verifyCodeSchema = z.object({
    loginId: z.string().min(1),
    code: z.string().regex(/^\d{6}$/, 'Codigo invalido'),
});

const resetPasswordSchema = z.object({
    loginId: z.string().min(1),
    newPassword: z.string().min(6),
});

export interface RegisterAuthRoutesOptions {
    service: AuthService;
}

export function registerAuthRoutes(fastify: FastifyInstance, options: RegisterAuthRoutesOptions) {
    const { service } = options;

    fastify.post('/auth/login', async (request, reply) => {
        const body = loginSchema.parse(request.body);
        try {
            const session = await service.login(body.loginId, body.password);
            return reply.code(200).send(session);
        } catch (error: unknown) {
            if (error instanceof InvalidCredentialsError) {
                return reply.code(401).send({ message: error.message });
            }
            throw error;
        }
    });

    fastify.post('/auth/logout', async (request, reply) => {
        const body = logoutSchema.parse(request.body);
        await service.logout(body.token);
        return reply.code(204).send();
    });

    fastify.get('/auth/session', async (request, reply) => {
        const token = extractTokenFromHeader(request);
        if (!token) {
            return reply.code(401).send({ message: 'Token nao informado' });
        }

        const session = await service.getSession(token);
        if (!session) {
            return reply.code(401).send({ message: 'Sessao invalida ou expirada' });
        }

        return reply.code(200).send(session);
    });

    fastify.post('/auth/request-code', async (request, reply) => {
        const body = requestCodeSchema.parse(request.body);
        await service.requestResetCode(body.loginId);
        return reply.code(202).send({ message: 'Codigo enviado' });
    });

    fastify.post('/auth/verify-code', async (request) => {
        const body = verifyCodeSchema.parse(request.body);
        return service.verifyResetCode(body.loginId, body.code);
    });

    fastify.post('/auth/reset-password', async (request, reply) => {
        const body = resetPasswordSchema.parse(request.body);
        try {
            await service.resetPassword(body.loginId, body.newPassword);
            return reply.code(204).send();
        } catch (error: unknown) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({ message: error.message });
            }
            throw error;
        }
    });
}

function extractTokenFromHeader(request: FastifyRequest): string | null {
    const header = request.headers.authorization;
    if (!header) {
        return null;
    }

    const matches = header.match(/^Bearer\s+(.+)$/i);
    return matches ? matches[1] : null;
}
