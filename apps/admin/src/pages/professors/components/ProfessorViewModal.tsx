import type { Professor, AcademicArea } from '../../../types/professor';
import { getAreaDisplayName } from '../../../types/professor';
import { useCallback } from 'react';

interface ProfessorViewModalProps {
    isOpen: boolean;
    professor: Professor | null;
    onClose: () => void;
    onEdit: (professor: Professor) => void;
}

/**
 * Translates academic area enum values to a user‑friendly label.
 */
const getAreaLabel = (area: AcademicArea): string => getAreaDisplayName(area);

/**
 * Safely formats a date (Date object or ISO string) to the Brazilian locale.
 * Returns a dash (‑) if the date cannot be parsed.
 */
const formatDate = (date: Date | string): string => {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) {
            return '-';
        }
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    } catch {
        return '-';
    }
};

export default function ProfessorViewModal({
    isOpen,
    professor,
    onClose,
    onEdit,
}: ProfessorViewModalProps) {
    // If the modal is closed or the professor data is missing, render nothing.
    if (!isOpen || !professor) return null;

    /**
     * Handles the "Edit" button click: forward the current professor to the
     * parent edit handler and then close the modal.
     */
    const handleEdit = useCallback(() => {
        try {
            onEdit(professor);
        } catch (e) {
            console.error('Error while invoking onEdit:', e);
        } finally {
            onClose();
        }
    }, [professor, onEdit, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Visualizar Professor
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6">
                        {/* Avatar e informações principais */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            <div className="flex-shrink-0 text-center md:text-left">
                                <img
                                    src={professor.avatarUrl}
                                    alt={professor.fullName}
                                    className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 border-4 border-gray-200"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            professor.fullName
                                        )}&background=f3f4f6&color=374151&size=128`;
                                    }}
                                />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {professor.fullName}
                                </h1>
                                <p className="text-lg text-gray-600 mb-2">
                                    {professor.academicTitle}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800">
                                        {getAreaLabel(professor.area)}
                                    </span>
                                </div>
                                <p className="text-gray-700 font-medium">
                                    {professor.specialization}
                                </p>
                            </div>
                        </div>

                        {/* Áreas de pesquisa */}
                        {professor.researchAreas.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Áreas de Pesquisa
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {professor.researchAreas.map((area, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Biografia */}
                        {professor.bio && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Biografia
                                </h3>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {professor.bio}
                                </div>
                            </div>
                        )}

                        {/* Informações de contato */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contato</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {professor.email && (
                                    <div className="flex items-center gap-3">
                                        <i className="ri-mail-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                                        <a
                                            href={`mailto:${professor.email}`}
                                            className="text-primary-600 hover:text-primary-800 cursor-pointer"
                                        >
                                            {professor.email}
                                        </a>
                                    </div>
                                )}

                                {professor.phone && (
                                    <div className="flex items-center gap-3">
                                        <i className="ri-phone-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                                        <a
                                            href={`tel:${professor.phone.replace(/\D/g, '')}`}
                                            className="text-primary-600 hover:text-primary-800 cursor-pointer"
                                        >
                                            {professor.phone}
                                        </a>
                                    </div>
                                )}

                                {professor.lattesUrl && (
                                    <div className="flex items-center gap-3">
                                        <i className="ri-external-link-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                                        <a
                                            href={professor.lattesUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-800 cursor-pointer"
                                        >
                                            Currículo Lattes
                                        </a>
                                    </div>
                                )}

                                {professor.orcid && (
                                    <div className="flex items-center gap-3">
                                        <i className="ri-user-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                                        <a
                                            href={`https://orcid.org/${professor.orcid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-800 cursor-pointer"
                                        >
                                            ORCID: {professor.orcid}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informações do sistema */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Informações do Sistema
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Criado em:</span>
                                    <br />
                                    {formatDate(professor.createdAt)}
                                </div>
                                <div>
                                    <span className="font-medium">Última atualização:</span>
                                    <br />
                                    {formatDate(professor.updatedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={handleEdit}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                        <i className="ri-edit-line mr-2"></i>
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
}
