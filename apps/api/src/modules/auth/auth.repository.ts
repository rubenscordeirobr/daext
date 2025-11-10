import type { AuthUser, PasswordResetRequest } from '@daext/domain';

import { JsonStore } from '../../infrastructure/json-store.js';

function normalizeLogin(loginId: string): string {
    return loginId.trim().toLowerCase();
}

export class JsonAuthRepository {
    constructor(
        private readonly usersStore: JsonStore<AuthUser>,
        private readonly resetStore: JsonStore<PasswordResetRequest>
    ) {}

    listUsers(): Promise<AuthUser[]> {
        return this.usersStore.readAll();
    }

    saveUsers(users: AuthUser[]): Promise<void> {
        return this.usersStore.writeAll(users);
    }

    async findUserByLogin(loginId: string): Promise<AuthUser | null> {
        const normalized = normalizeLogin(loginId);
        const users = await this.listUsers();
        return (
            users.find(
                (user) =>
                    user.username.toLowerCase() === normalized ||
                    user.email.toLowerCase() === normalized
            ) ?? null
        );
    }

    async upsertUser(user: AuthUser): Promise<AuthUser> {
        const users = await this.listUsers();
        const index = users.findIndex((existing) => existing.id === user.id);
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        await this.saveUsers(users);
        return user;
    }

    listResetRequests(): Promise<PasswordResetRequest[]> {
        return this.resetStore.readAll();
    }

    saveResetRequests(requests: PasswordResetRequest[]): Promise<void> {
        return this.resetStore.writeAll(requests);
    }

    async findResetRequestByLogin(loginId: string): Promise<PasswordResetRequest | null> {
        const normalized = normalizeLogin(loginId);
        const requests = await this.listResetRequests();
        return requests.find((request) => request.id === normalized) ?? null;
    }

    async upsertResetRequest(request: PasswordResetRequest): Promise<void> {
        const requests = await this.listResetRequests();
        const index = requests.findIndex((existing) => existing.id === request.id);
        if (index >= 0) {
            requests[index] = request;
        } else {
            requests.push(request);
        }
        await this.saveResetRequests(requests);
    }

    async deleteResetRequest(loginId: string): Promise<void> {
        const normalized = normalizeLogin(loginId);
        const requests = await this.listResetRequests();
        const filtered = requests.filter((request) => request.id !== normalized);
        if (filtered.length !== requests.length) {
            await this.saveResetRequests(filtered);
        }
    }

    async removeExpiredResetRequests(now: Date): Promise<void> {
        const requests = await this.listResetRequests();
        const filtered = requests.filter((request) => new Date(request.expiresAt) > now);
        if (filtered.length !== requests.length) {
            await this.saveResetRequests(filtered);
        }
    }
}
