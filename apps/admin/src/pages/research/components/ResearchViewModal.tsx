import type { ResearchProject, ResearchProjectStatus } from '../../../types/research';
import { ResearchProjectStatusData, getResearchProjectStatusColor } from '../../../types/research';
import {
    AcademicArea as AcademicAreaValue,
    getAreaDisplayName,
    type AcademicArea,
} from '../../../types/professor';

interface ResearchViewModalProps {
    project: ResearchProject | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (project: ResearchProject) => void;
}

export default function ResearchViewModal({
    project,
    isOpen,
    onClose,
    onEdit,
}: ResearchViewModalProps) {
    if (!isOpen || !project) return null;

    const getStatusBadge = (status: ResearchProjectStatus) => {
        const info = ResearchProjectStatusData[status];
        const colorClass = getResearchProjectStatusColor(status);
        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-transparent ${colorClass}`}
            >
                {info.displayName}
            </span>
        );
    };

    const getAreaBadge = (area: AcademicArea) => {
        const badges = {
            [AcademicAreaValue.Math]:
                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
            [AcademicAreaValue.Physics]:
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
            [AcademicAreaValue.Chemistry]:
                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
        } as const;

        const badgeClass =
            badges[area as keyof typeof badges] ??
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badgeClass}`}
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
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatDateOnly = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Visualizar Projeto
                        </h2>
                        {getStatusBadge(project.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onEdit(project)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <i className="ri-edit-line mr-2"></i>
                            Editar
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                        >
                            <i className="ri-close-line text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] bg-white dark:bg-gray-800">
                    <div className="p-6">
                        {/* Imagem e informações principais */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2">
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-full h-64 object-cover rounded-lg mb-4"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src =
                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDQwMCAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTI4TDE4MCA5NkwyMjAgMTQ0TDI0MCAxMjhMMjYwIDE2MEgxNDBWMTI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=';
                                    }}
                                />
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {project.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    {project.summary}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Área Acadêmica
                                    </h3>
                                    {getAreaBadge(project.area)}
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Supervisor
                                    </h3>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {project.supervisor}
                                    </p>
                                </div>

                                {project.collaborators.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Colaboradores
                                        </h3>
                                        <div className="space-y-1">
                                            {project.collaborators.map((collaborator, index) => (
                                                <div
                                                    key={index}
                                                    className="text-gray-700 dark:text-gray-300"
                                                >
                                                    {collaborator}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Datas
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Iniciado:
                                            </span>
                                            <span className="text-gray-900 dark:text-white">
                                                {formatDateOnly(project.startedAt)}
                                            </span>
                                        </div>
                                        {project.finishedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Finalizado:
                                                </span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {formatDateOnly(project.finishedAt)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {project.keywords.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Palavras-chave
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.keywords.map((keyword, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descrição */}
                        {project.description && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Descrição do Projeto
                                </h3>
                                <div
                                    className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: project.description }}
                                />
                            </div>
                        )}

                        {/* Informações de auditoria */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                    <span className="font-medium">Criado em:</span>{' '}
                                    {formatDate(project.createdAt)}
                                </div>
                                <div>
                                    <span className="font-medium">Última atualização:</span>{' '}
                                    {formatDate(project.updatedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={() => onEdit(project)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                        <i className="ri-edit-line mr-2"></i>
                        Editar Projeto
                    </button>
                </div>
            </div>
        </div>
    );
}
