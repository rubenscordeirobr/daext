import { useState, useEffect } from 'react';

interface User {
    id?: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
}

interface UserModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
}

export default function UserModal({ user, onClose, onSave }: UserModalProps) {
    const [formData, setFormData] = useState<User>({
        name: '',
        email: '',
        role: 'user',
        status: 'active',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({
                name: '',
                email: '',
                role: 'user',
                status: 'active',
            });
        }
    }, [user]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleChange = (field: keyof User, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {user ? 'Editar Usuário' : 'Adicionar Usuário'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Nome completo *
                        </label>
                        <input
                            type="text"
                            id="name"
                            className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                                errors.name
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                            }`}
                            placeholder="Digite o nome completo"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                                errors.email
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                            }`}
                            placeholder="Digite o email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Função
                        </label>
                        <div className="relative">
                            <select
                                id="role"
                                className="block w-full px-3 py-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white cursor-pointer"
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                            >
                                <option value="user">Usuário</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Status
                        </label>
                        <div className="relative">
                            <select
                                id="status"
                                className="block w-full px-3 py-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white cursor-pointer"
                                value={formData.status}
                                onChange={(e) =>
                                    handleChange('status', e.target.value as 'active' | 'inactive')
                                }
                            >
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer"
                        >
                            {user ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
