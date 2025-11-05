import { randomUUID } from 'node:crypto';

import type { EntityId, Professor, ProfessorProfileDraft } from '@daext/domain';
import { createProfessor } from '@daext/domain';

import { NotFoundError } from '../../core/errors.js';
import type { ListProfessorsFilter, ProfessorsRepository } from './professors.repository.js';

export interface ListProfessorsOptions extends ListProfessorsFilter {
    page?: number;
    pageSize?: number;
}

export class ProfessorsService {
    constructor(private readonly repository: ProfessorsRepository) {}

    async list(options: ListProfessorsOptions = {}): Promise<Professor[]> {
        const { page, pageSize, ...filter } = options;
        const items = await this.repository.list(filter);

        if (!page || !pageSize) {
            return items;
        }

        const start = Math.max(page - 1, 0) * pageSize;
        return items.slice(start, start + pageSize);
    }

    getById(id: EntityId): Promise<Professor | null> {
        return this.repository.findById(id);
    }

    async create(input: ProfessorProfileDraft): Promise<Professor> {
        const professor = createProfessor({
            ...input,
            id: randomUUID(),
        });
        return this.repository.create(professor);
    }

    async update(id: EntityId, patch: Partial<ProfessorProfileDraft>): Promise<Professor> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundError(`Professor ${id} not found.`);
        }

        const updated: Professor = {
            ...existing,
            ...patch,
            researchAreas: patch.researchAreas ?? existing.researchAreas,
            updatedAt: new Date().toISOString(),
        };

        return this.repository.update(id, updated);
    }

    async delete(id: EntityId): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundError(`Professor ${id} not found.`);
        }
        await this.repository.delete(id);
    }
}
