import { randomUUID } from 'node:crypto';

import type { EntityId, ResearchProject, ResearchProjectDraft } from '@daext/domain';
import { createResearchProject } from '@daext/domain';

import { NotFoundError } from '../../core/errors.js';
import type { ListResearchFilter, ResearchRepository } from './research.repository.js';

export interface ListResearchOptions extends ListResearchFilter {
    page?: number;
    pageSize?: number;
}

export class ResearchService {
    constructor(private readonly repository: ResearchRepository) {}

    async list(options: ListResearchOptions = {}): Promise<ResearchProject[]> {
        const { page, pageSize, ...filter } = options;
        const items = await this.repository.list(filter);

        if (!page || !pageSize) {
            return items;
        }

        const start = Math.max(page - 1, 0) * pageSize;
        return items.slice(start, start + pageSize);
    }

    getById(id: EntityId): Promise<ResearchProject | null> {
        return this.repository.findById(id);
    }

    async create(input: ResearchProjectDraft): Promise<ResearchProject> {
        const project = createResearchProject({
            ...input,
            id: randomUUID(),
        });
        return this.repository.create(project);
    }

    async update(id: EntityId, patch: Partial<ResearchProjectDraft>): Promise<ResearchProject> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundError(`Research project ${id} not found.`);
        }

        const updated: ResearchProject = {
            ...existing,
            ...patch,
            collaborators: patch.collaborators ?? existing.collaborators,
            keywords: patch.keywords ?? existing.keywords,
            finishedAt: patch.finishedAt === undefined ? existing.finishedAt : patch.finishedAt,
            updatedAt: new Date().toISOString(),
        };

        return this.repository.update(id, updated);
    }

    async delete(id: EntityId): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundError(`Research project ${id} not found.`);
        }
        await this.repository.delete(id);
    }
}
