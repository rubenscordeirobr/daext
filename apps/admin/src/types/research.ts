import type { AcademicArea } from './professor';
import type {
    ResearchProject as DomainResearchProject,
    ResearchProjectStatus,
} from '@daext/domain';
export {
    ResearchProjectStatus,
    ResearchProjectStatusData,
    ResearchProjectStatusList,
    getResearchProjectStatusColor,
    getResearchProjectStatusDisplayName,
} from '@daext/domain';

export type ResearchProject = Omit<
    DomainResearchProject,
    'startedAt' | 'finishedAt' | 'createdAt' | 'updatedAt'
> & {
    startedAt: Date;
    finishedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export interface ResearchFilters {
    search: string;
    area: AcademicArea | 'all';
    status: ResearchProjectStatus | 'all';
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
}

export interface ResearchListParams {
    search?: string;
    area?: AcademicArea | 'all';
    status?: ResearchProjectStatus | 'all';
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'updatedAt' | 'title' | 'startedAt' | 'finishedAt';
    sortDir?: 'asc' | 'desc';
}

export interface ResearchListResponse {
    items: ResearchProject[];
    total: number;
}
