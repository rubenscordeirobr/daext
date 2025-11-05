import type { EntityId, ISODateString } from './primitives.js';

export const RESEARCH_PROJECT_STATUSES = ['draft', 'active', 'completed', 'archived'] as const;

export type ResearchProjectStatus = (typeof RESEARCH_PROJECT_STATUSES)[number];

export interface ResearchProject {
    id: EntityId;
    title: string;
    summary: string;
    description: string;
    status: ResearchProjectStatus;
    leadProfessorId: EntityId;
    team: EntityId[];
    keywords: string[];
    startedAt: ISODateString;
    finishedAt?: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface ResearchProjectDraft {
    title: string;
    summary: string;
    description: string;
    status?: ResearchProjectStatus;
    leadProfessorId: EntityId;
    team?: EntityId[];
    keywords?: string[];
    startedAt: ISODateString;
    finishedAt?: ISODateString | null;
}

export const DEFAULT_RESEARCH_STATUS: ResearchProjectStatus = 'draft';

export function isResearchProject(value: unknown): value is ResearchProject {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.summary === 'string' &&
        typeof candidate.description === 'string' &&
        typeof candidate.status === 'string' &&
        (RESEARCH_PROJECT_STATUSES as readonly string[]).includes(candidate.status) &&
        typeof candidate.leadProfessorId === 'string' &&
        Array.isArray(candidate.team) &&
        candidate.team.every((member) => typeof member === 'string') &&
        Array.isArray(candidate.keywords) &&
        candidate.keywords.every((keyword) => typeof keyword === 'string') &&
        typeof candidate.startedAt === 'string' &&
        (candidate.finishedAt === undefined ||
            candidate.finishedAt === null ||
            typeof candidate.finishedAt === 'string') &&
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
        status: data.status ?? DEFAULT_RESEARCH_STATUS,
        leadProfessorId: data.leadProfessorId,
        team: data.team ? [...data.team] : [],
        keywords: data.keywords ? [...data.keywords] : [],
        startedAt: data.startedAt,
        finishedAt: data.finishedAt ?? null,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
    };
}
