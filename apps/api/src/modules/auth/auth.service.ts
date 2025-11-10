import { randomUUID } from 'node:crypto';

import type { AuthSession, PasswordResetRequest, VerifyPasswordCodeResult } from '@daext/domain';

import { JsonAuthRepository } from './auth.repository.js';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const RESET_CODE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class InvalidCredentialsError extends Error {
    constructor(message = 'Credenciais invalidas') {
        super(message);
        this.name = 'InvalidCredentialsError';
    }
}

export class UserNotFoundError extends Error {
    constructor(message = 'Usuario nao encontrado') {
        super(message);
        this.name = 'UserNotFoundError';
    }
}

export class AuthService {
    private readonly sessions = new Map<string, AuthSession>();

    constructor(private readonly repository: JsonAuthRepository) {}

    async initialize(): Promise<void> {
        await this.ensureDefaultUser();
    }

    async login(loginId: string, password: string): Promise<AuthSession> {
        const user = await this.repository.findUserByLogin(loginId);

        if (!user || user.password !== password) {
            throw new InvalidCredentialsError();
        }

        const session = this.createSession(user);
        this.sessions.set(session.token, session);
        return session;
    }

    async logout(token: string): Promise<void> {
        this.sessions.delete(token);
    }

    async getSession(token: string): Promise<AuthSession | null> {
        const session = this.sessions.get(token);
        if (!session) {
            return null;
        }

        const now = Date.now();
        if (now >= Date.parse(session.expiresAt)) {
            this.sessions.delete(token);
            return null;
        }

        return session;
    }

    async requestResetCode(loginId: string): Promise<void> {
        const now = new Date();
        await this.repository.removeExpiredResetRequests(now);

        const request: PasswordResetRequest = {
            id: loginId.trim().toLowerCase(),
            loginId,
            code: this.generateCode(),
            attempts: 0,
            maxAttempts: 5,
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + RESET_CODE_DURATION_MS).toISOString(),
        };

        await this.repository.upsertResetRequest(request);
        console.log(`[MockAuth] Codigo de reset para ${loginId}: ${request.code}`);
    }

    async verifyResetCode(loginId: string, code: string): Promise<VerifyPasswordCodeResult> {
        const request = await this.repository.findResetRequestByLogin(loginId);
        if (!request) {
            return { valid: false, attemptsLeft: 0 };
        }

        const now = new Date();
        if (now > new Date(request.expiresAt)) {
            return {
                valid: false,
                attemptsLeft: Math.max(request.maxAttempts - request.attempts, 0),
                expired: true,
            };
        }

        request.attempts += 1;
        await this.repository.upsertResetRequest(request);

        if (request.attempts >= request.maxAttempts && request.code !== code) {
            return {
                valid: false,
                attemptsLeft: 0,
            };
        }

        const isValid = request.code === code;

        return {
            valid: isValid,
            attemptsLeft: Math.max(request.maxAttempts - request.attempts, 0),
        };
    }

    async resetPassword(loginId: string, newPassword: string): Promise<void> {
        const user = await this.repository.findUserByLogin(loginId);
        if (!user) {
            throw new UserNotFoundError();
        }

        const updated = {
            ...user,
            password: newPassword,
            updatedAt: new Date().toISOString(),
        };

        await this.repository.upsertUser(updated);
        await this.repository.deleteResetRequest(loginId);
    }

    private async ensureDefaultUser(): Promise<void> {
        const existing = await this.repository.listUsers();
        if (existing.length > 0) {
            return;
        }

        const now = new Date().toISOString();
        await this.repository.saveUsers([
            {
                id: 'user-admin',
                username: 'admin',
                email: 'admin@sistema.com',
                password: 'admin',
                name: 'Administrador',
                createdAt: now,
                updatedAt: now,
            },
        ]);
    }

    private createSession(user: {
        id: string;
        username: string;
        email: string;
        name: string;
    }): AuthSession {
        const issuedAt = new Date();
        const expiresAt = new Date(issuedAt.getTime() + SESSION_DURATION_MS);

        return {
            token: randomUUID(),
            userId: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            issuedAt: issuedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
        };
    }

    private generateCode(): string {
        return String(Math.floor(100000 + Math.random() * 900000));
    }
}
