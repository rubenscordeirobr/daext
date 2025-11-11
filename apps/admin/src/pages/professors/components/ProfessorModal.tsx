import { useState, useEffect, useRef } from 'react';
import type { Professor, AcademicTitle, AcademicArea } from '../../../types/professor';
import { AcademicAreaList, AcademicArea as AcademicAreaValue } from '../../../types/professor';
import { professorsService } from '../../../services/ProfessorsService';
import ConfirmDialog from '../../../components/base/ConfirmDialog';

interface ProfessorModalProps {
    isOpen: boolean;
    professor: Professor | null;
    onClose: () => void;
    onSave: () => void;
    onShowToast: (message: string, type: 'success' | 'error') => void;
}

interface FormData {
    fullName: string;
    academicTitle: AcademicTitle | string;
    area: AcademicArea;
    specialization: string;
    orcid: string;
    researchAreas: string[];
    bio: string;
    email: string;
    phone: string;
    lattesUrl: string;
    avatarUrl: string;
}

interface FormErrors {
    [key: string]: string;
}

const academicTitleOptions: AcademicTitle[] = [
    'Professor',
    'Doutor',
    'Mestre',
    'Livre-docente',
    'Especialista',
    'Bacharel',
];

const areaOptions: { value: AcademicArea; label: string }[] = AcademicAreaList.map((area) => ({
    value: area.id,
    label: area.displayName,
}));

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);
const isRelativeAssetPath = (value: string) => value.startsWith('/');

export default function ProfessorModal({
    isOpen,
    professor,
    onClose,
    onSave,
    onShowToast,
}: ProfessorModalProps) {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        academicTitle: 'Professor',
        area: AcademicAreaValue.Math,
        specialization: '',
        orcid: '',
        researchAreas: [],
        bio: '',
        email: '',
        phone: '',
        lattesUrl: '',
        avatarUrl: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [researchAreaInput, setResearchAreaInput] = useState('');
    const [researchSuggestions, setResearchSuggestions] = useState<string[]>([]);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [originalUpdatedAt, setOriginalUpdatedAt] = useState<string>('');

    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    // Carregar dados do professor para edição
    useEffect(() => {
        if (isOpen) {
            if (professor) {
                setFormData({
                    fullName: professor.fullName,
                    academicTitle: professor.academicTitle,
                    area: professor.area,
                    specialization: professor.specialization,
                    orcid: professor.orcid || '',
                    researchAreas: [...professor.researchAreas],
                    bio: professor.bio,
                    email: professor.email || '',
                    phone: professor.phone || '',
                    lattesUrl: professor.lattesUrl || '',
                    avatarUrl: professor.avatarUrl,
                });
                setOriginalUpdatedAt(professor.updatedAt);
            } else {
                setFormData({
                    fullName: '',
                    academicTitle: 'Professor',
                    area: AcademicAreaValue.Math,
                    specialization: '',
                    orcid: '',
                    researchAreas: [],
                    bio: '',
                    email: '',
                    phone: '',
                    lattesUrl: '',
                    avatarUrl: '',
                });
                setOriginalUpdatedAt('');
            }
            setErrors({});
            setHasChanges(false);
            setResearchAreaInput('');

            // Carregar sugestões de áreas de pesquisa
            loadResearchSuggestions();

            // Focar no primeiro campo
            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, professor]);

    // Detectar mudanças no formulário
    useEffect(() => {
        if (isOpen) {
            setHasChanges(true);
        }
    }, [formData]);

    // Gerenciar foco no modal
    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    handleClose();
                } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSave();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, hasChanges]);

    const loadResearchSuggestions = async () => {
        try {
            const suggestions = await professorsService.getResearchAreasSuggestions();
            setResearchSuggestions(suggestions);
        } catch (error) {
            // Ignorar erro silenciosamente
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Nome completo
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nome completo é obrigatório';
        } else if (formData.fullName.trim().length < 4) {
            newErrors.fullName = 'Nome deve ter pelo menos 4 caracteres';
        } else if (formData.fullName.trim().length > 140) {
            newErrors.fullName = 'Nome deve ter no máximo 140 caracteres';
        }

        // Área acadêmica
        if (!formData.area) {
            newErrors.area = 'Área acadêmica é obrigatória';
        }

        // Especialização
        if (!formData.specialization.trim()) {
            newErrors.specialization = 'Especialização é obrigatória';
        }

        // Email (opcional, mas se preenchido deve ser válido)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Informe um email válido';
        }

        // ORCID (opcional, mas se preenchido deve ser válido)
        if (
            formData.orcid &&
            !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orcid.replace(/\s/g, ''))
        ) {
            newErrors.orcid = 'Informe um ORCID no formato correto (0000-0000-0000-0000)';
        }

        // URL do Lattes (opcional, mas se preenchida deve ser válida)
        if (formData.lattesUrl && !isAbsoluteUrl(formData.lattesUrl)) {
            newErrors.lattesUrl = 'Informe uma URL válida';
        }

        // Avatar URL
        if (!formData.avatarUrl.trim()) {
            newErrors.avatarUrl = 'URL do avatar é obrigatória';
        } else if (!isAbsoluteUrl(formData.avatarUrl) && !isRelativeAssetPath(formData.avatarUrl)) {
            newErrors.avatarUrl = 'Informe uma URL válida';
        }

        // Bio
        if (formData.bio.length > 1500) {
            newErrors.bio = 'Biografia deve ter no máximo 1500 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Limpar erro do campo
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handlePhoneChange = (value: string) => {
        // Formatar telefone automaticamente
        const cleaned = value.replace(/\D/g, '');
        let formatted = cleaned;

        if (cleaned.length >= 11) {
            formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
        } else if (cleaned.length >= 7) {
            formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length >= 3) {
            formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        }

        handleInputChange('phone', formatted);
    };

    const handleOrcidChange = (value: string) => {
        // Formatar ORCID automaticamente
        const cleaned = value.replace(/[^\\dX]/gi, '').toUpperCase();
        let formatted = cleaned;

        if (cleaned.length >= 4) {
            formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
            if (formatted.length > 19) {
                formatted = formatted.slice(0, 19);
            }
        }

        handleInputChange('orcid', formatted);
    };

    const handleAddResearchArea = () => {
        const area = researchAreaInput.trim();
        if (area && !formData.researchAreas.includes(area)) {
            if (formData.researchAreas.length >= 10) {
                setErrors((prev) => ({ ...prev, researchAreas: 'Máximo de 10 áreas de pesquisa' }));
                return;
            }

            handleInputChange('researchAreas', [...formData.researchAreas, area]);
            setResearchAreaInput('');
            setErrors((prev) => ({ ...prev, researchAreas: '' }));
        } else if (formData.researchAreas.includes(area)) {
            setErrors((prev) => ({ ...prev, researchAreas: 'Área de pesquisa já adicionada' }));
        }
    };

    const handleRemoveResearchArea = (index: number) => {
        const newAreas = formData.researchAreas.filter((_, i) => i !== index);
        handleInputChange('researchAreas', newAreas);
    };

    const handleResearchAreaKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddResearchArea();
        }
    };

    const handleAvatarUrlChange = (url: string) => {
        handleInputChange('avatarUrl', url);

        if (url && (isAbsoluteUrl(url) || isRelativeAssetPath(url))) {
            setAvatarLoading(true);
            // Simular carregamento da imagem
            const img = new Image();
            img.onload = () => setAvatarLoading(false);
            img.onerror = () => setAvatarLoading(false);
            img.src = url;
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            if (professor) {
                // Editar professor existente
                await professorsService.update(professor.id, {
                    ...formData,
                    updatedAt: originalUpdatedAt,
                });
                onShowToast('Alterações salvas com sucesso', 'success');
            } else {
                // Criar novo professor
                await professorsService.create(formData);
                onShowToast('Professor criado com sucesso', 'success');
            }

            setHasChanges(false);
            onSave();
            onClose();
        } catch (error: any) {
            if (error.message.includes('CONFLICT')) {
                onShowToast(
                    'Este registro foi atualizado em paralelo. Recarregue os dados ou tente mesclar manualmente.',
                    'error'
                );
            } else {
                onShowToast('Não foi possível concluir a operação. Tente novamente.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (hasChanges && !loading) {
            setShowCloseConfirm(true);
        } else {
            onClose();
        }
    };

    const confirmClose = () => {
        setShowCloseConfirm(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div
                    ref={modalRef}
                    className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {professor ? 'Editar Professor' : 'Novo Professor'}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Coluna esquerda */}
                                <div className="space-y-4">
                                    {/* Nome completo */}
                                    <div>
                                        <label
                                            htmlFor="fullName"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Nome completo *
                                        </label>
                                        <input
                                            ref={firstInputRef}
                                            id="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) =>
                                                handleInputChange('fullName', e.target.value)
                                            }
                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                errors.fullName
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Digite o nome completo"
                                        />
                                        {errors.fullName && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.fullName}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formData.fullName.length}/140 caracteres
                                        </p>
                                    </div>

                                    {/* Título acadêmico */}
                                    <div>
                                        <label
                                            htmlFor="academicTitle"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Título acadêmico *
                                        </label>
                                        <select
                                            id="academicTitle"
                                            value={formData.academicTitle}
                                            onChange={(e) =>
                                                handleInputChange('academicTitle', e.target.value)
                                            }
                                            className="block w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white cursor-pointer"
                                        >
                                            {academicTitleOptions.map((title) => (
                                                <option key={title} value={title}>
                                                    {title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Área acadêmica */}
                                    <div>
                                        <label
                                            htmlFor="area"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Área acadêmica *
                                        </label>
                                        <select
                                            id="area"
                                            value={formData.area}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'area',
                                                    e.target.value as AcademicArea
                                                )
                                            }
                                            className={`block w-full pr-8 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white cursor-pointer ${
                                                errors.area ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        >
                                            {areaOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.area && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.area}
                                            </p>
                                        )}
                                    </div>

                                    {/* Especialização */}
                                    <div>
                                        <label
                                            htmlFor="specialization"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Especialização *
                                        </label>
                                        <input
                                            id="specialization"
                                            type="text"
                                            value={formData.specialization}
                                            onChange={(e) =>
                                                handleInputChange('specialization', e.target.value)
                                            }
                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                errors.specialization
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Ex: Álgebra Linear e Geometria Analítica"
                                        />
                                        {errors.specialization && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.specialization}
                                            </p>
                                        )}
                                    </div>

                                    {/* Áreas de pesquisa */}
                                    <div>
                                        <label
                                            htmlFor="researchAreas"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Áreas de pesquisa
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                id="researchAreas"
                                                type="text"
                                                value={researchAreaInput}
                                                onChange={(e) =>
                                                    setResearchAreaInput(e.target.value)
                                                }
                                                onKeyDown={handleResearchAreaKeyDown}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                placeholder="Digite uma área e pressione Enter"
                                                list="research-suggestions"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddResearchArea}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                                <i className="ri-add-line"></i>
                                            </button>
                                        </div>

                                        <datalist id="research-suggestions">
                                            {researchSuggestions.map((suggestion) => (
                                                <option key={suggestion} value={suggestion} />
                                            ))}
                                        </datalist>

                                        {/* Chips das áreas */}
                                        {formData.researchAreas.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {formData.researchAreas.map((area, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                                                    >
                                                        {area}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveResearchArea(index)
                                                            }
                                                            className="w-4 h-4 flex items-center justify-center hover:bg-primary-200 rounded-full cursor-pointer"
                                                        >
                                                            <i className="ri-close-line text-xs"></i>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {errors.researchAreas && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.researchAreas}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formData.researchAreas.length}/10 áreas
                                        </p>
                                    </div>

                                    {/* Biografia */}
                                    <div>
                                        <label
                                            htmlFor="bio"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Biografia
                                        </label>
                                        <textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) =>
                                                handleInputChange('bio', e.target.value)
                                            }
                                            rows={4}
                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none ${
                                                errors.bio ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Descreva a experiência e formação do professor"
                                        />
                                        {errors.bio && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.bio}
                                            </p>
                                        )}
                                        <p
                                            className={`mt-1 text-xs ${formData.bio.length > 1400 ? 'text-red-600' : 'text-gray-500'}`}
                                        >
                                            {formData.bio.length}/1500 caracteres
                                        </p>
                                    </div>
                                </div>

                                {/* Coluna direita */}
                                <div className="space-y-4">
                                    {/* Avatar */}
                                    <div>
                                        <label
                                            htmlFor="avatarUrl"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            URL do Avatar *
                                        </label>
                                        <input
                                            id="avatarUrl"
                                            type="url"
                                            value={formData.avatarUrl}
                                            onChange={(e) => handleAvatarUrlChange(e.target.value)}
                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                errors.avatarUrl
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="https://exemplo.com/avatar.jpg"
                                        />
                                        {errors.avatarUrl && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.avatarUrl}
                                            </p>
                                        )}

                                        {/* Preview do avatar */}
                                        {formData.avatarUrl && (
                                            <div className="mt-3 flex justify-center">
                                                <div className="relative">
                                                    {avatarLoading && (
                                                        <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <i className="ri-loader-4-line animate-spin text-gray-400"></i>
                                                        </div>
                                                    )}
                                                    <img
                                                        src={formData.avatarUrl}
                                                        alt="Preview"
                                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Professor')}&background=f3f4f6&color=374151`;
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange('email', e.target.value)
                                            }
                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="professor@universidade.edu.br"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Telefone */}
                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Telefone
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>

                                    {/* ORCID */}
                                    <div>
                                        <label
                                            htmlFor="orcid"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            ORCID
                                        </label>
                                        <input
                                            id="orcid"
                                            type="text"
                                            value={formData.orcid}
                                            onChange={(e) => handleOrcidChange(e.target.value)}
                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                errors.orcid ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="0000-0000-0000-0000"
                                        />
                                        {errors.orcid && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.orcid}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Formato: 0000-0000-0000-0000
                                        </p>
                                    </div>

                                    {/* URL do Lattes */}
                                    <div>
                                        <label
                                            htmlFor="lattesUrl"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            URL do Lattes
                                        </label>
                                        <input
                                            id="lattesUrl"
                                            type="url"
                                            value={formData.lattesUrl}
                                            onChange={(e) =>
                                                handleInputChange('lattesUrl', e.target.value)
                                            }
                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                errors.lattesUrl
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="http://lattes.cnpq.br/1234567890123456"
                                        />
                                        {errors.lattesUrl && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.lattesUrl}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-7   00 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {loading ? (
                                <>
                                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                                    Salvando...
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmação de fechamento */}
            <ConfirmDialog
                isOpen={showCloseConfirm}
                title="Descartar alterações"
                message="Você tem alterações não salvas. Tem certeza que deseja fechar sem salvar?"
                confirmText="Descartar"
                cancelText="Continuar editando"
                variant="warning"
                onConfirm={confirmClose}
                onCancel={() => setShowCloseConfirm(false)}
            />
        </>
    );
}
