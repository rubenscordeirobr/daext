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

        return items.filter((item) => {
            if (filter.area) {
                const normalizedArea = filter.area.toLowerCase();
                const matchesArea = item.researchAreas.some((area: string) =>
                    area.toLowerCase().includes(normalizedArea)
                );
                if (!matchesArea) return false;
            }

            if (filter.search) {
                const text = filter.search.toLowerCase();
                const matchesSearch =
                    item.fullName.toLowerCase().includes(text) ||
                    item.bio.toLowerCase().includes(text) ||
                    item.academicTitle.toLowerCase().includes(text);
                if (!matchesSearch) return false;
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
