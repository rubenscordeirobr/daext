import Fastify from 'fastify';
import cors from '@fastify/cors';

import type {
    AuthUser,
    PasswordResetRequest,
    NewsArticle,
    Professor,
    ResearchProject,
} from '@daext/domain';

import { JsonStore } from './infrastructure/json-store.js';
import { JsonNewsRepository } from './modules/news/json-news.repository.js';
import { registerNewsRoutes } from './modules/news/news.routes.js';
import { NewsService } from './modules/news/news.service.js';
import { JsonProfessorsRepository } from './modules/professors/json-professors.repository.js';
import { registerProfessorsRoutes } from './modules/professors/professors.routes.js';
import { ProfessorsService } from './modules/professors/professors.service.js';
import { JsonResearchRepository } from './modules/research/json-research.repository.js';
import { registerResearchRoutes } from './modules/research/research.routes.js';
import { ResearchService } from './modules/research/research.service.js';
import { JsonAuthRepository } from './modules/auth/auth.repository.js';
import { AuthService } from './modules/auth/auth.service.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';

const fastify = Fastify({
    logger: true,
});

// Register CORS to allow requests from the web dev server during development.
// Adjust the allowed origins as needed for production.
fastify.register(cors, {
    origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow: boolean) => void
    ) => {
        // Allow requests with no origin (e.g., curl, server-to-server)
        if (!origin) return callback(null, true);

        // Allow localhost and 127.0.0.1 on any port during development
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
            callback(null, true);
        else callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

const newsStore = new JsonStore<NewsArticle>(new URL('../data/news/news.json', import.meta.url));
const professorsStore = new JsonStore<Professor>(
    new URL('../data/professors/professors.json', import.meta.url)
);
const researchStore = new JsonStore<ResearchProject>(
    new URL('../data/research/research.json', import.meta.url)
);

const newsService = new NewsService(new JsonNewsRepository(newsStore));
const professorsService = new ProfessorsService(new JsonProfessorsRepository(professorsStore));
const researchService = new ResearchService(new JsonResearchRepository(researchStore));
const authUsersStore = new JsonStore<AuthUser>(new URL('../data/auth/users.json', import.meta.url));
const authResetStore = new JsonStore<PasswordResetRequest>(
    new URL('../data/auth/reset-codes.json', import.meta.url)
);
const authRepository = new JsonAuthRepository(authUsersStore, authResetStore);
const authService = new AuthService(authRepository);

fastify.get('/health', () => {
    return { status: 'ok' };
});

await authService.initialize();

registerNewsRoutes(fastify, { service: newsService });
registerProfessorsRoutes(fastify, { service: professorsService });
registerResearchRoutes(fastify, { service: researchService });
registerAuthRoutes(fastify, { service: authService });

//get all request that was not matched by any route

const port = Number(process.env.PORT ?? 4000);

async function start() {
    try {
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`API ready on http://localhost:${port}`);
    } catch (err) {
        debugger;
        fastify.log.error(err);
        process.exit(1);
    }
}

void start();
