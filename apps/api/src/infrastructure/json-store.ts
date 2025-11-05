import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export class JsonStore<T extends { id: string }> {
    constructor(private readonly fileUrl: URL) {}

    async readAll(): Promise<T[]> {
        try {
            const buffer = await readFile(this.filePath, 'utf8');
            if (!buffer.trim()) return [];
            return JSON.parse(buffer) as T[];
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async writeAll(data: T[]): Promise<void> {
        await mkdir(dirname(this.filePath), { recursive: true });
        const serialized = JSON.stringify(data, null, 2);
        await writeFile(this.filePath, serialized, 'utf8');
    }

    private get filePath(): string {
        return fileURLToPath(this.fileUrl);
    }
}
