import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';

import {
    AcademicArea,
    createProfessor,
    professorProfilePatchSchema,
    professorProfileSchema,
    professorSchema,
    type Professor,
    type ProfessorProfileDraft,
} from '@daext/domain';

import { HttpError } from '../src/base-types.js';
import { ProfessorsClient } from '../src/professors-client.js';

class ProfessorsTestServer {
    private server?: Server;
    private readonly store = new Map<string, Professor>();

    constructor() {
        const seeded = createProfessor({
            id: 'prof-seed',
            fullName: 'Seed Professor',
            academicTitle: 'Mestre',
            area: AcademicArea.Math,
            specialization: 'Algebra',
            researchAreas: ['Algebra'],
            bio: 'Teaches algebra and calculus.',
            avatarUrl: '/assets/images/no-image-available.png',
        });
        this.store.set(seeded.id, seeded);
    }

    async start(): Promise<string> {
        this.server = createServer((req, res) => {
            void this.route(req, res);
        });

        await new Promise<void>((resolve) => {
            this.server?.listen(0, '127.0.0.1', () => resolve());
        });

        const address = this.server!.address() as AddressInfo;
        return `http://${address.address}:${address.port}`;
    }

    async stop(): Promise<void> {
        if (!this.server) return;
        await new Promise<void>((resolve, reject) => {
            this.server?.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private async route(req: IncomingMessage, res: ServerResponse<IncomingMessage>): Promise<void> {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const match = url.pathname.match(/^\/professors\/?(.*)$/);

        if (req.method === 'GET' && url.pathname === '/professors') {
            return this.sendJson(res, 200, Array.from(this.store.values()));
        }

        if (req.method === 'POST' && url.pathname === '/professors') {
            return this.handleCreate(req, res);
        }

        if (match && match[1]) {
            const id = decodeURIComponent(match[1]);
            const [profId, action] = id.split('/');

            if (req.method === 'POST' && action === 'avatar') {
                const existing = this.store.get(profId);
                if (!existing) {
                    return this.sendJson(res, 404, { message: 'Professor not found.' });
                }
                const updated = {
                    ...existing,
                    avatarUrl: `/assets/professors/${profId}/avatar.webp`,
                    updatedAt: new Date().toISOString(),
                };
                this.store.set(profId, updated);
                return this.sendJson(res, 200, updated);
            }

            if (req.method === 'GET') {
                if (id === 'invalid-payload') {
                    return this.sendJson(res, 200, { id: 'invalid-payload', fullName: 'Only id' });
                }
                const existing = this.store.get(profId);
                if (!existing) {
                    return this.sendJson(res, 404, { message: 'Professor not found.' });
                }
                return this.sendJson(res, 200, existing);
            }

            if (req.method === 'PATCH') {
                return this.handlePatch(req, res, profId);
            }

            if (req.method === 'DELETE') {
                this.store.delete(profId);
                res.statusCode = 204;
                res.end();
                return;
            }
        }

        this.sendJson(res, 404, { message: 'Not found' });
    }

    private async handleCreate(
        req: IncomingMessage,
        res: ServerResponse<IncomingMessage>
    ): Promise<void> {
        try {
            const body = professorProfileSchema.parse(await readJson(req));
            const created = createProfessor({
                ...body,
                id: `prof-${this.store.size + 1}`,
            });
            this.store.set(created.id, created);
            this.sendJson(res, 201, created);
        } catch (error: unknown) {
            this.sendBadRequest(res, error);
        }
    }

    private async handlePatch(
        req: IncomingMessage,
        res: ServerResponse<IncomingMessage>,
        id: string
    ): Promise<void> {
        try {
            const existing = this.store.get(id);
            if (!existing) {
                return this.sendJson(res, 404, { message: 'Professor not found.' });
            }

            const patch = professorProfilePatchSchema.parse(await readJson(req));
            const updated = professorSchema.parse({
                ...existing,
                ...patch,
                researchAreas: patch.researchAreas ?? existing.researchAreas,
                updatedAt: new Date().toISOString(),
            });
            this.store.set(updated.id, updated);
            this.sendJson(res, 200, updated);
        } catch (error: unknown) {
            this.sendBadRequest(res, error);
        }
    }

    private sendBadRequest(res: ServerResponse<IncomingMessage>, error: unknown): void {
        if (error && typeof error === 'object' && 'issues' in (error as Record<string, unknown>)) {
            this.sendJson(res, 400, { message: 'Validation failed.' });
            return;
        }

        this.sendJson(res, 400, { message: 'Unexpected error.' });
    }

    private sendJson(res: ServerResponse<IncomingMessage>, status: number, data: unknown): void {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    }
}

async function readJson(req: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf-8');
                resolve(raw ? JSON.parse(raw) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

describe('ProfessorsClient (integration)', () => {
    let server: ProfessorsTestServer;
    let baseUrl: string;
    let client: ProfessorsClient;

    before(async () => {
        server = new ProfessorsTestServer();
        baseUrl = await server.start();
        client = new ProfessorsClient({ baseUrl });
    });

    after(async () => {
        await server.stop();
    });

    it('creates and retrieves professors using shared schemas', async () => {
        const payload: ProfessorProfileDraft = {
            fullName: 'Jane Proof',
            academicTitle: 'Doutora',
            area: AcademicArea.Physics,
            specialization: 'Quantum Mechanics',
            researchAreas: ['Quantum Field Theory'],
            bio: 'Researches foundational questions in physics.',
            email: 'jane@example.com',
        };

        const created = await client.create(payload);
        assert.ok(created.id.startsWith('prof-'));
        assert.equal(created.fullName, payload.fullName);

        const fetched = await client.getById(created.id);
        assert.equal(fetched.id, created.id);
        assert.equal(fetched.fullName, payload.fullName);

        const list = await client.list();
        assert.ok(list.some((prof) => prof.id === created.id));
    });

    it('updates and deletes a professor end-to-end', async () => {
        const payload: ProfessorProfileDraft = {
            fullName: 'Delete Me',
            academicTitle: 'Mestre',
            area: AcademicArea.Chemistry,
            specialization: 'Optics',
            researchAreas: ['Optics'],
            bio: 'Temporary professor used for deletion test.',
        };

        const created = await client.create(payload);
        const updated = await client.update(created.id, {
            fullName: 'Updated Delete Me',
            researchAreas: ['Optics', 'Photonics'],
        });

        assert.equal(updated.fullName, 'Updated Delete Me');
        assert.deepEqual(updated.researchAreas, ['Optics', 'Photonics']);

        await client.delete(created.id);

        await assert.rejects(client.getById(created.id), (error) => {
            return error instanceof HttpError && error.status === 404;
        });
    });

    it('uploads an avatar and returns updated professor', async () => {
        const payload: ProfessorProfileDraft = {
            fullName: 'Avatar User',
            academicTitle: 'Mestre',
            area: AcademicArea.Math,
            specialization: 'Algebra',
            researchAreas: ['Algebra'],
            bio: 'Testing avatar upload.',
        };

        const created = await client.create(payload);
        const blob = new Blob(['avatar-bytes'], { type: 'image/png' });

        const updated = await client.uploadAvatar(created.id, blob);
        assert.equal(updated.avatarUrl, `/assets/professors/${created.id}/avatar.webp`);
    });

    it('rejects invalid payloads before sending requests', async () => {
        let called = false;
        const fetchImpl: typeof fetch = async () => {
            called = true;
            return new Response('{}', { status: 500 });
        };

        const strictClient = new ProfessorsClient({
            baseUrl,
            fetchImpl,
        });

        const rejected = strictClient.create({
            fullName: 'No',
            academicTitle: '',
            area: AcademicArea.Chemistry,
            specialization: '',
            researchAreas: [],
            bio: 'short',
        } as unknown as ProfessorProfileDraft);

        await assert.rejects(rejected);
        assert.equal(called, false);
    });

    it('fails fast when server responses drift from the schema', async () => {
        await assert.rejects(() => client.getById('invalid-payload'));
    });
});
