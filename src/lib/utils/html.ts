/** Allows a media object to carry a client-sanitized description. */
export interface WithSafeDescription {
    description: string | null;
    descriptionHtml?: string;
}

interface Purifier {
    sanitize(source: string, config?: Record<string, unknown>): string;
}

let purifier: Promise<Purifier> | null = null;

/** Lazily load DOMPurify once. Never touches the DOM during SSR/prerender. */
function loadPurifier(): Promise<Purifier> {
    if (!purifier) {
        purifier = import('dompurify').then((m) => m.default as unknown as Purifier);
    }
    return purifier;
}

/**
 * AniList summaries arrive as a mix of text and HTML (e.g. `<br>`, `<b>`,
 * `<a href>`). Sanitize them with DOMPurify so we can safely render with
 * `{@html}` without being exposed to XSS.
 */
export async function safeDescriptions<T extends WithSafeDescription>(list: T[]): Promise<T[]> {
    if (typeof window === 'undefined') return list;

    const DOMPurify = await loadPurifier();
    return list.map((m) => ({
        ...m,
        descriptionHtml: DOMPurify.sanitize(m.description ?? '', {
            USE_PROFILES: { html: true },
        }),
    }));
}