import type {
    AuthSession,
    AuthCredentials,
    AuthLogoutPayload,
    RequestPasswordCodePayload,
    VerifyPasswordCodePayload,
    VerifyPasswordCodeResult,
    ResetPasswordPayload,
} from '@daext/domain';

import { BaseClient } from './base-client';
import type { ApiClientOptions, QueryParams } from './base-types';
import { apiBaseUrl } from './config.js';

class AuthClient extends BaseClient {
    constructor(options: ApiClientOptions) {
        super(options);
    }

    login(payload: AuthCredentials): Promise<AuthSession> {
        return this.request<AuthSession>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    logout(payload: AuthLogoutPayload): Promise<void> {
        return this.request<void>('/auth/logout', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    requestCode(payload: RequestPasswordCodePayload): Promise<void> {
        return this.request<void>('/auth/request-code', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    verifyCode(payload: VerifyPasswordCodePayload): Promise<VerifyPasswordCodeResult> {
        return this.request<VerifyPasswordCodeResult>('/auth/verify-code', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    resetPassword(payload: ResetPasswordPayload): Promise<void> {
        return this.request<void>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    getSession(token: string): Promise<AuthSession> {
        return this.request<AuthSession>('/auth/session', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export const authClient = new AuthClient({
    baseUrl: apiBaseUrl,
});
