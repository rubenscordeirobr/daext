import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ProfessorFiltersComponent from './components/ProfessorFilters';
import ProfessorTable from './components/ProfessorTable';
import ProfessorModal from './components/ProfessorModal';
import ProfessorViewModal from './components/ProfessorViewModal';
import ToastContainer from '../../components/base/ToastContainer';
import type {
    Professor,
    ProfessorFilters as ProfessorFiltersType,
    ProfessorListParams,
} from '../../types/professor';
import { professorsService as ServiceProfessors } from '../../services/ProfessorsService';
import { useToast } from '../../hooks/useToast';

export default function Professors() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [filters, setFilters] = useState<ProfessorFiltersType>({
        search: '',
        area: 'all',
    });

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    });

    const [sorting, setSorting] = useState({
        sortBy: 'updatedAt' as 'updatedAt' | 'fullName',
        sortDir: 'desc' as 'asc' | 'desc',
    });

    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        professor: Professor | null;
    }>({
        isOpen: false,
        professor: null,
    });

    const [viewModal, setViewModal] = useState<{
        isOpen: boolean;
        professor: Professor | null;
    }>({
        isOpen: false,
        professor: null,
    });

    const { toasts, removeToast, success, error: showError } = useToast();

    const loadProfessors = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: ProfessorListParams = {
                search: filters.search || undefined,
                area: filters.area !== 'all' ? filters.area : undefined,
                page: pagination.page,
                pageSize: pagination.pageSize,
                sortBy: sorting.sortBy,
                sortDir: sorting.sortDir,
            };

            const response = await ServiceProfessors.getAll(params);
            setProfessors(response.items);
            setPagination((prev) => ({ ...prev, total: response.total }));
        } catch (err) {
            setError('Falha ao carregar professores do ServiceProfessors');
            showError('Falha ao carregar professores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfessors();
    }, [filters, pagination.page, pagination.pageSize, sorting]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Só processar atalhos se não estiver em um modal
            if (!editModal.isOpen && !viewModal.isOpen) {
                if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleCreateProfessor();
                } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    const searchInput = document.getElementById('search');
                    searchInput?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editModal.isOpen, viewModal.isOpen]);

    const handleCreateProfessor = () => {
        setEditModal({
            isOpen: true,
            professor: null,
        });
    };

    const handleEditProfessor = (professor: Professor) => {
        setEditModal({
            isOpen: true,
            professor,
        });
    };

    const handleViewProfessor = (professor: Professor) => {
        setViewModal({
            isOpen: true,
            professor,
        });
    };

    const handleCloseEditModal = () => {
        setEditModal({
            isOpen: false,
            professor: null,
        });
    };

    const handleCloseViewModal = () => {
        setViewModal({
            isOpen: false,
            professor: null,
        });
    };

    const handleSaveProfessor = () => {
        loadProfessors();
        setSelectedIds([]);
    };

    const handleRetryLoad = () => {
        loadProfessors();
    };

    const handleShowToast = (message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            success(message);
        } else {
            showError(message);
        }
    };

    const handleFiltersChange = (newFilters: ProfessorFiltersType) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset para primeira página
    };

    const handleSortChange = (sortBy: 'updatedAt' | 'fullName', sortDir: 'asc' | 'desc') => {
        setSorting({ sortBy, sortDir });
    };

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
    };

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Professors Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Professores
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                    Gerencie todos os professores do sistema
                                </p>
                            </div>
                            <button
                                onClick={handleCreateProfessor}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
                            >
                                <i className="ri-add-line"></i>
                                Novo Professor
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
                        <ProfessorFiltersComponent
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                        />

                        {/* Professors Table */}
                        <ProfessorTable
                            professors={professors}
                            filters={filters}
                            loading={loading}
                            selectedIds={selectedIds}
                            sortBy={sorting.sortBy}
                            sortDir={sorting.sortDir}
                            onEdit={handleEditProfessor}
                            onView={handleViewProfessor}
                            onRefresh={loadProfessors}
                            onShowToast={handleShowToast}
                            onSelectionChange={setSelectedIds}
                            onSortChange={handleSortChange}
                        />

                        {/* Pagination */}
                        {!loading && professors.length > 0 && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
                                    {Math.min(
                                        pagination.page * pagination.pageSize,
                                        pagination.total
                                    )}{' '}
                                    de {pagination.total} professores
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={pagination.pageSize}
                                        onChange={(e) =>
                                            handlePageSizeChange(Number(e.target.value))
                                        }
                                        className="pr-8 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
                                    >
                                        <option value={5}>5 por página</option>
                                        <option value={10}>10 por página</option>
                                        <option value={20}>20 por página</option>
                                        <option value={50}>50 por página</option>
                                    </select>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="ri-arrow-left-s-line"></i>
                                        </button>

                                        <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                                            {pagination.page} de {totalPages}
                                        </span>

                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= totalPages}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="ri-arrow-right-s-line"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Keyboard Shortcuts Help */}
                        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>
                                Atalhos:{' '}
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                                    N
                                </kbd>{' '}
                                Novo professor{' '}
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                                    F
                                </kbd>{' '}
                                Focar busca
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit/Create Modal */}
            <ProfessorModal
                isOpen={editModal.isOpen}
                professor={editModal.professor}
                onClose={handleCloseEditModal}
                onSave={handleSaveProfessor}
                onShowToast={handleShowToast}
            />

            {/* View Modal */}
            <ProfessorViewModal
                isOpen={viewModal.isOpen}
                professor={viewModal.professor}
                onClose={handleCloseViewModal}
                onEdit={handleEditProfessor}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
