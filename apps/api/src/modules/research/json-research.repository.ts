import type { EntityId, ResearchProject } from '@daext/domain';

import { JsonStore } from '../../infrastructure/json-store.js';
import type { ListResearchFilter, ResearchRepository } from './research.repository.js';

export class JsonResearchRepository implements ResearchRepository {
    constructor(private readonly store: JsonStore<ResearchProject>) {}

    async list(filter?: ListResearchFilter): Promise<ResearchProject[]> {
        const items = await this.store.readAll();
        if (!filter) {
            return items;
        }

        return items.filter((item) => {
            if (filter.status && item.status !== filter.status) {
                return false;
            }

            if (filter.keyword) {
                const text = filter.keyword.toLowerCase();
                const matchesKeyword =
                    item.title.toLowerCase().includes(text) ||
                    item.summary.toLowerCase().includes(text) ||
                    item.description.toLowerCase().includes(text) ||
                    item.keywords.some((keyword: string) => keyword.toLowerCase().includes(text));
                if (!matchesKeyword) {
                    return false;
                }
            }

            return true;
        });
    }

    async findById(id: EntityId): Promise<ResearchProject | null> {
        const items = await this.store.readAll();
        return items.find((item) => item.id === id) ?? null;
    }

    async create(project: ResearchProject): Promise<ResearchProject> {
        const items = await this.store.readAll();
        items.push(project);
        await this.store.writeAll(items);
        return project;
    }

    async update(id: EntityId, project: ResearchProject): Promise<ResearchProject> {
        const items = await this.store.readAll();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error(`Research project ${id} not found.`);
        }
        items[index] = project;
        await this.store.writeAll(items);
        return project;
    }

    async delete(id: EntityId): Promise<void> {
        const items = await this.store.readAll();
        const filtered = items.filter((item) => item.id !== id);
        await this.store.writeAll(filtered);
    }
}
