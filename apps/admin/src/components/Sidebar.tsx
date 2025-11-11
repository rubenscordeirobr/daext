import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
        { path: '/news', icon: 'ri-newspaper-line', label: 'Notícias' },
        { path: '/professors', icon: 'ri-user-line', label: 'Professores' },
        { path: '/research', icon: 'ri-flask-line', label: 'Pesquisas' },
        // { path: '/users', icon: 'ri-team-line', label: 'Usuários' },
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            {isOpen && onClose && (
                <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 transform ${
                    isCollapsed ? 'w-16' : 'w-64'
                } ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:h-auto`}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                                    <i className="ri-graduation-cap-line text-white"></i>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    AcadSys
                                </span>
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            >
                                <i
                                    className={`ri-menu-${isCollapsed ? 'unfold' : 'fold'}-line text-gray-600 dark:text-gray-400`}
                                ></i>
                            </button>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                                    aria-label="Fechar menu"
                                >
                                    <i className="ri-close-line text-gray-600 dark:text-gray-400"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="mt-8">
                    <ul className="space-y-2 px-4">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                        isActive(item.path)
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <i
                                        className={`${item.icon} text-lg ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                                    ></i>
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {!isCollapsed && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                                    <i className="ri-lightbulb-line text-white"></i>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100">
                                        Dica
                                    </h4>
                                    <p className="text-xs text-primary-700 dark:text-primary-300">
                                        Use os filtros para encontrar informações rapidamente
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
