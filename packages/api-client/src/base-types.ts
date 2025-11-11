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
