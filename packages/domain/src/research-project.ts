import type { EntityId, ISODateString } from './primitives.js';
import { ResearchProjectStatus } from './research-project-status.js';
import { AcademicArea } from './academic-area.js';

export interface ResearchProject {
    id: EntityId;
    title: string;
    area: AcademicArea;
    supervisor: string;
    collaborators?: string[];
    summary: string;
    imageUrl: string;
    description: string;
    status: ResearchProjectStatus;
    leadProfessorId?: EntityId;
    keywords: string[];
    startedAt: ISODateString;
    finishedAt?: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface ResearchProjectDraft {
    title: string;
    area: AcademicArea;
    supervisor: string;
    collaborators?: string[];
    summary: string;
    imageUrl?: string;
    description: string;
    leadProfessorId?: EntityId;
    status: ResearchProjectStatus;
    keywords?: string[];
    startedAt: ISODateString;
    finishedAt?: ISODateString | null;
}

export function isResearchProject(value: unknown): value is ResearchProject {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.summary === 'string' &&
        typeof candidate.description === 'string' &&
        typeof candidate.status === 'string' &&
        typeof candidate.researchAreas === 'object' &&
        Array.isArray(candidate.researchAreas) &&
        candidate.researchAreas.every((area) => typeof area === 'string') &&
        (candidate.leadProfessorId === undefined ||
            typeof candidate.leadProfessorId === 'string') &&
        Array.isArray(candidate.collaborators) &&
        candidate.collaborators.every((member) => typeof member === 'string') &&
        Array.isArray(candidate.keywords) &&
        candidate.keywords.every((keyword) => typeof keyword === 'string') &&
        typeof candidate.startedAt === 'string' &&
        (candidate.finishedAt === undefined || typeof candidate.finishedAt === 'string') &&
        typeof candidate.createdAt === 'string' &&
        typeof candidate.updatedAt === 'string'
    );
}

export function createResearchProject(
    data: ResearchProjectDraft & {
        id: EntityId;
        createdAt?: ISODateString;
        updatedAt?: ISODateString;
    }
): ResearchProject {
    const now = new Date().toISOString();
    return {
        id: data.id,
        title: data.title,
        summary: data.summary,
        description: data.description,
        status: data.status ?? ResearchProjectStatus.Draft,
        area: data.area,
        supervisor: data.supervisor,
        imageUrl: data.imageUrl ?? 'assets/images/no-image-available.png',
        leadProfessorId: data.leadProfessorId,
        collaborators: data.collaborators ? [...data.collaborators] : [],
        keywords: data.keywords ? [...data.keywords] : [],
        startedAt: data.startedAt,
        finishedAt: data.finishedAt ?? null,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
    };
}
