import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ResearchProject } from '../../../types/research';
import { ResearchProjectStatus, ResearchProjectStatusList } from '../../../types/research';
import type { AcademicArea } from '../../../types/professor';
import { AcademicAreaList, AcademicArea as AcademicAreaValue } from '../../../types/professor';
import { researchService } from '../../../services/ResearchService';
import { professorsService } from '../../../services/ProfessorsService';
import ReactQuill from 'react-quill';
import type ReactQuillType from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ResearchModalProps {
    project: ResearchProject | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

interface Professor {
    id: string;
    fullName: string;
    avatarUrl: string;
}

export default function ResearchModal(props: ResearchModalProps) {
    const { project = null, isOpen = false, onClose = () => {}, onSave = () => {} } = props ?? {};
    const [formData, setFormData] = useState<Partial<ResearchProject>>({
        title: '',
        area: AcademicAreaValue.Math,
        supervisor: '',
        collaborators: [],
        summary: '',
        imageUrl: '',
        description: '',
        status: ResearchProjectStatus.Draft,
        leadProfessorId: '',
        keywords: [],
        startedAt: new Date(),
        finishedAt: undefined,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [showProfessorDropdown, setShowProfessorDropdown] = useState(false);
    const [professorSearch, setProfessorSearch] = useState('');
    const [keywordsSuggestions, setKeywordsSuggestions] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');

    const quillRef = useRef<ReactQuillType | null>(null);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
    const originalUpdatedAt = useRef<string>('');

    // Inicializar dados do formulário
    useEffect(() => {
        if (isOpen) {
            if (project) {
                setFormData({
                    ...project,
                    startedAt: project.startedAt,
                    finishedAt: project.finishedAt,
                });
                originalUpdatedAt.current = project.updatedAt.toISOString();
            } else {
                setFormData({
                    title: '',
                    area: AcademicAreaValue.Math,
                    supervisor: '',
                    collaborators: [],
                    summary: '',
                    imageUrl: '',
                    description: '',
                    status: ResearchProjectStatus.Draft,
                    leadProfessorId: '',
                    keywords: [],
                    startedAt: new Date(),
                    finishedAt: undefined,
                });
                originalUpdatedAt.current = '';
            }
            setErrors({});
            setHasUnsavedChanges(false);
            setAutoSaveStatus('');
            loadProfessors();
            loadKeywordsSuggestions();
        }
    }, [isOpen, project]);

    const updateWordCount = (html: string) => {
        const text = html.replace(/<[^>]*>/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        setWordCount(words);
    };

    const loadProfessors = async () => {
        try {
            const response = await professorsService.getAll({ pageSize: 100 });
            setProfessors(
                response.items.map((p) => ({
                    id: p.id,
                    fullName: p.fullName,
                    avatarUrl: p.avatarUrl,
                }))
            );
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    };

    const loadKeywordsSuggestions = async () => {
        try {
            const suggestions = await researchService.getKeywordsSuggestions();
            setKeywordsSuggestions(suggestions);
        } catch (error) {
            console.error('Erro ao carregar sugestões:', error);
        }
    };

    const autoSaveDraft = useCallback(async () => {
        if (!project || formData.status !== ResearchProjectStatus.Draft) return;

        try {
            setAutoSaveStatus('Salvando...');
            await researchService.saveDraft(project.id, formData);
            setAutoSaveStatus('Salvo como rascunho');
            setTimeout(() => setAutoSaveStatus(''), 3000);
        } catch (error) {
            setAutoSaveStatus('Erro ao salvar');
            setTimeout(() => setAutoSaveStatus(''), 3000);
        }
    }, [project, formData]);

    const handleDescriptionChange = (content: string) => {
        setFormData((prev) => ({ ...prev, description: content }));
        setHasUnsavedChanges(true);
        updateWordCount(content);

        // Auto save para rascunhos
        if (formData.status === ResearchProjectStatus.Draft) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = setTimeout(() => {
                autoSaveDraft();
            }, 2000);
        }
    };

    const handleImageUpload = useCallback(async (file: File): Promise<string> => {
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = (e.target?.result as string) ?? '';
                resolve(result);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleInsertImage = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) {
                return;
            }
            const imageUrl = await handleImageUpload(file);
            if (!imageUrl) return;
            const editor = quillRef.current?.getEditor();
            if (!editor) return;
            const range = editor.getSelection(true);
            const index = range?.index ?? editor.getLength();
            editor.insertEmbed(index, 'image', imageUrl, 'user');
            editor.setSelection(index + 1);
        };
        input.click();
    }, [handleImageUpload]);

    const quillModules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    ['link', 'image', 'code-block'],
                    ['clean'],
                ],
                handlers: {
                    image: handleInsertImage,
                },
            },
            clipboard: {
                matchVisual: false,
            },
        }),
        [handleInsertImage]
    );

    const quillFormats = useMemo(
        () => [
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'blockquote',
            'list',
            'bullet',
            'link',
            'image',
            'code-block',
            'color',
            'background',
            'align',
        ],
        []
    );

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.length < 4) {
            newErrors.title = 'Título deve ter pelo menos 4 caracteres';
        } else if (formData.title.length > 140) {
            newErrors.title = 'Título deve ter no máximo 140 caracteres';
        }

        if (!formData.area) {
            newErrors.area = 'Área é obrigatória';
        }

        if (!formData.supervisor) {
            newErrors.supervisor = 'Supervisor é obrigatório';
        }

        if (!formData.summary || formData.summary.length < 30) {
            newErrors.summary = 'Resumo deve ter pelo menos 30 caracteres';
        } else if (formData.summary.length > 400) {
            newErrors.summary = 'Resumo deve ter no máximo 400 caracteres';
        }

        if (!formData.imageUrl) {
            newErrors.imageUrl = 'URL da imagem é obrigatória';
        } else {
            try {
                new URL(formData.imageUrl);
            } catch {
                newErrors.imageUrl = 'Informe uma URL válida';
            }
        }

        if (!formData.startedAt) {
            newErrors.startedAt = 'Data de início é obrigatória';
        }

        if (
            formData.finishedAt &&
            formData.startedAt &&
            formData.finishedAt <= formData.startedAt
        ) {
            newErrors.finishedAt = 'Data de término deve ser posterior à data de início';
        }

        if (formData.status === ResearchProjectStatus.Completed && !formData.finishedAt) {
            newErrors.finishedAt = 'Informe uma data de término para projetos concluídos';
        }

        if (
            (formData.status === ResearchProjectStatus.Active ||
                formData.status === ResearchProjectStatus.Completed) &&
            formData.description
        ) {
            const textContent = formData.description.replace(/<[^>]*>/g, '').trim();
            if (textContent.length < 50) {
                newErrors.description =
                    'Descrição deve ter pelo menos 50 caracteres para projetos ativos ou concluídos';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: originalUpdatedAt.current,
            };

            if (project) {
                await researchService.update(project.id, dataToSave);
            } else {
                await researchService.create(
                    dataToSave as Omit<ResearchProject, 'id' | 'createdAt' | 'updatedAt'>
                );
            }

            setHasUnsavedChanges(false);
            onSave();
            onClose();
        } catch (error: any) {
            if (error.message.includes('CONFLICT')) {
                setErrors({ general: error.message });
            } else {
                setErrors({ general: 'Erro ao salvar projeto de pesquisa' });
            }
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        const updatedData = { ...formData, status: ResearchProjectStatus.Active };
        setFormData(updatedData);

        // Validar novamente com o novo status
        setTimeout(() => {
            if (validateForm()) {
                handleSave();
            }
        }, 100);
    };

    const handleSchedule = async () => {
        if (!formData.finishedAt || formData.finishedAt <= new Date()) {
            setErrors({ finishedAt: 'Informe uma data futura para agendar' });
            return;
        }

        const updatedData = { ...formData, status: ResearchProjectStatus.Completed };
        setFormData(updatedData);

        setTimeout(() => {
            if (validateForm()) {
                handleSave();
            }
        }, 100);
    };

    const addKeyword = (keyword: string) => {
        const trimmed = keyword.trim().toLowerCase();
        if (
            trimmed &&
            !formData.keywords?.includes(trimmed) &&
            (formData.keywords?.length || 0) < 12
        ) {
            setFormData((prev) => ({
                ...prev,
                keywords: [...(prev.keywords || []), trimmed],
            }));
            setHasUnsavedChanges(true);
        }
    };

    const removeKeyword = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            keywords: prev.keywords?.filter((_, i) => i !== index) || [],
        }));
        setHasUnsavedChanges(true);
    };

    const addCollaborator = (collaborator: string) => {
        const trimmed = collaborator.trim();
        if (
            trimmed &&
            !formData.collaborators?.includes(trimmed) &&
            (formData.collaborators?.length || 0) < 15
        ) {
            setFormData((prev) => ({
                ...prev,
                collaborators: [...(prev.collaborators || []), trimmed],
            }));
            setHasUnsavedChanges(true);
        }
    };

    const removeCollaborator = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            collaborators: prev.collaborators?.filter((_, i) => i !== index) || [],
        }));
        setHasUnsavedChanges(true);
    };

    const handleClose = () => {
        if (hasUnsavedChanges) {
            if (confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const filteredProfessors = professors.filter((prof) =>
        prof.fullName.toLowerCase().includes(professorSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-h-[95vh] overflow-hidden ${isFullscreen ? 'max-w-7xl' : 'max-w-5xl'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {project ? 'Editar Projeto' : 'Novo Projeto'}
                        </h2>
                        {autoSaveStatus && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                {autoSaveStatus}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
                    <div
                        className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6 p-6`}
                    >
                        {/* Formulário */}
                        <div className="space-y-6">
                            {errors.general && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex">
                                        <i className="ri-error-warning-line text-red-400 mr-3 mt-0.5"></i>
                                        <div className="text-sm text-red-700 dark:text-red-400">
                                            {errors.general}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, title: e.target.value }));
                                        setHasUnsavedChanges(true);
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors.title
                                            ? 'border-red-300 dark:border-red-600'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="Digite o título do projeto..."
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.title && (
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {errors.title}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formData.title?.length || 0}/140
                                    </span>
                                </div>
                            </div>

                            {/* Área e Supervisor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Área Acadêmica *
                                    </label>
                                    <select
                                        value={formData.area || AcademicAreaValue.Math}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                area: e.target.value as AcademicArea,
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.area
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    >
                                        {AcademicAreaList.map((area) => (
                                            <option key={area.id} value={area.id}>
                                                {area.displayName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.area && (
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {errors.area}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Supervisor *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.supervisor || ''}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                supervisor: e.target.value,
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.supervisor
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Nome do supervisor..."
                                    />
                                    {errors.supervisor && (
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {errors.supervisor}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Professor Líder */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Professor Líder
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={professorSearch}
                                        onChange={(e) => {
                                            setProfessorSearch(e.target.value);
                                            setShowProfessorDropdown(true);
                                        }}
                                        onFocus={() => setShowProfessorDropdown(true)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Buscar professor..."
                                    />
                                    {formData.leadProfessorId && (
                                        <button
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    leadProfessorId: '',
                                                }));
                                                setProfessorSearch('');
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    )}
                                </div>

                                {showProfessorDropdown && filteredProfessors.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredProfessors.map((prof) => (
                                            <button
                                                key={prof.id}
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        leadProfessorId: prof.id,
                                                    }));
                                                    setProfessorSearch(prof.fullName);
                                                    setShowProfessorDropdown(false);
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                                            >
                                                <img
                                                    src={prof.avatarUrl}
                                                    alt={prof.fullName}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {prof.fullName}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Colaboradores */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Colaboradores
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.collaborators?.map((collaborator, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                        >
                                            {collaborator}
                                            <button
                                                onClick={() => removeCollaborator(index)}
                                                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
                                            >
                                                <i className="ri-close-line text-xs"></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault();
                                            addCollaborator(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Digite um nome e pressione Enter..."
                                />
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {formData.collaborators?.length || 0}/15 colaboradores
                                </div>
                            </div>

                            {/* Resumo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Resumo *
                                </label>
                                <textarea
                                    value={formData.summary || ''}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            summary: e.target.value,
                                        }));
                                        setHasUnsavedChanges(true);
                                    }}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors.summary
                                            ? 'border-red-300 dark:border-red-600'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="Descreva brevemente o projeto..."
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.summary && (
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {errors.summary}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formData.summary?.length || 0}/400
                                    </span>
                                </div>
                            </div>

                            {/* URL da Imagem */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    URL da Imagem *
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="url"
                                        value={formData.imageUrl || ''}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                imageUrl: e.target.value,
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.imageUrl
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                    <button
                                        onClick={() => {
                                            if (formData.imageUrl) {
                                                window.open(formData.imageUrl, '_blank');
                                            }
                                        }}
                                        className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                                    >
                                        <i className="ri-external-link-line"></i>
                                    </button>
                                </div>
                                {errors.imageUrl && (
                                    <span className="text-sm text-red-600 dark:text-red-400">
                                        {errors.imageUrl}
                                    </span>
                                )}

                                {/* Preview da imagem */}
                                {formData.imageUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Palavras-chave */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Palavras-chave
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.keywords?.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                        >
                                            {keyword}
                                            <button
                                                onClick={() => removeKeyword(index)}
                                                className="ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                                            >
                                                <i className="ri-close-line text-xs"></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault();
                                            addKeyword(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Digite uma palavra-chave e pressione Enter..."
                                />
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {formData.keywords?.length || 0}/12 palavras-chave
                                </div>

                                {/* Sugestões */}
                                {keywordsSuggestions.length > 0 && (
                                    <div className="mt-2">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Sugestões:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {keywordsSuggestions.slice(0, 8).map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => addKeyword(suggestion)}
                                                    disabled={formData.keywords?.includes(
                                                        suggestion
                                                    )}
                                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status e Datas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status || ResearchProjectStatus.Draft}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                status: e.target.value as ResearchProjectStatus,
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {ResearchProjectStatusList.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.displayName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Data de Início *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={
                                            formData.startedAt
                                                ? new Date(
                                                      formData.startedAt.getTime() -
                                                          formData.startedAt.getTimezoneOffset() *
                                                              60000
                                                  )
                                                      .toISOString()
                                                      .slice(0, 16)
                                                : ''
                                        }
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                startedAt: new Date(e.target.value),
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.startedAt
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    />
                                    {errors.startedAt && (
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {errors.startedAt}
                                        </span>
                                    )}
                                </div>

                                {(formData.status === ResearchProjectStatus.Completed ||
                                    formData.status === ResearchProjectStatus.Archived) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Data de Término{' '}
                                            {formData.status === ResearchProjectStatus.Completed
                                                ? '*'
                                                : ''}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={
                                                formData.finishedAt
                                                    ? new Date(
                                                          formData.finishedAt.getTime() -
                                                              formData.finishedAt.getTimezoneOffset() *
                                                                  60000
                                                      )
                                                          .toISOString()
                                                          .slice(0, 16)
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    finishedAt: e.target.value
                                                        ? new Date(e.target.value)
                                                        : undefined,
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                                errors.finishedAt
                                                    ? 'border-red-300 dark:border-red-600'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        />
                                        {errors.finishedAt && (
                                            <span className="text-sm text-red-600 dark:text-red-400">
                                                {errors.finishedAt}
                                            </span>
                                        )}
                                        {formData.status === ResearchProjectStatus.Archived &&
                                            !formData.finishedAt && (
                                                <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                                    <i className="ri-information-line mr-1"></i>
                                                    Recomendamos preencher a data de término
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>

                            {/* Editor React Quill */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Descrição do Projeto
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                                        >
                                            <i className="ri-eye-line mr-1"></i>
                                            {showPreview ? 'Ocultar' : 'Prévia'}
                                        </button>
                                        <button
                                            onClick={() => setIsFullscreen(!isFullscreen)}
                                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                                        >
                                            <i
                                                className={`ri-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}-line mr-1`}
                                            ></i>
                                            Tela cheia
                                        </button>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {wordCount} palavras • {Math.ceil(wordCount / 200)} min
                                            leitura
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`quill-editor-wrapper ${
                                        errors.description
                                            ? 'ring-1 ring-red-300 dark:ring-red-500 rounded-lg'
                                            : ''
                                    } ${isFullscreen ? 'min-h-[400px]' : ''}`}
                                >
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={formData.description || ''}
                                        onChange={handleDescriptionChange}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Descreva detalhadamente o projeto de pesquisa..."
                                        className={isFullscreen ? 'min-h-[400px]' : ''}
                                    />
                                </div>
                                {errors.description && (
                                    <span className="text-sm text-red-600 dark:text-red-400">
                                        {errors.description}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Preview */}
                        {showPreview && (
                            <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Prévia da Descrição
                                </h3>
                                <div
                                    className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            formData.description ||
                                            '<p class="text-gray-400 dark:text-gray-500 italic">Nenhum conteúdo ainda...</p>',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center space-x-4">
                        {hasUnsavedChanges && (
                            <span className="text-sm text-amber-600 dark:text-amber-400">
                                <i className="ri-information-line mr-1"></i>
                                Alterações não salvas
                            </span>
                        )}
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Cancelar
                        </button>

                        {formData.status === ResearchProjectStatus.Draft && (
                            <button
                                onClick={handlePublish}
                                disabled={saving}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <i className="ri-send-plane-line mr-2"></i>
                                Publicar
                            </button>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {saving ? (
                                <>
                                    <i className="ri-loader-4-line mr-2 animate-spin"></i>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <i className="ri-save-line mr-2"></i>
                                    Salvar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
