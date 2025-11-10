import type { EntityId, ISODateString } from './primitives.js';

export interface AuthUser {
    id: EntityId;
    username: string;
    email: string;
    password: string;
    name: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface AuthCredentials {
    loginId: string;
    password: string;
}

export interface AuthSession {
    token: string;
    userId: EntityId;
    username: string;
    email: string;
    name: string;
    issuedAt: ISODateString;
    expiresAt: ISODateString;
}

export interface AuthLogoutPayload {
    token: string;
}

export interface PasswordResetRequest {
    id: EntityId;
    loginId: string;
    code: string;
    attempts: number;
    maxAttempts: number;
    expiresAt: ISODateString;
    createdAt: ISODateString;
}

export interface RequestPasswordCodePayload {
    loginId: string;
}

export interface VerifyPasswordCodePayload {
    loginId: string;
    code: string;
}

export interface ResetPasswordPayload {
    loginId: string;
    newPassword: string;
}

export interface VerifyPasswordCodeResult {
    valid: boolean;
    attemptsLeft: number;
    expired?: boolean;
}
