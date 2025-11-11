import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ResearchFiltersComponent from './components/ResearchFilters';
import ResearchTable from './components/ResearchTable';
import ResearchModal from './components/ResearchModal';
import ResearchViewModal from './components/ResearchViewModal';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import ToastContainer from '../../components/base/ToastContainer';
import {
    type ResearchProject,
    type ResearchFilters as ResearchFiltersType,
    ResearchProjectStatus,
    getResearchProjectStatusDisplayName,
} from '../../types/research';
import { researchService } from '../../services/ResearchService';
import { useToast } from '../../hooks/useToast';

export default function ResearchPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [projects, setProjects] = useState<ResearchProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filtros e paginação
    const [filters, setFilters] = useState<ResearchFiltersType>({
        search: '',
        area: 'all',
        status: 'all',
        startDateFrom: '',
        startDateTo: '',
        endDateFrom: '',
        endDateTo: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    // Modais
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);
    const [viewingProject, setViewingProject] = useState<ResearchProject | null>(null);

    // Confirmações
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [deletingProject, setDeletingProject] = useState<ResearchProject | null>(null);
    const [showStatusChangeConfirm, setShowStatusChangeConfirm] = useState(false);
    const [statusChangeData, setStatusChangeData] = useState<{
        project: ResearchProject;
        newStatus: ResearchProjectStatus;
    } | null>(null);

    const { addToast } = useToast();

    // Carregar dados
    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                search: filters.search || undefined,
                area: filters.area !== 'all' ? filters.area : undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
                startDateFrom: filters.startDateFrom || undefined,
                startDateTo: filters.startDateTo || undefined,
                endDateFrom: filters.endDateFrom || undefined,
                endDateTo: filters.endDateTo || undefined,
                page: currentPage,
                pageSize,
                sortBy: sortBy as any,
                sortDir,
            };

            const response = await researchService.getAll(params);
            setProjects(response.items);
            setTotalItems(response.total);
        } catch (err) {
            setError('Falha ao carregar projetos de pesquisa');
            addToast({ message: 'Erro ao carregar projetos', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage, pageSize, sortBy, sortDir, addToast]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'n':
                    if (!showModal && !showViewModal) {
                        handleNewProject();
                    }
                    break;
                case 'f':
                    if (!showModal && !showViewModal) {
                        const searchInput = document.querySelector(
                            'input[placeholder*="Buscar"]'
                        ) as HTMLInputElement;
                        searchInput?.focus();
                    }
                    break;
                case 'escape':
                    if (showModal) {
                        setShowModal(false);
                        setEditingProject(null);
                    } else if (showViewModal) {
                        setShowViewModal(false);
                        setViewingProject(null);
                    }
                    break;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && showModal) {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showModal, showViewModal]);

    // Handlers
    const handleNewProject = () => {
        setEditingProject(null);
        setShowModal(true);
    };

    const handleEditProject = (project: ResearchProject) => {
        setEditingProject(project);
        setShowModal(true);
    };

    const handleViewProject = (project: ResearchProject) => {
        setViewingProject(project);
        setShowViewModal(true);
    };

    const handleDuplicateProject = async (project: ResearchProject) => {
        try {
            await researchService.duplicate(project.id);
            addToast({ message: 'Projeto duplicado com sucesso', type: 'success' });
            loadProjects();
        } catch (error) {
            addToast({ message: 'Erro ao duplicar projeto', type: 'error' });
        }
    };

    const handleDeleteProject = (project: ResearchProject) => {
        setDeletingProject(project);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deletingProject) return;

        try {
            await researchService.delete(deletingProject.id);
            addToast({ message: 'Projeto excluído com sucesso', type: 'success' });
            setSelectedIds((prev) => prev.filter((id) => id !== deletingProject.id));
            loadProjects();
        } catch (error) {
            addToast({ message: 'Erro ao excluir projeto', type: 'error' });
        } finally {
            setShowDeleteConfirm(false);
            setDeletingProject(null);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        try {
            await researchService.deleteMultiple(selectedIds);
            addToast({
                message: `${selectedIds.length} projeto(s) excluído(s) com sucesso`,
                type: 'success',
            });
            setSelectedIds([]);
            loadProjects();
        } catch (error) {
            addToast({ message: 'Erro ao excluir projetos', type: 'error' });
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };

    const handleStatusChange = (project: ResearchProject, newStatus: ResearchProjectStatus) => {
        if (newStatus === ResearchProjectStatus.Completed && !project.finishedAt) {
            setStatusChangeData({ project, newStatus });
            setShowStatusChangeConfirm(true);
        } else {
            updateProjectStatus(project, newStatus);
        }
    };

    const updateProjectStatus = async (
        project: ResearchProject,
        newStatus: ResearchProjectStatus,
        finishedAt?: Date
    ) => {
        try {
            await researchService.updateStatus(project.id, newStatus, finishedAt);
            const label = getResearchProjectStatusDisplayName(newStatus);
            addToast({ message: `Status alterado para ${label}`, type: 'success' });
            loadProjects();
        } catch (error) {
            addToast({ message: 'Erro ao alterar status', type: 'error' });
        }
    };

    const confirmStatusChange = () => {
        if (!statusChangeData) return;

        const finishedAt =
            statusChangeData.newStatus === ResearchProjectStatus.Completed ? new Date() : undefined;
        updateProjectStatus(statusChangeData.project, statusChangeData.newStatus, finishedAt);
        setShowStatusChangeConfirm(false);
        setStatusChangeData(null);
    };

    const handleBulkStatusChange = async (newStatus: ResearchProjectStatus) => {
        if (selectedIds.length === 0) return;

        try {
            await researchService.updateMultipleStatus(selectedIds, newStatus);
            const label = getResearchProjectStatusDisplayName(newStatus);
            addToast({
                message: `${selectedIds.length} projeto(s) alterado(s) para ${label}`,
                type: 'success',
            });
            setSelectedIds([]);
            loadProjects();
        } catch (error) {
            addToast({ message: 'Erro ao alterar status dos projetos', type: 'error' });
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
        setCurrentPage(1);
    };

    const handleFiltersChange = (newFilters: ResearchFiltersType) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleModalSave = () => {
        loadProjects();
    };

    const handleRetry = () => {
        loadProjects();
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">
                        {/* Header da página */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Pesquisas
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Gerencie projetos de pesquisa acadêmica
                                </p>
                            </div>
                            <button
                                onClick={handleNewProject}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <i className="ri-add-line mr-2"></i>
                                Novo Projeto
                            </button>
                        </div>

                        {/* Banner de erro */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <i className="ri-error-warning-line text-red-400 mr-3"></i>
                                        <div>
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                                Erro ao carregar dados
                                            </h3>
                                            <p className="text-sm text-red-700 dark:text-red-400">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRetry}
                                        className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Filtros */}
                        <ResearchFiltersComponent
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                        />

                        {/* Ações em lote */}
                        {selectedIds.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {selectedIds.length} projeto(s) selecionado(s)
                                        </span>
                                        <div className="flex space-x-2">
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleBulkStatusChange(
                                                            e.target.value as ResearchProjectStatus
                                                        );
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Alterar status</option>
                                                <option value={ResearchProjectStatus.Active}>
                                                    Ativo
                                                </option>
                                                <option value={ResearchProjectStatus.Completed}>
                                                    Concluído
                                                </option>
                                                <option value={ResearchProjectStatus.Archived}>
                                                    Arquivado
                                                </option>
                                            </select>
                                            <button
                                                onClick={handleBulkDelete}
                                                className="px-3 py-1 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                                <i className="ri-delete-bin-line mr-1"></i>
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedIds([])}
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tabela */}
                        <ResearchTable
                            projects={projects}
                            loading={loading}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            onView={handleViewProject}
                            onEdit={handleEditProject}
                            onDuplicate={handleDuplicateProject}
                            onDelete={handleDeleteProject}
                            onStatusChange={handleStatusChange}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={handleSort}
                        />

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                                            {Math.min(currentPage * pageSize, totalItems)} de{' '}
                                            {totalItems} projetos
                                        </span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value={5}>5 por página</option>
                                            <option value={10}>10 por página</option>
                                            <option value={20}>20 por página</option>
                                            <option value={50}>50 por página</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                setCurrentPage(Math.max(1, currentPage - 1))
                                            }
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                                        >
                                            <i className="ri-arrow-left-line"></i>
                                        </button>

                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Página {currentPage} de {totalPages}
                                        </span>

                                        <button
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.min(totalPages, currentPage + 1)
                                                )
                                            }
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                                        >
                                            <i className="ri-arrow-right-line"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modais */}
            <ResearchModal
                project={editingProject}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingProject(null);
                }}
                onSave={handleModalSave}
            />

            <ResearchViewModal
                project={viewingProject}
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setViewingProject(null);
                }}
                onEdit={(project) => {
                    setShowViewModal(false);
                    setViewingProject(null);
                    handleEditProject(project);
                }}
            />

            {/* Confirmações */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Excluir Projeto"
                message={`Tem certeza que deseja excluir o projeto "${deletingProject?.title}"?`}
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setDeletingProject(null);
                }}
                type="danger"
            />

            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                title="Excluir Projetos"
                message={`Tem certeza que deseja excluir ${selectedIds.length} projeto(s) selecionado(s)?`}
                confirmText="Excluir Todos"
                cancelText="Cancelar"
                onConfirm={confirmBulkDelete}
                onCancel={() => setShowBulkDeleteConfirm(false)}
                type="danger"
            />

            <ConfirmDialog
                isOpen={showStatusChangeConfirm}
                title="Marcar como Concluído"
                message={`Deseja marcar o projeto "${statusChangeData?.project.title}" como concluído? A data de término será definida como hoje.`}
                confirmText="Confirmar"
                cancelText="Cancelar"
                onConfirm={confirmStatusChange}
                onCancel={() => {
                    setShowStatusChangeConfirm(false);
                    setStatusChangeData(null);
                }}
                type="info"
            />

            <ToastContainer />
        </div>
    );
}
