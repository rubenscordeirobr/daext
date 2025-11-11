import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { authService } from '../../../services/AuthService';
import ThemeToggle from '../../../components/base/ThemeToggle';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username.trim()) {
            setError('Usuário é obrigatório');
            return;
        }

        if (!formData.password.trim()) {
            setError('Senha é obrigatória');
            return;
        }

        setIsLoading(true);

        try {
            const session = await authService.login(formData.username, formData.password);
            if (session) {
                addToast({ message: 'Login realizado com sucesso!', type: 'success' });
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Credenciais inválidas');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center">
                        <i className="ri-graduation-cap-line text-white text-2xl"></i>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    Sistema Acadêmico
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Faça login para acessar o dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Usuário ou Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Digite seu usuário ou email"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Digite sua senha"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link
                                    to="/forgot-password"
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 cursor-pointer"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                            >
                                {isLoading ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-login-box-line mr-2"></i>
                                        Entrar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                                Dados para teste:
                            </h4>
                            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                <div>
                                    <strong>Usuário:</strong> admin
                                </div>
                                <div>
                                    <strong>Senha:</strong> admin
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ao fazer login, você concorda com nossos{' '}
                            <a
                                href="#"
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                            >
                                Termos de Uso
                            </a>{' '}
                            e{' '}
                            <a
                                href="#"
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                            >
                                Política de Privacidade
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
