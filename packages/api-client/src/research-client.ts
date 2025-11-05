import type {
    EntityId,
    ResearchProject,
    ResearchProjectDraft,
    ResearchProjectStatus,
} from '@daext/domain';

import { BaseClient, type ApiClientOptions, type QueryParams } from './base-client';

export interface ListResearchParams extends QueryParams {
    status?: ResearchProjectStatus;
    keyword?: string;
    page?: number;
    pageSize?: number;
}

export type CreateResearchPayload = ResearchProjectDraft;
export type UpdateResearchPayload = Partial<ResearchProjectDraft>;

export class ResearchClient extends BaseClient {
    constructor(options: ApiClientOptions) {
        super(options);
    }

    list(params?: ListResearchParams): Promise<ResearchProject[]> {
        return this.request<ResearchProject[]>('/research', {
            query: params,
        });
    }

    getById(id: EntityId): Promise<ResearchProject> {
        return this.request<ResearchProject>(`/research/${id}`);
    }

    create(payload: CreateResearchPayload): Promise<ResearchProject> {
        return this.request<ResearchProject>('/research', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    update(id: EntityId, payload: UpdateResearchPayload): Promise<ResearchProject> {
        return this.request<ResearchProject>(`/research/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    delete(id: EntityId): Promise<void> {
        return this.request<void>(`/research/${id}`, {
            method: 'DELETE',
        });
    }
}
