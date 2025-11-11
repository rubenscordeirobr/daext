import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import NewsFiltersComponent from './components/NewsFilters';
import NewsTable from './components/NewsTable';
import NewsModal from './components/NewsModal';
import NewsViewModal from './components/NewsViewModal';
import ToastContainer from '../../components/base/ToastContainer';
import type { NewsArticle, NewsFilters as NewsFiltersType } from '../../types/news';
import { ServiceNewsMock } from '../../services/NewsService';
import { useToast } from '../../hooks/useToast';

export default function News() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<NewsFiltersType>({
        search: '',
        status: 'all',
    });

    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        article: NewsArticle | null;
    }>({
        isOpen: false,
        article: null,
    });

    const [viewModal, setViewModal] = useState<{
        isOpen: boolean;
        article: NewsArticle | null;
    }>({
        isOpen: false,
        article: null,
    });

    const { toasts, removeToast, success, error: showError } = useToast();

    const loadArticles = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ServiceNewsMock.getAll();
            setArticles(data);
        } catch (err) {
            setError('Falha ao carregar notícias do ServiceNewsMock');
            showError('Falha ao carregar notícias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Só processar atalhos se não estiver em um modal
            if (!editModal.isOpen && !viewModal.isOpen) {
                if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleCreateNews();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editModal.isOpen, viewModal.isOpen]);

    const handleCreateNews = () => {
        setEditModal({
            isOpen: true,
            article: null,
        });
    };

    const handleEditNews = (article: NewsArticle) => {
        setEditModal({
            isOpen: true,
            article,
        });
    };

    const handleViewNews = (article: NewsArticle) => {
        setViewModal({
            isOpen: true,
            article,
        });
    };

    const handleCloseEditModal = () => {
        setEditModal({
            isOpen: false,
            article: null,
        });
    };

    const handleCloseViewModal = () => {
        setViewModal({
            isOpen: false,
            article: null,
        });
    };

    const handleSaveNews = () => {
        loadArticles();
    };

    const handleRetryLoad = () => {
        loadArticles();
    };

    const handleShowToast = (message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            success(message);
        } else {
            showError(message);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* News Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Notícias
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                    Gerencie todas as notícias do sistema
                                </p>
                            </div>
                            <button
                                onClick={handleCreateNews}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
                            >
                                <i className="ri-add-line"></i>
                                Nova Notícia
                            </button>
                        </div>

                        {/* Error Banner */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <i className="ri-error-warning-line text-red-600 dark:text-red-400 mr-3"></i>
                                        <span className="text-red-800 dark:text-red-300">
                                            {error}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleRetryLoad}
                                        className="bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <NewsFiltersComponent filters={filters} onFiltersChange={setFilters} />

                        {/* News Table */}
                        <NewsTable
                            articles={articles}
                            filters={filters}
                            loading={loading}
                            onEdit={handleEditNews}
                            onView={handleViewNews}
                            onRefresh={loadArticles}
                            onShowToast={handleShowToast}
                        />

                        {/* Keyboard Shortcuts Help */}
                        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>
                                Atalhos:{' '}
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                                    N
                                </kbd>{' '}
                                Nova notícia
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit/Create Modal */}
            <NewsModal
                isOpen={editModal.isOpen}
                article={editModal.article}
                onClose={handleCloseEditModal}
                onSave={handleSaveNews}
                onShowToast={handleShowToast}
            />

            {/* View Modal */}
            <NewsViewModal
                isOpen={viewModal.isOpen}
                article={viewModal.article}
                onClose={handleCloseViewModal}
                onEdit={handleEditNews}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
