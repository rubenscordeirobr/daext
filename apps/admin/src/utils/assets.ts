import type { ReactEventHandler, SyntheticEvent } from 'react';

const apiBase =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
    (typeof window !== 'undefined' && window.__DAEXT_API_URL__) ||
    'http://localhost:4000';

function stripTrailingSlash(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

const normalizedApiBase = stripTrailingSlash(apiBase);

export function resolveAssetUrl(path: string | undefined | null, fallback?: string): string {
    if (!path) return fallback ?? '';

    if (/^https?:\/\//i.test(path)) return path;
    const cleaned = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedApiBase}${cleaned}`;
}

export function resolverErrorImage(e: SyntheticEvent<HTMLImageElement>): void {
    const imgElement = e.target as HTMLImageElement;
    console.error(`Failed to load image: ${imgElement.src}`);
    imgElement.onerror = null; // Prevent infinite loop if fallback also fails
    imgElement.src = '/assets/images/no-image-available.png';
}
