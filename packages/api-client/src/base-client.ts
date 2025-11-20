import type { ApiClientOptions, QueryParams, RequestOptions } from './base-types';
import { HttpError } from './base-types';

const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
};

export abstract class BaseClient {
    protected readonly baseUrl: string;
    private readonly defaultHeaders: HeadersInit;
    private readonly fetchImpl: typeof fetch;
    private readonly debug: boolean;

    constructor(options: ApiClientOptions) {
        const fetchImpl = options.fetchImpl ?? globalThis.fetch;
        if (!fetchImpl) {
            throw new Error(
                'No fetch implementation available. Provide one via ApiClientOptions.fetchImpl.'
            );
        }

        this.baseUrl = options.baseUrl.replace(/\/+$/, '');
        this.defaultHeaders = options.defaultHeaders ?? defaultHeaders;
        const isLocalhost =
            this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1');
        this.debug = options.debug ?? isLocalhost;
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
        const method = options.method ?? 'GET';

        try {
            const headers = mergeHeaders(this.defaultHeaders, options.headers);
            const requestInit: RequestInit = {
                ...options,
                headers: headers,
            };

            // Avoid sending JSON content-type when there's no body (Fastify rejects empty JSON).
            if (requestInit.headers instanceof Headers) {
                if (!options.body) {
                    requestInit.headers.delete('Content-Type');
                }
                const isFormData =
                    typeof FormData !== 'undefined' && options.body instanceof FormData;
                if (isFormData) {
                    requestInit.headers.delete('Content-Type');
                }
            }

            if (this.debug) {
                logRequest(url, path, method, headers, options.body);
            }

            const response = await this.fetchImpl(url, requestInit);

            if (!response.ok) {
                const text = await safeReadText(response);
                const error = new HttpError(text || response.statusText, url, response.status, {
                    url,
                    method,
                });
                logHttpError(error, path, method, text, this.debug, options.body);
                throw error;
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
                method,
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

function logRequest(
    url: string,
    path: string,
    method: string,
    headers: HeadersInit,
    body: BodyInit | null | undefined
): void {
    // eslint-disable-next-line no-console
    console.debug('[api-client] request', {
        path,
        method,
        url,
        headers,
        body: body && typeof body !== 'string' ? '<non-string body>' : body,
        curl: buildCurl(url, method, headers, body),
    });
}

function logHttpError(
    error: HttpError,
    path: string,
    method: string,
    responseText: string,
    debug: boolean,
    body: BodyInit | null | undefined
): void {
    const payload =
        body && typeof body === 'string' && isJson(body) && debug ? JSON.parse(body) : undefined;
    // eslint-disable-next-line no-console
    console.error('[api-client] HTTP error', {
        path,
        method,
        status: error.status,
        message: error.message,
        response: debug ? responseText : undefined,
        requestBody: payload,
        curl: debug ? buildCurl(error.url, method, error.metadata?.headers ?? {}, body) : undefined,
    });
}

function buildCurl(
    url: string,
    method: string,
    headers: HeadersInit,
    body: BodyInit | null | undefined
): string {
    const headerPairs: string[] =
        headers instanceof Headers
            ? Array.from(headers.entries()).map(([k, v]) => `-H "${k}: ${v}"`)
            : Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`);

    const parts = [`curl -X ${method} "${url}"`, ...headerPairs];

    if (body && typeof body === 'string') {
        parts.push(`--data '${body.replace(/'/g, "'\\''")}'`);
    }

    return parts.join(' ');
}

function isJson(text: string): boolean {
    try {
        JSON.parse(text);
        return true;
    } catch {
        return false;
    }
}
