import { useState } from 'react';
import type { ResearchProject } from '../../../types/research';
import {
    ResearchProjectStatus,
    ResearchProjectStatusData,
    ResearchProjectStatusList,
    getResearchProjectStatusColor,
} from '../../../types/research';
import {
    AcademicArea as AcademicAreaValue,
    getAreaDisplayName,
    type AcademicArea,
} from '../../../types/professor';

interface ResearchTableProps {
    projects: ResearchProject[];
    loading: boolean;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onView: (project: ResearchProject) => void;
    onEdit: (project: ResearchProject) => void;
    onDuplicate: (project: ResearchProject) => void;
    onDelete: (project: ResearchProject) => void;
    onStatusChange: (project: ResearchProject, status: ResearchProjectStatus) => void;
    sortBy: string;
    sortDir: string;
    onSort: (field: string) => void;
}

export default function ResearchTable({
    projects,
    loading,
    selectedIds,
    onSelectionChange,
    onView,
    onEdit,
    onDuplicate,
    onDelete,
    onStatusChange,
    sortBy,
    sortDir,
    onSort,
}: ResearchTableProps) {
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(projects.map((p) => p.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
        }
    };

    const getStatusBadge = (status: ResearchProjectStatus) => {
        const info = ResearchProjectStatusData[status];
        const colorClass = getResearchProjectStatusColor(status);
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${colorClass}`}
            >
                {info.displayName}
            </span>
        );
    };

    const getAreaBadge = (area: AcademicArea) => {
        const badges = {
            [AcademicAreaValue.Math]: 'bg-purple-100 text-purple-700 border-purple-200',
            [AcademicAreaValue.Physics]: 'bg-blue-100 text-blue-700 border-blue-200',
            [AcademicAreaValue.Chemistry]: 'bg-green-100 text-green-700 border-green-200',
        } as const;

        const badgeClass =
            badges[area as keyof typeof badges] ?? 'bg-gray-100 text-gray-700 border-gray-200';

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
            >
                {getAreaDisplayName(area)}
            </span>
        );
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return 'ri-arrow-up-down-line text-gray-400';
        return sortDir === 'asc'
            ? 'ri-arrow-up-line text-primary-600'
            : 'ri-arrow-down-line text-primary-600';
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                </div>
                                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <i className="ri-flask-line text-2xl text-gray-400 dark:text-gray-500"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum projeto encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Não há projetos de pesquisa que correspondam aos filtros aplicados.
                </p>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-add-line mr-2"></i>
                    Novo Projeto
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedIds.length === projects.length &&
                                        projects.length > 0
                                    }
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-700"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Imagem
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => onSort('title')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Título</span>
                                    <i className={getSortIcon('title')}></i>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Área
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Supervisor
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => onSort('startedAt')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Iniciado em</span>
                                    <i className={getSortIcon('startedAt')}></i>
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => onSort('finishedAt')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Finalizado em</span>
                                    <i className={getSortIcon('finishedAt')}></i>
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => onSort('updatedAt')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Atualizado em</span>
                                    <i className={getSortIcon('updatedAt')}></i>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {projects.map((project) => (
                            <tr
                                key={project.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(project.id)}
                                        onChange={(e) =>
                                            handleSelectItem(project.id, e.target.checked)
                                        }
                                        className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-700"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-16 h-12 object-cover rounded-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src =
                                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEwyOCAyMEwzNiAyOEw0MCAyNEw0NCAzMkgyMFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                        }}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                        {project.title}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {project.summary}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getAreaBadge(project.area)}</td>
                                <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                    {project.supervisor}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(project.startedAt)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {project.finishedAt ? formatDate(project.finishedAt) : '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(project.updatedAt)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setActionMenuOpen(
                                                    actionMenuOpen === project.id
                                                        ? null
                                                        : project.id
                                                )
                                            }
                                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer"
                                        >
                                            <i className="ri-more-2-line"></i>
                                        </button>

                                        {actionMenuOpen === project.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            onView(project);
                                                            setActionMenuOpen(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                    >
                                                        <i className="ri-eye-line mr-3"></i>
                                                        Visualizar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onEdit(project);
                                                            setActionMenuOpen(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                    >
                                                        <i className="ri-edit-line mr-3"></i>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onDuplicate(project);
                                                            setActionMenuOpen(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                    >
                                                        <i className="ri-file-copy-line mr-3"></i>
                                                        Duplicar
                                                    </button>

                                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                                                    <div className="px-4 py-2">
                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                            Alterar Status
                                                        </div>
                                                        {ResearchProjectStatusList.map((status) => (
                                                            <button
                                                                key={status.id}
                                                                onClick={() => {
                                                                    onStatusChange(
                                                                        project,
                                                                        status.id
                                                                    );
                                                                    setActionMenuOpen(null);
                                                                }}
                                                                disabled={
                                                                    project.status === status.id
                                                                }
                                                                className={`block w-full text-left px-2 py-1 text-xs rounded ${
                                                                    project.status === status.id
                                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                                                                }`}
                                                            >
                                                                {status.displayName}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                                                    <button
                                                        onClick={() => {
                                                            onDelete(project);
                                                            setActionMenuOpen(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer"
                                                    >
                                                        <i className="ri-delete-bin-line mr-3"></i>
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
