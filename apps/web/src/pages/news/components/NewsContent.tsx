import { useEffect, useMemo, useState } from 'react';

import { NewsClient } from '@daext/api-client';
import type { NewsArticle } from '@daext/domain';

import { getAssetPath } from '../../../utils/assetPath';

const newsClient = new NewsClient({
    baseUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000',
});

const CATEGORY_META = {
    todas: { label: 'Todas', icon: 'ri-news-line', color: 'bg-white text-gray-700' },
    defesas: {
        label: 'Defesas',
        icon: 'ri-graduation-cap-line',
        color: 'bg-blue-100 text-blue-800',
    },
    publicacoes: {
        label: 'Publicações',
        icon: 'ri-book-line',
        color: 'bg-green-100 text-green-800',
    },
    eventos: {
        label: 'Eventos',
        icon: 'ri-calendar-event-line',
        color: 'bg-purple-100 text-purple-800',
    },
    extensao: {
        label: 'Extensão',
        icon: 'ri-community-line',
        color: 'bg-orange-100 text-orange-800',
    },
    reconhecimentos: {
        label: 'Reconhecimentos',
        icon: 'ri-award-line',
        color: 'bg-yellow-100 text-yellow-800',
    },
};

const CATEGORY_ORDER = [
    'todas',
    'defesas',
    'publicacoes',
    'eventos',
    'extensao',
    'reconhecimentos',
] as const;

type FilterKey = (typeof CATEGORY_ORDER)[number];
type CategoryKey = Exclude<FilterKey, 'todas'>;

const FALLBACK_IMAGE = getAssetPath('assets/images/no-image-avalaible.png');

const NewsContent = () => {
    const [activeCategory, setActiveCategory] = useState<FilterKey>('todas');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const response = await newsClient.list();
                setNews(response);
            } catch (err) {
                console.error('Erro ao carregar dados das notícias:', err);
                setError('Não foi possível carregar as notícias. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        void loadNews();
    }, []);

    const items = useMemo(() => {
        if (activeCategory === 'todas') {
            return news;
        }

        const categoryKey = activeCategory as CategoryKey;
        return news.filter((article) => extractCategory(article) === categoryKey);
    }, [activeCategory, news]);

    if (loading) {
        return (
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#ffbf00] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <i className="ri-news-line text-white text-2xl"></i>
                            </div>
                            <p className="text-[#8d9199] text-lg">Carregando notícias...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#8d9199]">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                        Notícias e Eventos
                    </h1>
                    <p className="text-lg text-[#8d9199] max-w-3xl mx-auto leading-relaxed">
                        Acompanhe as principais atividades, conquistas e eventos do Departamento
                        Acadêmico de Exatas. Fique por dentro das novidades em ensino, pesquisa e
                        extensão.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {CATEGORY_ORDER.map((categoryKey) => {
                        const category = CATEGORY_META[categoryKey];
                        if (!category) {
                            return null;
                        }

                        return (
                            <button
                                key={categoryKey}
                                onClick={() => setActiveCategory(categoryKey)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                                    activeCategory === categoryKey
                                        ? 'bg-[#ffbf00] text-black shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <i className={category.icon}></i>
                                </div>
                                <span>{category.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((article) => {
                        const categoryKey = extractCategory(article);
                        const meta = (categoryKey && CATEGORY_META[categoryKey]) || null;
                        const imageUrl = extractCoverImage(article);
                        const formattedDate = formatDate(article.publishedAt);

                        return (
                            <article
                                key={article.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
                                onClick={() => setSelectedNews(article)}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    {meta ? (
                                        <div className="absolute top-4 left-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${meta.color}`}
                                            >
                                                {meta.label}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center text-sm text-[#8d9199] mb-3">
                                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                                            <i className="ri-calendar-line"></i>
                                        </div>
                                        <span>{formattedDate}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-black mb-3 leading-tight group-hover:text-[#ffbf00] transition-colors">
                                        {article.title}
                                    </h3>

                                    <p className="text-[#8d9199] text-sm leading-relaxed mb-4">
                                        {article.summary}
                                    </p>

                                    <div className="flex items-center text-[#ffbf00] font-medium text-sm group-hover:text-[#e6ac00] transition-colors">
                                        <span>Leia mais</span>
                                        <div className="w-4 h-4 flex items-center justify-center ml-2 group-hover:translate-x-1 transition-transform">
                                            <i className="ri-arrow-right-line"></i>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-news-line text-gray-400 text-2xl"></i>
                        </div>
                        <p className="text-[#8d9199] text-lg">
                            Nenhuma notícia encontrada para esta categoria.
                        </p>
                    </div>
                ) : null}

                {selectedNews ? (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="relative flex-shrink-0">
                                <img
                                    src={extractCoverImage(selectedNews)}
                                    alt={selectedNews.title}
                                    className="w-full h-64 object-cover"
                                />
                                <button
                                    onClick={() => setSelectedNews(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                                    aria-label="Fechar detalhes da notícia"
                                >
                                    <i className="ri-close-line text-xl"></i>
                                </button>
                                <SelectedCategoryTag article={selectedNews} />
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="flex items-center text-sm text-[#8d9199] mb-4">
                                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                                        <i className="ri-calendar-line"></i>
                                    </div>
                                    <span>{formatDate(selectedNews.publishedAt)}</span>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-black mb-6 leading-tight">
                                    {selectedNews.title}
                                </h2>

                                <div className="prose prose-lg max-w-none">
                                    <div className="text-[#8d9199] leading-relaxed text-base space-y-4">
                                        {selectedNews.body
                                            .split(/\n+/)
                                            .map((paragraph) => paragraph.trim())
                                            .filter(Boolean)
                                            .map((paragraph, index) => (
                                                <p key={index} className="mb-4">
                                                    {paragraph}
                                                </p>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

function extractCategory(article: NewsArticle): CategoryKey | null {
    const category = article.tags.find((tag) => tag in CATEGORY_META);
    if (!category) {
        return null;
    }
    return category as CategoryKey;
}

function extractCoverImage(article: NewsArticle): string {
    const imageTag = article.tags.find(
        (tag) => tag.startsWith('assets/') || tag.startsWith('/assets/')
    );
    if (imageTag) {
        return getAssetPath(imageTag);
    }
    return FALLBACK_IMAGE;
}

function formatDate(value: string | null): string {
    if (!value) return 'Sem data';
    const date = new Date(value);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function SelectedCategoryTag({ article }: { article: NewsArticle }) {
    const categoryKey = extractCategory(article);
    if (!categoryKey) return null;
    const meta = CATEGORY_META[categoryKey];
    if (!meta) return null;
    return (
        <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                {meta.label}
            </span>
        </div>
    );
}

export default NewsContent;
