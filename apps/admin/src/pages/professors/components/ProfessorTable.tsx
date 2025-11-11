import { useState } from 'react';
import {
    AcademicArea as AcademicAreaValue,
    getAreaDisplayName,
    type AcademicArea,
    type Professor,
    type ProfessorFilters,
} from '../../../types/professor';
import { professorsService } from '../../../services/ProfessorsService';
import ConfirmDialog from '../../../components/base/ConfirmDialog';

interface ProfessorTableProps {
    professors: Professor[];
    filters: ProfessorFilters;
    loading: boolean;
    selectedIds: string[];
    sortBy: 'updatedAt' | 'fullName';
    sortDir: 'asc' | 'desc';
    onEdit: (professor: Professor) => void;
    onView: (professor: Professor) => void;
    onRefresh: () => void;
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onSelectionChange: (ids: string[]) => void;
    onSortChange: (sortBy: 'updatedAt' | 'fullName', sortDir: 'asc' | 'desc') => void;
}

const getAreaBadgeColor = (area: AcademicArea): string => {
    switch (area) {
        case AcademicAreaValue.Math:
            return 'bg-blue-100 text-blue-800';
        case AcademicAreaValue.Physics:
            return 'bg-green-100 text-green-800';
        case AcademicAreaValue.Chemistry:
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getAreaLabel = (area: AcademicArea): string => getAreaDisplayName(area);

export default function ProfessorTable({
    professors,
    loading,
    selectedIds,
    sortBy,
    sortDir,
    onEdit,
    onView,
    onRefresh,
    onShowToast,
    onSelectionChange,
    onSortChange,
}: ProfessorTableProps) {
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        professor: Professor | null;
        isMultiple: boolean;
    }>({
        isOpen: false,
        professor: null,
        isMultiple: false,
    });
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(professors.map((p) => p.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
        }
    };

    const handleSort = (field: 'updatedAt' | 'fullName') => {
        if (sortBy === field) {
            onSortChange(field, sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            onSortChange(field, 'desc');
        }
    };

    const handleDelete = (professor: Professor) => {
        setDeleteConfirm({
            isOpen: true,
            professor,
            isMultiple: false,
        });
    };

    const handleDeleteMultiple = () => {
        setDeleteConfirm({
            isOpen: true,
            professor: null,
            isMultiple: true,
        });
    };

    const confirmDelete = async () => {
        try {
            setActionLoading('delete');

            if (deleteConfirm.isMultiple) {
                await professorsService.deleteMultiple(selectedIds);
                onShowToast(`${selectedIds.length} professores excluídos com sucesso`, 'success');
                onSelectionChange([]);
            } else if (deleteConfirm.professor) {
                await professorsService.delete(deleteConfirm.professor.id);
                onShowToast('Professor excluído com sucesso', 'success');
            }

            onRefresh();
        } catch (error) {
            onShowToast('Não foi possível concluir a operação. Tente novamente.', 'error');
        } finally {
            setActionLoading(null);
            setDeleteConfirm({ isOpen: false, professor: null, isMultiple: false });
        }
    };

    const handleDuplicate = async (professor: Professor) => {
        try {
            setActionLoading(`duplicate-${professor.id}`);
            const duplicated = await professorsService.duplicate(professor.id);
            onShowToast('Professor duplicado com sucesso', 'success');
            onRefresh();
            onEdit(duplicated);
        } catch (error) {
            onShowToast('Não foi possível duplicar o professor. Tente novamente.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (date: string | Date): string => {
        const resolvedDate = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(resolvedDate);
    };

    const isAllSelected = professors.length > 0 && selectedIds.length === professors.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < professors.length;

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/6"></div>
                                </div>
                                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (professors.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <i className="ri-user-3-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum professor encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Não há professores que correspondam aos filtros aplicados.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Ações em lote */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-900 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary-800 dark:text-primary-400">
                            {selectedIds.length} professor(es) selecionado(s)
                        </span>
                        <button
                            onClick={handleDeleteMultiple}
                            disabled={actionLoading === 'delete'}
                            className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 disabled:bg-red-400 dark:disabled:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {actionLoading === 'delete' ? (
                                <>
                                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                                    Excluindo...
                                </>
                            ) : (
                                <>
                                    <i className="ri-delete-bin-line mr-2"></i>
                                    Excluir selecionados
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = isIndeterminate;
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Professor
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleSort('fullName')}
                            >
                                <div className="flex items-center gap-1">
                                    Nome
                                    {sortBy === 'fullName' && (
                                        <i
                                            className={`ri-arrow-${sortDir === 'asc' ? 'up' : 'down'}-s-line text-primary-600 dark:text-primary-400`}
                                        ></i>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Área
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Email
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleSort('updatedAt')}
                            >
                                <div className="flex items-center gap-1">
                                    Atualizado em
                                    {sortBy === 'updatedAt' && (
                                        <i
                                            className={`ri-arrow-${sortDir === 'asc' ? 'up' : 'down'}-s-line text-primary-600 dark:text-primary-400`}
                                        ></i>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {professors.map((professor) => (
                            <tr
                                key={professor.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(professor.id)}
                                        onChange={(e) =>
                                            handleSelectOne(professor.id, e.target.checked)
                                        }
                                        className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <img
                                            src={professor.avatarUrl}
                                            alt={professor.fullName}
                                            className="w-10 h-10 rounded-full object-cover mr-3"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professor.fullName)}&background=f3f4f6&color=374151`;
                                            }}
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {professor.academicTitle}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {professor.specialization}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {professor.fullName}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAreaBadgeColor(professor.area)}`}
                                    >
                                        {getAreaLabel(professor.area)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {professor.email ? (
                                        <a
                                            href={`mailto:${professor.email}`}
                                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 cursor-pointer"
                                        >
                                            {professor.email}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-400 dark:text-gray-600">
                                            -
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(professor.updatedAt)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onView(professor)}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors cursor-pointer"
                                            title="Visualizar"
                                        >
                                            <i className="ri-eye-line"></i>
                                        </button>
                                        <button
                                            onClick={() => onEdit(professor)}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors cursor-pointer"
                                            title="Editar"
                                        >
                                            <i className="ri-edit-line"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(professor)}
                                            disabled={actionLoading === `duplicate-${professor.id}`}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                            title="Duplicar"
                                        >
                                            {actionLoading === `duplicate-${professor.id}` ? (
                                                <i className="ri-loader-4-line animate-spin"></i>
                                            ) : (
                                                <i className="ri-file-copy-line"></i>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(professor)}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                            title="Excluir"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
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
