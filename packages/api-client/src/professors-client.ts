import type { EntityId, Professor, ProfessorProfileDraft } from '@daext/domain';
import { BaseClient } from './base-client';
import type { ApiClientOptions, QueryParams } from './base-types';
import { apiBaseUrl } from './config.js';

export interface ListProfessorsParams extends QueryParams {
    search?: string;
    area?: string;
    page?: number;
    pageSize?: number;
}

export type CreateProfessorPayload = ProfessorProfileDraft;
export type UpdateProfessorPayload = Partial<ProfessorProfileDraft>;

class ProfessorsClient extends BaseClient {
    constructor(options: ApiClientOptions) {
        super(options);
    }

    list(params?: ListProfessorsParams): Promise<Professor[]> {
        return this.request<Professor[]>('/professors', {
            query: params,
        });
    }

    getById(id: EntityId): Promise<Professor> {
        return this.request<Professor>(`/professors/${id}`);
    }

    create(payload: CreateProfessorPayload): Promise<Professor> {
        return this.request<Professor>('/professors', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    update(id: EntityId, payload: UpdateProfessorPayload): Promise<Professor> {
        return this.request<Professor>(`/professors/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    delete(id: EntityId): Promise<void> {
        return this.request<void>(`/professors/${id}`, {
            method: 'DELETE',
        });
    }
}

export const professorClient = new ProfessorsClient({
    baseUrl: apiBaseUrl,
});
