import { useEffect, useMemo, useState } from 'react';
import { newsClient } from '@daext/api-client';
import { NewsCategory, NewsCategoryList, type NewsArticle } from '@daext/domain';

import { getAssetPath } from '../../../utils/assetPath';

const categories = NewsCategoryList;

const FALLBACK_IMAGE = getAssetPath('assets/images/no-image-avalaible.png');

const NewsContent = () => {
    const [activeCategory, setActiveCategory] = useState<NewsCategory>(NewsCategory.All);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

    const handleSetActiveCategory = (category: NewsCategory) => {
        setActiveCategory(category);
    };
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
        if (activeCategory === NewsCategory.All) {
            return news;
        }
        return news.filter((article) => extractCategory(article) === activeCategory);
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
                    {categories.map((category) => {
                        if (!category) {
                            return null;
                        }

                        return (
                            <button
                                key={category.id}
                                onClick={() => handleSetActiveCategory(category.id)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                                    activeCategory === category.id
                                        ? 'bg-[#ffbf00] text-black shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <i className={category.icon}></i>
                                </div>
                                <span>{category.displayName}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((article) => {
                        const category = extractCategory(article);
                        const info = categories.find((cat) => cat.id === category);

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
                                    {info ? (
                                        <div className="absolute top-4 left-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${info.color}`}
                                            >
                                                {info.displayName}
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

function extractCategory(article: NewsArticle): NewsCategory | null {
    const category = article.tags.find((tag) => tag in NewsCategory);
    if (!category) {
        return null;
    }
    return category as NewsCategory;
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
    const category = extractCategory(article);
    if (!category) return null;
    const info = categories.find((cat) => cat.id === category);
    if (!info) return null;
    return (
        <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>
                {info.displayName}
            </span>
        </div>
    );
}

export default NewsContent;
