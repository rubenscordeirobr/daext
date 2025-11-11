import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import ThemeToggle from '../../../components/base/ThemeToggle';

export default function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleLogout = () => {
        // Clear session
        sessionStorage.removeItem('auth-session');
        addToast({ message: 'Logout realizado com sucesso', type: 'success' });
        navigate('/login');
    };

    const notifications = [
        {
            id: 1,
            title: 'Nova pesquisa aprovada',
            message: 'O projeto "IA em Medicina" foi aprovado para financiamento.',
            time: '2 horas atrás',
            unread: true,
        },
        {
            id: 2,
            title: 'Reunião agendada',
            message: 'Reunião do comitê científico às 14h.',
            time: '4 horas atrás',
            unread: true,
        },
        {
            id: 3,
            title: 'Relatório disponível',
            message: 'Relatório mensal de atividades foi gerado.',
            time: '1 dia atrás',
            unread: false,
        },
    ];

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard Acadêmico
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                        >
                            <i className="ri-notification-line text-xl"></i>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                2
                            </span>
                        </button>

                        {isNotificationsOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsNotificationsOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Notificações
                                        </h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                                    notification.unread
                                                        ? 'bg-blue-50 dark:bg-blue-900/10'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                    {notification.unread && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                        <button className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer">
                                            Ver todas as notificações
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                        >
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">AD</span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Admin
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Administrador
                                </p>
                            </div>
                            <i className="ri-arrow-down-s-line text-gray-600 dark:text-gray-400"></i>
                        </button>

                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer whitespace-nowrap"
                                        >
                                            <i className="ri-user-line w-4 h-4 flex items-center justify-center mr-3 inline-flex"></i>
                                            Meu Perfil
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer whitespace-nowrap">
                                            <i className="ri-settings-line w-4 h-4 flex items-center justify-center mr-3 inline-flex"></i>
                                            Configurações
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer whitespace-nowrap"
                                        >
                                            <i className="ri-logout-box-line w-4 h-4 flex items-center justify-center mr-3 inline-flex"></i>
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
