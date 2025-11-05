import Fastify from 'fastify';

import type { NewsArticle } from '@daext/domain';
import type { Professor } from '@daext/domain';
import type { ResearchProject } from '@daext/domain';

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

const fastify = Fastify({
    logger: true,
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

fastify.get('/health', () => {
    return { status: 'ok' };
});

registerNewsRoutes(fastify, { service: newsService });
registerProfessorsRoutes(fastify, { service: professorsService });
registerResearchRoutes(fastify, { service: researchService });

const port = Number(process.env.PORT ?? 4000);

async function start() {
    try {
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`API ready on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

void start();
