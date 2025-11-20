import { z } from 'zod';

import type { EntityId, ISODateString } from './primitives.js';
import { AcademicArea } from './academic-area.js';

const assetUrlSchema = z
    .string()
    .trim()
    .min(1)
    .refine(
        (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
        'Use an absolute URL or a /-prefixed asset path.'
    );

const optionalString = z.string().trim().optional();

export const professorProfileSchema = z.object({
    fullName: z.string().trim().min(3),
    academicTitle: z.string().trim().min(2),
    area: z.nativeEnum(AcademicArea),
    specialization: z.string().trim().min(2),
    orcid: optionalString,
    researchAreas: z.array(z.string().trim().min(1)),
    bio: z.string().trim().min(10),
    email: optionalString,
    phone: optionalString,
    lattesUrl: z.string().trim().url().optional(),
    avatarUrl: assetUrlSchema.optional(),
});

export const professorProfilePatchSchema = professorProfileSchema.partial();

export type ProfessorProfileDraft = z.infer<typeof professorProfileSchema>;
export type ProfessorProfilePatch = z.infer<typeof professorProfilePatchSchema>;

export const professorSchema = professorProfileSchema.extend({
    id: z.string().trim().min(1),
    avatarUrl: assetUrlSchema.default('/assets/images/no-image-available.png'),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
});

export type Professor = z.infer<typeof professorSchema>;

export function isProfessor(value: unknown): value is Professor {
    return professorSchema.safeParse(value).success;
}

export type CreateProfessorInput = ProfessorProfileDraft & {
    id: EntityId;
    createdAt?: ISODateString;
    updatedAt?: ISODateString;
};

export function createProfessor(data: CreateProfessorInput): Professor {
    const now = new Date().toISOString();

    return professorSchema.parse({
        ...data,
        researchAreas: [...data.researchAreas],
        avatarUrl: data.avatarUrl ?? undefined,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
    });
}

export function buildProfessorAvatarUrl(id: EntityId): string {
    return `/assets/professors/${id}/avatar.webp`;
}
