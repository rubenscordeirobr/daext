import type { EntityId, ISODateString } from './primitives.js';
import { AcademicArea } from './academic-area.js';

export interface Professor {
    id: EntityId;
    fullName: string;
    academicTitle: string;
    area: AcademicArea;
    specialization: string;
    orcid?: string;
    researchAreas: string[];
    bio: string;
    email?: string;
    phone?: string;
    lattesUrl?: string;
    avatarUrl: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface ProfessorProfileDraft {
    fullName: string;
    academicTitle: string;
    area: AcademicArea;
    specialization: string;
    orcid?: string;
    researchAreas: string[];
    bio: string;
    email?: string;
    phone?: string;
    lattesUrl?: string;
    avatarUrl?: string;
}

export function isProfessor(value: unknown): value is Professor {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.fullName === 'string' &&
        typeof candidate.academicTitle === 'string' &&
        Array.isArray(candidate.researchAreas) &&
        candidate.researchAreas.every((area) => typeof area === 'string') &&
        typeof candidate.bio === 'string' &&
        (candidate.email === undefined || typeof candidate.email === 'string') &&
        (candidate.phone === undefined || typeof candidate.phone === 'string') &&
        (candidate.lattesUrl === undefined || typeof candidate.lattesUrl === 'string') &&
        (candidate.avatarUrl === undefined || typeof candidate.avatarUrl === 'string') &&
        typeof candidate.createdAt === 'string' &&
        typeof candidate.updatedAt === 'string'
    );
}

export function createProfessor(
    data: ProfessorProfileDraft & {
        id: EntityId;
        createdAt?: ISODateString;
        updatedAt?: ISODateString;
    }
): Professor {
    const now = new Date().toISOString();
    return {
        id: data.id,
        fullName: data.fullName,
        academicTitle: data.academicTitle,
        area: data.area,
        orcid: data.orcid,
        specialization: data.specialization,
        researchAreas: [...data.researchAreas],
        bio: data.bio,
        email: data.email,
        phone: data.phone,
        lattesUrl: data.lattesUrl,
        avatarUrl: data.avatarUrl ?? 'assets/images/no-image-available.png',
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
    };
}
