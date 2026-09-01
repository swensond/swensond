import { writable } from "svelte/store";

export interface ArtisanRequest {
    title: string;
    resolve: (value: number | null | undefined) => void;
}

export const artisanRequest = writable<ArtisanRequest | null>(null);

export function requestArtisan(title: string): Promise<number | null> {
    return new Promise((resolve) => {
        artisanRequest.set({
            title,
            resolve: (value) => {
                artisanRequest.set(null);
                resolve(value);
            },
        });
    });
}
