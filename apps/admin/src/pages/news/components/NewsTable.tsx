import { useState } from 'react';
import { NewsArticleStatus } from '@daext/domain';
import type { NewsArticle, NewsFilters } from '../../../types/news';
import { ServiceNewsMock } from '../../../services/NewsService';
import ConfirmDialog from '../../../components/base/ConfirmDialog';

interface NewsTableProps {
    articles: NewsArticle[];
    filters: NewsFilters;
    loading: boolean;
    onEdit: (article: NewsArticle) => void;
    onView: (article: NewsArticle) => void;
    onRefresh: () => void;
    onShowToast: (message: string, type: 'success' | 'error') => void;
}

export default function NewsTable({
    articles,
    filters,
    loading,
    onEdit,
    onView,
    onRefresh,
    onShowToast,
}: NewsTableProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        article: NewsArticle | null;
    }>({
        isOpen: false,
        article: null,
    });

    const filteredArticles = articles.filter((article) => {
        const matchesSearch =
            filters.search === '' ||
            article.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            article.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()));

        const matchesStatus = filters.status === 'all' || article.status === filters.status;

        return matchesSearch && matchesStatus;
    });

    const statusConfig: Record<
        NewsArticleStatus,
        { label: string; icon: string; className: string }
    > = {
        [NewsArticleStatus.Draft]: {
            label: 'Rascunho',
            icon: 'ri-draft-line',
            className: 'bg-gray-100 text-gray-800',
        },
        [NewsArticleStatus.Scheduled]: {
            label: 'Agendado',
            icon: 'ri-time-line',
            className: 'bg-yellow-100 text-yellow-800',
        },
        [NewsArticleStatus.Published]: {
            label: 'Publicado',
            icon: 'ri-check-circle-line',
            className: 'bg-green-100 text-green-800',
        },
    };

    const getStatusBadge = (status: NewsArticleStatus) => {
        const config = statusConfig[status];
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
            >
                <i className={`${config.icon} mr-1`}></i>
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
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const handleDelete = async (article: NewsArticle) => {
        setDeleteDialog({ isOpen: true, article });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.article) return;

        try {
            await ServiceNewsMock.delete(deleteDialog.article.id);
            onShowToast('Notícia excluída com sucesso', 'success');
            onRefresh();
        } catch (error) {
            onShowToast('Falha ao excluir notícia', 'error');
        } finally {
            setDeleteDialog({ isOpen: false, article: null });
        }
    };

    const handleDuplicate = async (article: NewsArticle) => {
        try {
            await ServiceNewsMock.duplicate(article.id);
            onShowToast('Notícia duplicada com sucesso', 'success');
            onRefresh();
        } catch (error) {
            onShowToast('Falha ao duplicar notícia', 'error');
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                    <div className="animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 py-4">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Título
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tags
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Publicado em
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Atualizado em
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredArticles.map((article) => (
                                <tr
                                    key={article.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {article.title}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {article.summary}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(article.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {article.tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {article.tags.length > 3 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    +{article.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {article.publishedAt
                                            ? formatDate(article.publishedAt)
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(article.updatedAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onView(article)}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 cursor-pointer"
                                                title="Visualizar"
                                            >
                                                <i className="ri-eye-line text-sm"></i>
                                            </button>
                                            <button
                                                onClick={() => onEdit(article)}
                                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-150 cursor-pointer"
                                                title="Editar"
                                            >
                                                <i className="ri-edit-line text-sm"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDuplicate(article)}
                                                className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-150 cursor-pointer"
                                                title="Duplicar"
                                            >
                                                <i className="ri-file-copy-line text-sm"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
                                                title="Excluir"
                                            >
                                                <i className="ri-delete-bin-line text-sm"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredArticles.length === 0 && (
                    <div className="text-center py-12">
                        <i className="ri-article-line text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nenhuma notícia encontrada
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {filters.search || filters.status !== 'all'
                                ? 'Tente ajustar os filtros de busca'
                                : 'Comece criando sua primeira notícia'}
                        </p>
                        {!filters.search && filters.status === 'all' && (
                            <button
                                onClick={() => onEdit({} as NewsArticle)}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer"
                            >
                                Criar notícia
                            </button>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                title="Excluir notícia"
                message={`Tem certeza que deseja excluir "${deleteDialog.article?.title}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteDialog({ isOpen: false, article: null })}
            />
        </>
    );
}
