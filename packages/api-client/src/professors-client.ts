import type {
    EntityId,
    Professor,
    ProfessorProfileDraft,
    ProfessorProfilePatch,
} from '@daext/domain';
import {
    AcademicArea,
    professorProfilePatchSchema,
    professorProfileSchema,
    professorSchema,
} from '@daext/domain';
import type { ZodError, ZodSchema } from 'zod';
import { BaseClient } from './base-client';
import type { ApiClientOptions, QueryParams } from './base-types';
import { apiBaseUrl } from './config.js';

export interface ListProfessorsParams extends QueryParams {
    search?: string;
    area?: AcademicArea;
    page?: number;
    pageSize?: number;
}

export type CreateProfessorPayload = ProfessorProfileDraft;
export type UpdateProfessorPayload = ProfessorProfilePatch;

export class ProfessorsClient extends BaseClient {
    constructor(options: ApiClientOptions) {
        super(options);
    }

    async list(params?: ListProfessorsParams): Promise<Professor[]> {
        const payload = await this.request<unknown>('/professors', { query: params });
        return parseOrLog(professorSchema.array(), payload, 'ProfessorsClient.list response');
    }

    async getById(id: EntityId): Promise<Professor> {
        const payload = await this.request<unknown>(`/professors/${id}`);
        return parseOrLog(professorSchema, payload, 'ProfessorsClient.getById response');
    }

    async create(payload: CreateProfessorPayload): Promise<Professor> {
        const parsedPayload = parseOrLog(
            professorProfileSchema,
            payload,
            'ProfessorsClient.create payload'
        );

        const response = await this.request<unknown>('/professors', {
            method: 'POST',
            body: JSON.stringify(parsedPayload),
        });

        return parseOrLog(professorSchema, response, 'ProfessorsClient.create response');
    }

    async update(id: EntityId, payload: UpdateProfessorPayload): Promise<Professor> {
        const parsedPayload = parseOrLog(
            professorProfilePatchSchema,
            payload,
            'ProfessorsClient.update payload'
        );

        const response = await this.request<unknown>(`/professors/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(parsedPayload),
        });

        return parseOrLog(professorSchema, response, 'ProfessorsClient.update response');
    }

    delete(id: EntityId): Promise<void> {
        return this.request<void>(`/professors/${id}`, {
            method: 'DELETE',
        });
    }

    async uploadAvatar(id: EntityId, file: Blob): Promise<Professor> {
        const formData = new FormData();
        formData.append('file', file, 'avatar.webp');

        const response = await this.request<unknown>(`/professors/${id}/avatar`, {
            method: 'POST',
            body: formData,
            headers: {}, // ensure default JSON header is cleared
        });

        return professorSchema.parse(response);
    }
}

export const professorClient = new ProfessorsClient({
    baseUrl: apiBaseUrl,
});

function parseOrLog<T>(schema: ZodSchema<T>, value: unknown, context: string): T {
    const parsed = schema.safeParse(value);
    if (parsed.success) {
        return parsed.data;
    }

    logZodError(parsed.error, context);
    throw parsed.error;
}

function logZodError(error: ZodError, context: string): void {
    const issues = error.issues.map((issue) => {
        const path = issue.path.length ? issue.path.join('.') : '<root>';
        return `${path}: ${issue.message}`;
    });

    // eslint-disable-next-line no-console
    console.error(`[api-client] Validation failed in ${context}:`, issues);
}
