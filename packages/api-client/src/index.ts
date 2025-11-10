import { ProfessorsClient } from './professors-client.js';
import { NewsClient } from './news-client.js';
import { ResearchClient } from './research-client.js';
import { AuthClient } from './auth-client.js';

export * from './base-client';
export * from './news-client';
export * from './professors-client';
export * from './research-client';
export * from './auth-client';

declare const process:
    | undefined
    | {
          env?: Record<string, string | undefined>;
      };

type GlobalWithApiUrl = typeof globalThis & {
    __DAEXT_API_URL__?: string;
};

const apiBaseUrl = resolveApiBaseUrl();

export const newsClient = new NewsClient({
    baseUrl: apiBaseUrl,
});

export const researchClient = new ResearchClient({
    baseUrl: apiBaseUrl,
});

export const professorClient = new ProfessorsClient({
    baseUrl: apiBaseUrl,
});

export const authClient = new AuthClient({
    baseUrl: apiBaseUrl,
});

function resolveApiBaseUrl(): string {
    const importMetaEnv =
        typeof import.meta !== 'undefined'
            ? ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ??
              undefined)
            : undefined;

    if (importMetaEnv) {
        const fromVite = importMetaEnv.VITE_API_URL ?? importMetaEnv.DAEXT_API_URL;
        if (fromVite && fromVite.length > 0) {
            return fromVite;
        }
    }

    const processEnv = typeof process !== 'undefined' ? process?.env : undefined;
    if (processEnv) {
        const fromProcess = processEnv.DAEXT_API_URL ?? processEnv.VITE_API_URL;
        if (fromProcess && fromProcess.length > 0) {
            return fromProcess;
        }
    }

    if (typeof globalThis !== 'undefined') {
        const globalWithUrl = globalThis as GlobalWithApiUrl;
        if (globalWithUrl.__DAEXT_API_URL__) {
            return globalWithUrl.__DAEXT_API_URL__;
        }
    }

    return 'http://localhost:4000';
}
