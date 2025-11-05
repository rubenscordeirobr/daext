import type { EntityId, ResearchProject, ResearchProjectStatus } from '@daext/domain';

export interface ListResearchFilter {
    status?: ResearchProjectStatus;
    keyword?: string;
}

export interface ResearchRepository {
    list(filter?: ListResearchFilter): Promise<ResearchProject[]>;
    findById(id: EntityId): Promise<ResearchProject | null>;
    create(project: ResearchProject): Promise<ResearchProject>;
    update(id: EntityId, project: ResearchProject): Promise<ResearchProject>;
    delete(id: EntityId): Promise<void>;
}
