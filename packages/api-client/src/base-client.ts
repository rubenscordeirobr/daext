export interface ApiClientOptions {
    baseUrl: string;
    fetchImpl?: typeof fetch;
    defaultHeaders?: HeadersInit;
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface RequestOptions extends RequestInit {
    query?: QueryParams;
}

export class HttpError extends Error {
    constructor(
        message: string,
        public readonly url: string,
        public readonly status: number,
        public readonly metadata?: { url: string; method: string; [key: string]: unknown }
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
};

export abstract class BaseClient {
    protected readonly baseUrl: string;
    private readonly defaultHeaders: HeadersInit;
    private readonly fetchImpl: typeof fetch;

    constructor(options: ApiClientOptions) {
        const fetchImpl = options.fetchImpl ?? globalThis.fetch;
        if (!fetchImpl) {
            throw new Error(
                'No fetch implementation available. Provide one via ApiClientOptions.fetchImpl.'
            );
        }

        this.baseUrl = options.baseUrl.replace(/\/+$/, '');
        this.defaultHeaders = options.defaultHeaders ?? defaultHeaders;
        // Some native fetch implementations require the correct `this` binding
        // (calling an unbound native function can cause "Illegal invocation").
        // If the chosen implementation is the global fetch, bind it to globalThis.
        // If the caller passed a custom fetch, assume it's already usable as-is.
        this.fetchImpl = fetchImpl === globalThis.fetch ? fetchImpl.bind(globalThis) : fetchImpl;
    }

    protected async request<TResponse>(
        path: string,
        options: RequestOptions = {}
    ): Promise<TResponse> {
        const url = buildUrl(this.baseUrl, path, options.query);

        try {
            const headers = mergeHeaders(this.defaultHeaders, options.headers);
            const response = await this.fetchImpl(url, {
                ...options,
                headers: headers,
            });

            if (!response.ok) {
                const text = await safeReadText(response);
                throw new HttpError(text || response.statusText, url, response.status, {
                    url,
                    method: options.method ?? 'GET',
                });
            }

            if (response.status === 204) {
                return undefined as TResponse;
            }

            return (await response.json()) as TResponse;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }

            const message = error instanceof Error ? error.message : String(error);

            throw new HttpError(message, url, -1, {
                url,
                method: options.method ?? 'GET',
            });
        }
    }
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${baseUrl}${normalizedPath}`);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null) continue;
            url.searchParams.set(key, String(value));
        }
    }

    return url.toString();
}

function mergeHeaders(defaults: HeadersInit, overrides: HeadersInit | undefined): HeadersInit {
    const headers = new Headers(defaults);
    if (!overrides) {
        return headers;
    }

    const entries = overrides instanceof Headers ? overrides.entries() : Object.entries(overrides);

    for (const [key, value] of entries) {
        headers.set(key, value as string);
    }

    return headers;
}

async function safeReadText(response: Response): Promise<string> {
    try {
        return await response.text();
    } catch {
        return '';
    }
}
