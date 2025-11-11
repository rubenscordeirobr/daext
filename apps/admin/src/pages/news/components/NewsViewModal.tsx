import { useEffect, useRef } from 'react';
import { NewsArticleStatus } from '@daext/domain';
import type { NewsArticle } from '../../../types/news';

interface NewsViewModalProps {
    isOpen: boolean;
    article: NewsArticle | null;
    onClose: () => void;
    onEdit: (article: NewsArticle) => void;
}

export default function NewsViewModal({ isOpen, article, onClose, onEdit }: NewsViewModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !article) return null;

    const statusConfig: Record<
        NewsArticleStatus,
        { label: string; icon: string; className: string }
    > = {
        [NewsArticleStatus.Draft]: {
            label: 'Rascunho',
            icon: 'ri-draft-line',
            className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
        },
        [NewsArticleStatus.Scheduled]: {
            label: 'Agendado',
            icon: 'ri-time-line',
            className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        },
        [NewsArticleStatus.Published]: {
            label: 'Publicado',
            icon: 'ri-check-circle-line',
            className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        },
    };

    const getStatusBadge = (status: NewsArticleStatus) => {
        const config = statusConfig[status];
        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
            >
                <i className={`${config.icon} mr-2`}></i>
                {config.label}
            </span>
        );
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) {
            return '-';
        }

        const date = new Date(isoString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getReadingTime = () => {
        const text = article.body.replace(/<[^>]*>/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        const wordsPerMinute = 200;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div
                    ref={modalRef}
                    className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                >
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    Visualizar Notícia
                                </h3>
                                {getStatusBadge(article.status)}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(article)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                                    title="Editar notícia"
                                >
                                    <i className="ri-edit-line"></i>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800">
                        <article className="p-6">
                            {/* Article Header */}
                            <header className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {article.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <div className="flex items-center gap-2">
                                        <i className="ri-user-line"></i>
                                        <span>Por {article.author ?? 'Equipe DAEXT'}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <i className="ri-time-line"></i>
                                        <span>{getReadingTime()} min de leitura</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <i className="ri-calendar-line"></i>
                                        <span>
                                            {article.publishedAt
                                                ? `Publicado em ${formatDate(article.publishedAt)}`
                                                : `Criado em ${formatDate(article.createdAt)}`}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                    {article.summary}
                                </p>

                                {article.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                            >
                                                <i className="ri-price-tag-3-line mr-1"></i>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </header>

                            {/* Article Body */}
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <div
                                    className="article-content text-gray-900 dark:text-gray-100"
                                    dangerouslySetInnerHTML={{ __html: article.body }}
                                />
                            </div>

                            {/* Article Footer */}
                            <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <div>
                                        <p>
                                            Slug:{' '}
                                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-300">
                                                {article.slug}
                                            </code>
                                        </p>
                                    </div>
                                    <div>
                                        <p>Última atualização: {formatDate(article.updatedAt)}</p>
                                    </div>
                                </div>
                            </footer>
                        </article>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                    Esc
                                </kbd>{' '}
                                Fechar
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 whitespace-nowrap cursor-pointer"
                                >
                                    Fechar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onEdit(article)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 whitespace-nowrap cursor-pointer"
                                >
                                    Editar Notícia
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
