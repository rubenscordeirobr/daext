type GlobalWithApiUrl = typeof globalThis & {
    __DAEXT_API_URL__?: string;
};
type EnvMap = Record<string, string | undefined>;

let cachedApiBaseUrl: string | null = null;

function isAbsoluteUrl(s: string): boolean {
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

function stripTrailingSlash(s: string): string {
    return s.endsWith('/') ? s.slice(0, -1) : s;
}

function pickEnvUrl(env: EnvMap | undefined): string | undefined {
    if (!env) return undefined;
    return env.VITE_API_URL || env.DAEXT_API_URL || undefined;
}

/**
 * Resolve the API base URL with this precedence:
 * 1. import.meta.env (Vite)
 * 2. process.env
 * 3. globalThis.__DAEXT_API_URL__
 * 4. Host guess using window.location when available
 * 5. Final default http://localhost:4000
 */
function resolveApiBaseUrl(): string {
    if (cachedApiBaseUrl) return cachedApiBaseUrl;

    // 1) Vite env
    const viteEnv =
        typeof import.meta !== 'undefined'
            ? (import.meta as ImportMeta & { env?: EnvMap }).env
            : undefined;

    const fromVite = pickEnvUrl(viteEnv);
    if (fromVite && isAbsoluteUrl(fromVite)) {
        return (cachedApiBaseUrl = stripTrailingSlash(fromVite));
    }

    // 2) Node env
    const fromProcess =
        typeof process !== 'undefined' ? pickEnvUrl(process.env as EnvMap) : undefined;
    if (fromProcess && isAbsoluteUrl(fromProcess)) {
        return (cachedApiBaseUrl = stripTrailingSlash(fromProcess));
    }

    // 3) Global override for browser or tests
    if (typeof globalThis !== 'undefined') {
        const maybe = (globalThis as GlobalWithApiUrl).__DAEXT_API_URL__;
        if (maybe && isAbsoluteUrl(maybe)) {
            return (cachedApiBaseUrl = stripTrailingSlash(maybe));
        }
    }

    let guess = 'http://localhost:4000';

    const isBrowser = typeof window !== 'undefined' && typeof window.location !== 'undefined';
    if (isBrowser) {
        const host = window.location.hostname || 'localhost';
        const nonLocal = host !== 'localhost' && host !== '127.0.0.1' && host !== '45.238.108.200';
        const protocol = nonLocal ? 'https' : 'http';
        guess = `${protocol}://${host}:4000`;
    }
    return (cachedApiBaseUrl = stripTrailingSlash(guess));
}

export const apiBaseUrl = resolveApiBaseUrl();

export function __setApiBaseUrl(url: string): void {
    cachedApiBaseUrl = stripTrailingSlash(url);
}
