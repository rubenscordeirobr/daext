import type { AcademicArea, Professor, ProfessorProfileDraft } from '@daext/domain';

export type { Professor, ProfessorProfileDraft } from '@daext/domain';
export {
    AcademicArea,
    AcademicAreaIcon,
    AcademicAreaList,
    getAreaDisplayName,
} from '@daext/domain';

export type AcademicTitle =
    | 'Professor'
    | 'Doutor'
    | 'Mestre'
    | 'Livre-docente'
    | 'Especialista'
    | 'Bacharel';

export interface ProfessorFilters {
    search: string;
    area: AcademicArea | 'all';
}

export interface ProfessorListParams {
    search?: string;
    area?: AcademicArea | 'all';
    page?: number;
    pageSize?: number;
    sortBy?: 'updatedAt' | 'fullName';
    sortDir?: 'asc' | 'desc';
}

export interface ProfessorListResponse {
    items: Professor[];
    total: number;
}
