import type { EntityId, Professor } from '@daext/domain';

import { JsonStore } from '../../infrastructure/json-store.js';
import type { ListProfessorsFilter, ProfessorsRepository } from './professors.repository.js';

export class JsonProfessorsRepository implements ProfessorsRepository {
    constructor(private readonly store: JsonStore<Professor>) {}

    async list(filter?: ListProfessorsFilter): Promise<Professor[]> {
        const items = await this.store.readAll();
        if (!filter) {
            return items;
        }

        const normalizedArea = filter.area?.trim().toLowerCase();
        const normalizedSearch = filter.search?.trim().toLowerCase();

        return items.filter((item) => {
            if (normalizedArea && item.area.toLowerCase() !== normalizedArea) {
                return false;
            }

            if (normalizedSearch) {
                const fieldValues = [
                    item.fullName,
                    item.academicTitle,
                    item.specialization,
                    item.bio,
                    item.email ?? '',
                    item.phone ?? '',
                ]
                    .filter(Boolean)
                    .map((value) => value.toLowerCase());

                const fieldMatches = fieldValues.some((value) => value.includes(normalizedSearch));
                const researchMatches = item.researchAreas.some((area) =>
                    area.toLowerCase().includes(normalizedSearch)
                );

                if (!fieldMatches && !researchMatches) {
                    return false;
                }
            }

            return true;
        });
    }

    async findById(id: EntityId): Promise<Professor | null> {
        const items = await this.store.readAll();
        return items.find((item) => item.id === id) ?? null;
    }

    async create(professor: Professor): Promise<Professor> {
        const items = await this.store.readAll();
        items.push(professor);
        await this.store.writeAll(items);
        return professor;
    }

    async update(id: EntityId, professor: Professor): Promise<Professor> {
        const items = await this.store.readAll();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error(`Professor ${id} not found.`);
        }
        items[index] = professor;
        await this.store.writeAll(items);
        return professor;
    }

    async delete(id: EntityId): Promise<void> {
        const items = await this.store.readAll();
        const filtered = items.filter((item) => item.id !== id);
        await this.store.writeAll(filtered);
    }
}
