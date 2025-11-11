import type { AuthSession, VerifyPasswordCodeResult } from '@daext/domain';
import { authClient } from '@daext/api-client';

const SESSION_KEY = 'auth_mock_session';

class ServiceAuth {
    async login(loginId: string, password: string): Promise<AuthSession> {
        const session = await authClient.login({ loginId, password });
        this.saveSession(session);
        return session;
    }

    async logout(): Promise<void> {
        const session = this.getSession();
        this.clearSession();

        if (!session) {
            return;
        }

        try {
            await authClient.logout({ token: session.token });
        } catch {
            // Ignore network errors during logout; session was already removed locally.
        }
    }

    requestCode(loginId: string): Promise<void> {
        return authClient.requestCode({ loginId });
    }

    verifyCode(loginId: string, code: string): Promise<VerifyPasswordCodeResult> {
        return authClient.verifyCode({ loginId, code });
    }

    resetPassword(loginId: string, newPassword: string): Promise<void> {
        return authClient.resetPassword({ loginId, newPassword });
    }

    getSession(): AuthSession | null {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) {
            return null;
        }

        try {
            const session = JSON.parse(raw) as AuthSession;
            if (Date.now() >= Date.parse(session.expiresAt)) {
                this.clearSession();
                return null;
            }

            return session;
        } catch {
            this.clearSession();
            return null;
        }
    }

    isAuthenticated(): boolean {
        return this.getSession() !== null;
    }

    private saveSession(session: AuthSession): void {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    private clearSession(): void {
        sessionStorage.removeItem(SESSION_KEY);
    }
}

export const authService = new ServiceAuth();
export default authService;
