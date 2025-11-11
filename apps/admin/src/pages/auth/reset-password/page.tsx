import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ServiceAuth from '../../../services/AuthService';
import { useToast } from '../../../hooks/useToast';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    criteria: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}

export default function ResetPasswordPage() {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        label: 'Muito fraca',
        color: 'red',
        criteria: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
        },
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    const loginId = location.state?.loginId || '';

    useEffect(() => {
        if (!loginId) {
            navigate('/forgot-password');
        }
    }, [loginId, navigate]);

    const calculatePasswordStrength = (password: string): PasswordStrength => {
        const criteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const score = Object.values(criteria).filter(Boolean).length;

        let label = 'Muito fraca';
        let color = 'red';

        if (score >= 5) {
            label = 'Muito forte';
            color = 'green';
        } else if (score >= 4) {
            label = 'Forte';
            color = 'blue';
        } else if (score >= 3) {
            label = 'Média';
            color = 'yellow';
        } else if (score >= 2) {
            label = 'Fraca';
            color = 'orange';
        }

        return { score, label, color, criteria };
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.password) {
            newErrors.password = 'Nova senha é obrigatória';
        } else if (formData.password.length < 8) {
            newErrors.password = 'A senha deve ter pelo menos 8 caracteres';
        } else if (passwordStrength.score < 4) {
            newErrors.password = 'A senha deve atender aos critérios de segurança';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        if (!validateForm()) return;

        setLoading(true);

        try {
            await ServiceAuth.resetPassword(loginId, formData.password);
            addToast({
                message: 'Senha alterada com sucesso, use sua nova senha para entrar',
                type: 'success',
            });
            navigate('/login', { state: { username: loginId } });
        } catch (error) {
            addToast({
                message: 'Não foi possível alterar a senha, tente novamente',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (value: string) => {
        setFormData((prev) => ({ ...prev, password: value }));
        setPasswordStrength(calculatePasswordStrength(value));

        if (errors.password) {
            setErrors((prev) => ({ ...prev, password: '' }));
        }
        if (errors.confirmPassword && formData.confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setFormData((prev) => ({ ...prev, confirmPassword: value }));

        if (errors.confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 's' || e.key === 'S') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                handleSubmit(e as any);
            }
        }
    };

    const getStrengthBarColor = (index: number) => {
        if (index < passwordStrength.score) {
            switch (passwordStrength.color) {
                case 'green':
                    return 'bg-green-500';
                case 'blue':
                    return 'bg-blue-500';
                case 'yellow':
                    return 'bg-yellow-500';
                case 'orange':
                    return 'bg-orange-500';
                default:
                    return 'bg-red-500';
            }
        }
        return 'bg-gray-200';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-key-line text-2xl text-white"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redefinir senha</h1>
                        <p className="text-gray-600">Crie uma nova senha segura para sua conta</p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} onKeyDown={handleKeyPress} className="space-y-6">
                        {/* Nova Senha */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Nova senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="ri-lock-line text-gray-400"></i>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Digite sua nova senha"
                                    aria-label="Campo de nova senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    <i
                                        className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}
                                    ></i>
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}

                            {/* Medidor de Força */}
                            {formData.password && (
                                <div className="mt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">
                                            Força da senha:
                                        </span>
                                        <span
                                            className={`text-sm font-medium text-${passwordStrength.color}-600`}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="flex space-x-1 mb-3">
                                        {[...Array(5)].map((_, index) => (
                                            <div
                                                key={index}
                                                className={`h-2 flex-1 rounded-full transition-colors ${getStrengthBarColor(index)}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirmar Senha */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirmar nova senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="ri-lock-line text-gray-400"></i>
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        errors.confirmPassword
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Confirme sua nova senha"
                                    aria-label="Campo de confirmação de senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    <i
                                        className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}
                                    ></i>
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Critérios de Senha */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                Critérios de segurança:
                            </p>
                            <div className="space-y-2">
                                {[
                                    { key: 'length', label: 'Mínimo 8 caracteres' },
                                    { key: 'uppercase', label: 'Letra maiúscula' },
                                    { key: 'lowercase', label: 'Letra minúscula' },
                                    { key: 'number', label: 'Número' },
                                    { key: 'special', label: 'Caractere especial' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center">
                                        <i
                                            className={`${
                                                passwordStrength.criteria[
                                                    key as keyof typeof passwordStrength.criteria
                                                ]
                                                    ? 'ri-check-line text-green-500'
                                                    : 'ri-close-line text-gray-400'
                                            } mr-2`}
                                        ></i>
                                        <span
                                            className={`text-sm ${
                                                passwordStrength.criteria[
                                                    key as keyof typeof passwordStrength.criteria
                                                ]
                                                    ? 'text-green-700'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Botão Salvar */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer whitespace-nowrap"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Salvando...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <i className="ri-save-line mr-2"></i>
                                    Salvar nova senha
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Atalhos */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 text-center mb-2">
                            <strong>Atalho:</strong>
                        </p>
                        <p className="text-xs text-gray-600 text-center">
                            <kbd className="bg-white px-1 rounded border">Ctrl+S</kbd> salvar senha
                        </p>
                    </div>

                    {/* Link Voltar */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                        >
                            <i className="ri-arrow-left-line mr-1"></i>
                            Voltar ao login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
