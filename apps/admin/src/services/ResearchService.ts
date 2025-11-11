import type { ResearchListParams, ResearchListResponse, ResearchProject } from '../types/research';
import { ResearchProjectStatus } from '../types/research';
import {
    HttpError,
    researchClient,
    type ListResearchParams as ApiListResearchParams,
} from '@daext/api-client';
import type { ResearchProjectDraft, ResearchProject as DomainResearchProject } from '@daext/domain';

class ResearchService {
    async getAll(params?: ResearchListParams): Promise<ResearchListResponse> {
        const clientParams: ApiListResearchParams = {};
        if (params?.status && params.status !== 'all') {
            clientParams.status = params.status;
        }
        if (params?.search) {
            clientParams.keyword = params.search;
        }

        const rawProjects = await researchClient.list(clientParams);
        const projects = rawProjects.map((project) => this.toUiProject(project));

        const filtered = this.applyFilters(projects, params);
        const sorted = this.sortProjects(filtered, params?.sortBy, params?.sortDir);
        const paginated = this.paginate(sorted, params?.page, params?.pageSize);

        return {
            items: paginated,
            total: filtered.length,
        };
    }

    async getById(id: string): Promise<ResearchProject | null> {
        try {
            const project = await researchClient.getById(id);
            return this.toUiProject(project);
        } catch (error) {
            if (error instanceof HttpError && error.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async create(
        project: Omit<ResearchProject, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ResearchProject> {
        const payload = this.toDraftPayload(project);
        const created = await researchClient.create(payload);
        return this.toUiProject(created);
    }

    async update(id: string, updates: Partial<ResearchProject>): Promise<ResearchProject> {
        const payload = this.toUpdatePayload(updates);
        const updated = await researchClient.update(id, payload);
        return this.toUiProject(updated);
    }

    async delete(id: string): Promise<void> {
        await researchClient.delete(id);
    }

    async deleteMultiple(ids: string[]): Promise<void> {
        await Promise.all(ids.map((projectId) => this.delete(projectId)));
    }

    async duplicate(id: string): Promise<ResearchProject> {
        const original = await this.getById(id);
        if (!original) {
            throw new Error('Projeto de pesquisa nao encontrado');
        }

        const duplicatePayload: Omit<ResearchProject, 'id' | 'createdAt' | 'updatedAt'> = {
            title: `Cópia de ${original.title}`,
            area: original.area,
            supervisor: original.supervisor,
            collaborators: [...original.collaborators],
            summary: original.summary,
            imageUrl: original.imageUrl,
            description: original.description,
            status: ResearchProjectStatus.Draft,
            leadProfessorId: original.leadProfessorId,
            keywords: [...original.keywords],
            startedAt: new Date(),
            finishedAt: undefined,
        };

        return this.create(duplicatePayload);
    }

    async updateStatus(
        id: string,
        status: ResearchProjectStatus,
        finishedAt?: Date
    ): Promise<ResearchProject> {
        return this.update(id, {
            status,
            finishedAt,
        });
    }

    async updateMultipleStatus(ids: string[], status: ResearchProjectStatus): Promise<void> {
        await Promise.all(ids.map((projectId) => this.updateStatus(projectId, status)));
    }

    async getKeywordsSuggestions(): Promise<string[]> {
        const projects = await researchClient.list();
        const keywords = new Set<string>();
        projects.forEach((project) => {
            (project.keywords ?? []).forEach((keyword) => {
                const trimmed = keyword.trim();
                if (trimmed) {
                    keywords.add(trimmed);
                }
            });
        });
        return Array.from(keywords).sort((a, b) => a.localeCompare(b));
    }

    async saveDraft(id: string, updates: Partial<ResearchProject>): Promise<void> {
        await this.update(id, updates);
    }

    private toUiProject(project: DomainResearchProject): ResearchProject {
        return {
            ...project,
            status: this.normalizeStatus(project.status),
            collaborators: project.collaborators ?? [],
            keywords: project.keywords ?? [],
            startedAt: new Date(project.startedAt),
            finishedAt: project.finishedAt ? new Date(project.finishedAt) : null,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
        };
    }

    private normalizeStatus(status: string): ResearchProjectStatus {
        const normalized = status.toLowerCase();
        switch (normalized) {
            case 'draft':
                return ResearchProjectStatus.Draft;
            case 'completed':
                return ResearchProjectStatus.Completed;
            case 'archived':
                return ResearchProjectStatus.Archived;
            case 'active':
            case 'in progress':
            case 'in_progress':
                return ResearchProjectStatus.Active;
            default:
                return ResearchProjectStatus.Draft;
        }
    }

    private applyFilters(
        projects: ResearchProject[],
        params?: ResearchListParams
    ): ResearchProject[] {
        if (!params) return projects;
        let filtered = [...projects];

        if (params.search) {
            const searchLower = params.search.toLowerCase();
            filtered = filtered.filter(
                (project) =>
                    project.title.toLowerCase().includes(searchLower) ||
                    project.supervisor.toLowerCase().includes(searchLower) ||
                    project.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
            );
        }

        if (params.area && params.area !== 'all') {
            filtered = filtered.filter((project) => project.area === params.area);
        }

        if (params.status && params.status !== 'all') {
            filtered = filtered.filter((project) => project.status === params.status);
        }

        if (params.startDateFrom) {
            const fromDate = new Date(params.startDateFrom);
            filtered = filtered.filter((project) => project.startedAt >= fromDate);
        }

        if (params.startDateTo) {
            const toDate = new Date(params.startDateTo);
            filtered = filtered.filter((project) => project.startedAt <= toDate);
        }

        if (params.endDateFrom && params.endDateTo) {
            const fromDate = new Date(params.endDateFrom);
            const toDate = new Date(params.endDateTo);
            filtered = filtered.filter(
                (project) =>
                    project.finishedAt &&
                    project.finishedAt >= fromDate &&
                    project.finishedAt <= toDate
            );
        }

        return filtered;
    }

    private sortProjects(
        projects: ResearchProject[],
        sortBy: ResearchListParams['sortBy'] = 'updatedAt',
        sortDir: ResearchListParams['sortDir'] = 'desc'
    ): ResearchProject[] {
        return [...projects].sort((a, b) => {
            let aValue: number | string = '';
            let bValue: number | string = '';

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'startedAt':
                    aValue = a.startedAt.getTime();
                    bValue = b.startedAt.getTime();
                    break;
                case 'finishedAt':
                    aValue = a.finishedAt ? a.finishedAt.getTime() : 0;
                    bValue = b.finishedAt ? b.finishedAt.getTime() : 0;
                    break;
                case 'updatedAt':
                default:
                    aValue = a.updatedAt.getTime();
                    bValue = b.updatedAt.getTime();
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDir === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortDir === 'asc'
                ? (aValue as number) - (bValue as number)
                : (bValue as number) - (aValue as number);
        });
    }

    private paginate(projects: ResearchProject[], page = 1, pageSize = 10): ResearchProject[] {
        const startIndex = (page - 1) * pageSize;
        return projects.slice(startIndex, startIndex + pageSize);
    }

    private toDraftPayload(
        project: Omit<ResearchProject, 'id' | 'createdAt' | 'updatedAt'>
    ): ResearchProjectDraft {
        return {
            title: project.title,
            area: project.area,
            supervisor: project.supervisor,
            collaborators: project.collaborators ?? [],
            summary: project.summary,
            imageUrl: project.imageUrl,
            description: project.description,
            status: project.status,
            leadProfessorId: project.leadProfessorId,
            keywords: project.keywords ?? [],
            startedAt: project.startedAt.toISOString(),
            finishedAt: project.finishedAt ? project.finishedAt.toISOString() : null,
        };
    }

    private toUpdatePayload(updates: Partial<ResearchProject>): Partial<ResearchProjectDraft> {
        const payload: Partial<ResearchProjectDraft> = {};

        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.area !== undefined) payload.area = updates.area;
        if (updates.supervisor !== undefined) payload.supervisor = updates.supervisor;
        if (updates.collaborators !== undefined) payload.collaborators = [...updates.collaborators];
        if (updates.summary !== undefined) payload.summary = updates.summary;
        if (updates.imageUrl !== undefined) payload.imageUrl = updates.imageUrl;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.leadProfessorId !== undefined)
            payload.leadProfessorId = updates.leadProfessorId;
        if (updates.keywords !== undefined) payload.keywords = [...updates.keywords];
        if (updates.startedAt !== undefined) {
            payload.startedAt =
                updates.startedAt instanceof Date
                    ? updates.startedAt.toISOString()
                    : new Date(updates.startedAt).toISOString();
        }
        if (updates.finishedAt !== undefined) {
            payload.finishedAt =
                updates.finishedAt instanceof Date
                    ? updates.finishedAt.toISOString()
                    : updates.finishedAt
                      ? new Date(updates.finishedAt).toISOString()
                      : null;
        }

        return payload;
    }
}

export const researchService = new ResearchService();
