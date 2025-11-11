import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ServiceAuth from '../../../services/AuthService';
import { useToast } from '../../../hooks/useToast';

export default function VerifyCodePage() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(5);
    const [resendCountdown, setResendCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const loginId = location.state?.loginId || '';

    useEffect(() => {
        if (!loginId) {
            navigate('/forgot-password');
            return;
        }

        // Countdown para reenvio
        const timer = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loginId, navigate]);

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Apenas dígitos

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (error) setError('');

        // Auto-avanço para próximo campo
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit quando todos os campos estiverem preenchidos
        if (newCode.every((digit) => digit !== '') && newCode.join('').length === 6) {
            handleVerifyCode(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'Enter' && code.every((digit) => digit !== '')) {
            handleVerifyCode(code.join(''));
        }

        if (e.key === 'r' || e.key === 'R') {
            if (canResend) {
                handleResendCode();
            }
        }
    };

    const handleVerifyCode = async (codeToVerify: string) => {
        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const result = await ServiceAuth.verifyCode(loginId, codeToVerify);

            if (result.valid) {
                addToast({ message: 'Código válido', type: 'success' });
                navigate('/reset-password', { state: { loginId } });
            } else {
                setAttemptsLeft(result.attemptsLeft);

                if (result.expired) {
                    addToast({ message: 'Código expirado, enviamos um novo', type: 'info' });
                    await handleResendCode();
                } else if (result.attemptsLeft === 0) {
                    setError(
                        'Muitas tentativas incorretas. Aguarde alguns minutos antes de tentar novamente.'
                    );
                } else {
                    setError('Código inválido');
                    addToast({ message: 'Código inválido, tente novamente', type: 'error' });
                }

                // Limpar campos
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            addToast({ message: 'Erro ao verificar código, tente novamente', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend || resendLoading) return;

        setResendLoading(true);

        try {
            await ServiceAuth.requestCode(loginId);
            addToast({ message: 'Novo código enviado', type: 'success' });
            setCanResend(false);
            setResendCountdown(60);
            setAttemptsLeft(5);
            setError('');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            addToast({ message: 'Erro ao reenviar código', type: 'error' });
        } finally {
            setResendLoading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (pastedData.length === 6) {
            const newCode = pastedData.split('');
            setCode(newCode);
            handleVerifyCode(pastedData);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-shield-check-line text-2xl text-white"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmar código</h1>
                        <p className="text-gray-600">Digite o código de 6 dígitos enviado para:</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{loginId}</p>
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

                    {/* Tentativas Restantes */}
                    {attemptsLeft < 5 && attemptsLeft > 0 && (
                        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-700 text-sm text-center">
                                <i className="ri-alarm-warning-line mr-1"></i>
                                Restam {attemptsLeft} tentativas
                            </p>
                        </div>
                    )}

                    {/* Campos de Código */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                            Código de verificação
                        </label>
                        <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                                    aria-label={`Dígito ${index + 1} do código`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Botão Reenviar */}
                    <div className="mb-6 text-center">
                        <button
                            onClick={handleResendCode}
                            disabled={!canResend || resendLoading}
                            className={`text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                canResend
                                    ? 'text-blue-600 hover:text-blue-500'
                                    : 'text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {resendLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Reenviando...
                                </div>
                            ) : canResend ? (
                                <>
                                    <i className="ri-refresh-line mr-1"></i>
                                    Reenviar código
                                </>
                            ) : (
                                <>
                                    <i className="ri-time-line mr-1"></i>
                                    Reenviar em {resendCountdown}s
                                </>
                            )}
                        </button>
                    </div>

                    {/* Botão Continuar */}
                    <button
                        onClick={() => handleVerifyCode(code.join(''))}
                        disabled={
                            loading || code.some((digit) => digit === '') || attemptsLeft === 0
                        }
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer whitespace-nowrap"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Verificando...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <i className="ri-check-line mr-2"></i>
                                Continuar
                            </div>
                        )}
                    </button>

                    {/* Atalhos */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 text-center mb-2">
                            <strong>Atalhos:</strong>
                        </p>
                        <p className="text-xs text-gray-600 text-center">
                            <kbd className="bg-white px-1 rounded border">Enter</kbd> confirmar •
                            <kbd className="bg-white px-1 rounded border ml-1">R</kbd> reenviar
                        </p>
                    </div>

                    {/* Link Voltar */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                        >
                            <i className="ri-arrow-left-line mr-1"></i>
                            Voltar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
