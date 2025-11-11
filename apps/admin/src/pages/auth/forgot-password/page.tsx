import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/AuthService';
import { useToast } from '../../../hooks/useToast';

export default function ForgotPasswordPage() {
    const [loginId, setLoginId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRobot, setIsRobot] = useState(false);

    const navigate = useNavigate();
    const { addToast } = useToast();

    const validateForm = () => {
        if (!loginId.trim()) {
            setError('Email ou usuário é obrigatório');
            return false;
        }
        if (!isRobot) {
            setError('Confirme que você não é um robô');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            await authService.requestCode(loginId);
            addToast({
                message: 'Código enviado, verifique sua caixa de entrada',
                type: 'success',
            });
            navigate('/verify-code', { state: { loginId } });
        } catch (error) {
            addToast({
                message: 'Não foi possível enviar o código, tente novamente',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (value: string) => {
        setLoginId(value);
        if (error) {
            setError('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-lock-unlock-line text-2xl text-white"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Esqueceu a senha?</h1>
                        <p className="text-gray-600">
                            Digite seu email ou usuário para receber um código de recuperação
                        </p>
                    </div>

                    {/* Erro */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                                <span className="text-red-700 text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo Login ID */}
                        <div>
                            <label
                                htmlFor="loginId"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email ou Usuário
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="ri-mail-line text-gray-400"></i>
                                </div>
                                <input
                                    id="loginId"
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Digite seu email ou usuário"
                                    aria-label="Campo de email ou usuário"
                                />
                            </div>
                        </div>

                        {/* reCAPTCHA Simulado */}
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isRobot}
                                    onChange={(e) => setIsRobot(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm text-gray-700">Não sou um robô</span>
                                <div className="ml-auto">
                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                        <i className="ri-shield-check-line text-blue-600 text-sm"></i>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Botão Enviar */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer whitespace-nowrap"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Enviando código...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <i className="ri-send-plane-line mr-2"></i>
                                    Enviar código
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Texto de Apoio */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 text-center">
                            <i className="ri-information-line mr-1"></i>
                            Um código foi enviado para o seu contato cadastrado
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
