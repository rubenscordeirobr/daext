import type { Professor, ProfessorListParams, ProfessorListResponse } from '../types/professor';
import type {
    CreateProfessorPayload,
    ListProfessorsParams,
    UpdateProfessorPayload,
} from '@daext/api-client';
import { professorClient } from '@daext/api-client';

const client = professorClient;

class ProfessorsService {
    async getAll(params?: ProfessorListParams): Promise<ProfessorListResponse> {
        const apiParams = mapListParams(params);
        const response = await client.list(apiParams);
        const sorted = sortProfessors(response, params?.sortBy, params?.sortDir);
        const paginated = paginate(sorted, params?.page, params?.pageSize);

        return {
            items: paginated,
            total: sorted.length,
        };
    }

    getById(id: string): Promise<Professor> {
        return client.getById(id);
    }

    create(payload: CreateProfessorPayload): Promise<Professor> {
        return client.create(payload);
    }

    update(
        id: string,
        updates: UpdateProfessorPayload & { updatedAt?: string }
    ): Promise<Professor> {
        const { updatedAt: _ignored, ...rest } = updates;
        return client.update(id, rest);
    }

    delete(id: string): Promise<void> {
        return client.delete(id);
    }

    async deleteMultiple(ids: string[]): Promise<void> {
        await Promise.all(ids.map((id) => this.delete(id)));
    }

    async duplicate(id: string): Promise<Professor> {
        const original = await this.getById(id);
        const duplicatePayload: CreateProfessorPayload = {
            fullName: `Cópia de ${original.fullName}`,
            academicTitle: original.academicTitle,
            area: original.area,
            specialization: original.specialization,
            orcid: original.orcid,
            researchAreas: [...original.researchAreas],
            bio: original.bio,
            email: '',
            phone: '',
            lattesUrl: original.lattesUrl,
            avatarUrl: original.avatarUrl,
        };

        return this.create(duplicatePayload);
    }

    async getResearchAreasSuggestions(): Promise<string[]> {
        const professors = await client.list();
        const suggestions = new Set<string>();

        professors.forEach((professor) => {
            professor.researchAreas.forEach((area) => {
                if (area.trim()) {
                    suggestions.add(area.trim());
                }
            });
        });

        return Array.from(suggestions).sort((a, b) => a.localeCompare(b));
    }
}

function mapListParams(params?: ProfessorListParams): ListProfessorsParams | undefined {
    if (!params) {
        return undefined;
    }

    const { area, search, page, pageSize } = params;

    return {
        search,
        area: area && area !== 'all' ? area : undefined,
        page,
        pageSize,
    };
}

function sortProfessors(
    items: Professor[],
    sortBy: 'updatedAt' | 'fullName' = 'updatedAt',
    sortDir: 'asc' | 'desc' = 'desc'
): Professor[] {
    return [...items].sort((a, b) => {
        if (sortBy === 'fullName') {
            const result = a.fullName.localeCompare(b.fullName, 'pt-BR', { sensitivity: 'base' });
            return sortDir === 'asc' ? result : -result;
        }

        const aDate = new Date(a.updatedAt).getTime();
        const bDate = new Date(b.updatedAt).getTime();
        return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
    });
}

function paginate(items: Professor[], page = 1, pageSize = items.length || 1): Professor[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

export const professorsService = new ProfessorsService();
