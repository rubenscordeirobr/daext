import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ToastContainer from '../../components/base/ToastContainer';
import { useToast } from '../../hooks/useToast';

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    bio: string;
    avatarUrl: string;
    location: string;
    website: string;
    linkedin: string;
    twitter: string;
    joinedAt: Date;
    lastLoginAt: Date;
}

export default function Profile() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { toasts, removeToast, success, error: showError } = useToast();

    const [profile, setProfile] = useState<UserProfile>({
        id: '1',
        fullName: 'Ana Silva Santos',
        email: 'ana.silva@universidade.edu.br',
        phone: '(11) 99999-9999',
        position: 'Coordenadora de Pesquisa',
        department: 'Instituto de Matemática e Estatística',
        bio: 'Doutora em Matemática Aplicada com mais de 15 anos de experiência em pesquisa e ensino. Especialista em análise numérica e modelagem matemática, com foco em aplicações em engenharia e ciências.',
        avatarUrl:
            'https://readdy.ai/api/search-image?query=professional%20woman%20researcher%20scientist%20portrait%20clean%20background%20modern%20academic%20style&width=400&height=400&seq=profile1&orientation=squarish',
        location: 'São Paulo, SP',
        website: 'https://ana-silva.com.br',
        linkedin: 'https://linkedin.com/in/ana-silva-santos',
        twitter: 'https://twitter.com/ana_silva_math',
        joinedAt: new Date('2020-03-15'),
        lastLoginAt: new Date(),
    });

    const [formData, setFormData] = useState<UserProfile>(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nome completo é obrigatório';
        } else if (formData.fullName.length < 4 || formData.fullName.length > 100) {
            newErrors.fullName = 'Nome deve ter entre 4 e 100 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Informe um email válido';
        }

        if (formData.phone && !/^[\d\s\(\)\-\+]+$/.test(formData.phone)) {
            newErrors.phone = 'Formato de telefone inválido';
        }

        if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
            newErrors.website = 'Website deve começar com http:// ou https://';
        }

        if (formData.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(formData.linkedin)) {
            newErrors.linkedin = 'URL do LinkedIn inválida';
        }

        if (formData.twitter && !/^https?:\/\/(www\.)?twitter\.com\/.+/.test(formData.twitter)) {
            newErrors.twitter = 'URL do Twitter inválida';
        }

        if (formData.bio.length > 500) {
            newErrors.bio = 'Biografia deve ter no máximo 500 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showError('Por favor, corrija os erros no formulário');
            return;
        }

        setSaving(true);
        try {
            // Simular salvamento
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setProfile(formData);
            setIsEditing(false);
            success('Perfil atualizado com sucesso');
        } catch (error) {
            showError('Erro ao salvar perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setIsEditing(false);
        setErrors({});
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showError('Imagem deve ter no máximo 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setFormData((prev) => ({ ...prev, avatarUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="flex h-screen bg-primary-50">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Profile Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
                            <p className="text-gray-600 mt-2">
                                Gerencie suas informações pessoais e configurações
                            </p>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Cover Section */}
                            <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>

                            {/* Profile Info */}
                            <div className="px-6 pb-6">
                                <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <img
                                            src={formData.avatarUrl}
                                            alt="Avatar"
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src =
                                                    'https://readdy.ai/api/search-image?query=default%20user%20avatar%20placeholder%20professional%20clean%20background&width=400&height=400&seq=default1&orientation=squarish';
                                            }}
                                        />
                                        {isEditing && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-2 right-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors cursor-pointer"
                                                title="Alterar foto"
                                            >
                                                <i className="ri-camera-line text-sm"></i>
                                            </button>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Basic Info */}
                                    <div className="flex-1 mt-4 sm:mt-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {profile.fullName}
                                                </h2>
                                                <p className="text-gray-600">{profile.position}</p>
                                                <p className="text-sm text-gray-500">
                                                    {profile.department}
                                                </p>
                                            </div>
                                            <div className="mt-4 sm:mt-0">
                                                {!isEditing ? (
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
                                                    >
                                                        <i className="ri-edit-line mr-2"></i>
                                                        Editar Perfil
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleCancel}
                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                                                            disabled={saving}
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={handleSave}
                                                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
                                                            disabled={saving}
                                                        >
                                                            {saving ? (
                                                                <>
                                                                    <i className="ri-loader-4-line animate-spin mr-2"></i>
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
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Personal Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Informações Pessoais
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Full Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nome Completo *
                                                </label>
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                                errors.fullName
                                                                    ? 'border-red-300'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            value={formData.fullName}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    fullName: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                        {errors.fullName && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.fullName}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.fullName}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email *
                                                </label>
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="email"
                                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                                errors.email
                                                                    ? 'border-red-300'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            value={formData.email}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    email: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                        {errors.email && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900">{profile.email}</p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Telefone
                                                </label>
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="tel"
                                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                                errors.phone
                                                                    ? 'border-red-300'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            value={formData.phone}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    phone: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="(11) 99999-9999"
                                                        />
                                                        {errors.phone && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.phone || 'Não informado'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Position */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cargo
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                        value={formData.position}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                position: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.position}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Department */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Departamento
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                        value={formData.department}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                department: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.department}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Location */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Localização
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                                        value={formData.location}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                location: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Cidade, Estado"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.location || 'Não informado'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Informações Profissionais
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Bio */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Biografia
                                                </label>
                                                {isEditing ? (
                                                    <div>
                                                        <textarea
                                                            rows={4}
                                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                                errors.bio
                                                                    ? 'border-red-300'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            value={formData.bio}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    bio: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="Conte um pouco sobre você..."
                                                        />
                                                        <div className="flex justify-between mt-1">
                                                            {errors.bio && (
                                                                <p className="text-sm text-red-600">
                                                                    {errors.bio}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500 ml-auto">
                                                                {formData.bio.length}/500 caracteres
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900 whitespace-pre-wrap">
                                                        {profile.bio ||
                                                            'Nenhuma biografia informada'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Website */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Website
                                                </label>
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="url"
                                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                                errors.website
                                                                    ? 'border-red-300'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            value={formData.website}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    website: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="https://seu-site.com"
                                                        />
                                                        {errors.website && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.website}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.website ? (
                                                            <a
                                                                href={profile.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary-600 hover:text-primary-700 cursor-pointer"
                                                            >
                                                                {profile.website}
                                                            </a>
                                                        ) : (
                                                            'Não informado'
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            {/* LinkedIn */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    LinkedIn
                                                </label>
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="url"
                                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                                errors.linkedin
                                                                    ? 'border-red-300'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            value={formData.linkedin}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    linkedin: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="https://linkedin.com/in/seu-perfil"
                                                        />
                                                        {errors.linkedin && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.linkedin}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.linkedin ? (
                                                            <a
                                                                href={profile.linkedin}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary-600 hover:text-primary-700 cursor-pointer"
                                                            >
                                                                {profile.linkedin}
                                                            </a>
                                                        ) : (
                                                            'Não informado'
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Twitter */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Twitter
                                                </label>
                                                {isEditing ? (
                                                    <div>
                                                        <input
                                                            type="url"
                                                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm ${
                                                                errors.twitter
                                                                    ? 'border-red-300'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            value={formData.twitter}
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    twitter: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="https://twitter.com/seu-usuario"
                                                        />
                                                        {errors.twitter && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.twitter}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {profile.twitter ? (
                                                            <a
                                                                href={profile.twitter}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary-600 hover:text-primary-700 cursor-pointer"
                                                            >
                                                                {profile.twitter}
                                                            </a>
                                                        ) : (
                                                            'Não informado'
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Account Info */}
                                            <div className="pt-4 border-t border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                    Informações da Conta
                                                </h4>
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <p>
                                                        <span className="font-medium">
                                                            Membro desde:
                                                        </span>{' '}
                                                        {formatDate(profile.joinedAt)}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">
                                                            Último acesso:
                                                        </span>{' '}
                                                        {formatDate(profile.lastLoginAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i className="ri-shield-user-line text-blue-600 text-xl"></i>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Segurança
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Alterar senha e configurações de segurança
                                        </p>
                                    </div>
                                </div>
                                <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                                    Gerenciar Segurança
                                </button>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <i className="ri-notification-3-line text-green-600 text-xl"></i>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Notificações
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Configurar preferências de notificação
                                        </p>
                                    </div>
                                </div>
                                <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                                    Configurar Notificações
                                </button>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <i className="ri-download-cloud-2-line text-purple-600 text-xl"></i>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Dados
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Exportar ou gerenciar seus dados
                                        </p>
                                    </div>
                                </div>
                                <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                                    Gerenciar Dados
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
