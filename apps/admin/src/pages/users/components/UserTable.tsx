import { useState, useMemo } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    lastLogin: string;
    avatar: string;
}

interface UserTableProps {
    searchTerm: string;
    statusFilter: string;
    onEditUser: (user: User) => void;
}

export default function UserTable({ searchTerm, statusFilter, onEditUser }: UserTableProps) {
    const [users] = useState<User[]>([
        {
            id: 1,
            name: 'Ana Silva',
            email: 'ana.silva@empresa.com',
            role: 'Administrador',
            status: 'active',
            lastLogin: '2024-01-15 14:30',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20short%20brown%20hair%20wearing%20business%20attire%20in%20modern%20office%20setting%20with%20clean%20white%20background&width=40&height=40&seq=user1&orientation=squarish',
        },
        {
            id: 2,
            name: 'Carlos Santos',
            email: 'carlos.santos@empresa.com',
            role: 'Editor',
            status: 'active',
            lastLogin: '2024-01-15 10:15',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20with%20dark%20hair%20wearing%20business%20suit%20in%20modern%20office%20environment%20with%20clean%20white%20background&width=40&height=40&seq=user2&orientation=squarish',
        },
        {
            id: 3,
            name: 'Maria Oliveira',
            email: 'maria.oliveira@empresa.com',
            role: 'Usuário',
            status: 'inactive',
            lastLogin: '2024-01-10 16:45',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20long%20blonde%20hair%20wearing%20elegant%20blouse%20in%20modern%20workspace%20with%20clean%20white%20background&width=40&height=40&seq=user3&orientation=squarish',
        },
        {
            id: 4,
            name: 'João Pereira',
            email: 'joao.pereira@empresa.com',
            role: 'Editor',
            status: 'active',
            lastLogin: '2024-01-14 09:20',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20with%20beard%20wearing%20casual%20business%20attire%20in%20contemporary%20office%20setting%20with%20clean%20white%20background&width=40&height=40&seq=user4&orientation=squarish',
        },
        {
            id: 5,
            name: 'Fernanda Costa',
            email: 'fernanda.costa@empresa.com',
            role: 'Administrador',
            status: 'active',
            lastLogin: '2024-01-15 11:30',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20curly%20hair%20wearing%20modern%20business%20dress%20in%20sleek%20office%20environment%20with%20clean%20white%20background&width=40&height=40&seq=user5&orientation=squarish',
        },
        {
            id: 6,
            name: 'Roberto Lima',
            email: 'roberto.lima@empresa.com',
            role: 'Usuário',
            status: 'active',
            lastLogin: '2024-01-13 15:10',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20with%20glasses%20wearing%20button-up%20shirt%20in%20modern%20office%20space%20with%20clean%20white%20background&width=40&height=40&seq=user6&orientation=squarish',
        },
    ]);

    // Estados para seleção e paginação
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtrar usuários
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, statusFilter]);

    // Ordenar usuários
    const sortedUsers = useMemo(() => {
        return [...filteredUsers].sort((a, b) => {
            const aValue = a[sortField as keyof User];
            const bValue = b[sortField as keyof User];

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredUsers, sortField, sortDirection]);

    // Paginação
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedUsers.slice(startIndex, endIndex);

    // Funções de manipulação
    const handleSelectAll = () => {
        if (selectedItems.length === filteredUsers.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredUsers.map((user) => user.id));
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleBulkAction = (action: string) => {
        console.log(`Ação em lote: ${action} para usuários:`, selectedItems);
        // Implementar ações em lote aqui
        setSelectedItems([]);
    };

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const onEdit = (user: User) => {
        onEditUser(user);
    };

    const onDelete = (user: User) => {
        console.log('Excluir usuário:', user);
        // Implementar exclusão aqui
    };

    // Funções auxiliares
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return (
            date.toLocaleDateString('pt-BR') +
            ' ' +
            date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
    };

    const getRoleColor = (role: string) => {
        const colors = {
            Administrador:
                'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            Editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            Usuário: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        return (
            colors[role as keyof typeof colors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        );
    };

    const getRoleIcon = (role: string) => {
        const icons = {
            Administrador: 'ri-shield-star-line',
            Editor: 'ri-edit-line',
            Usuário: 'ri-user-line',
        };
        return icons[role as keyof typeof icons] || 'ri-user-line';
    };

    const getRoleText = (role: string) => {
        return role;
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    };

    const getStatusIcon = (status: string) => {
        return status === 'active' ? 'ri-check-line' : 'ri-close-line';
    };

    const getStatusText = (status: string) => {
        return status === 'active' ? 'Ativo' : 'Inativo';
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                    Ativo
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></div>
                Inativo
            </span>
        );
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            Administrador:
                'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            Editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            Usuário: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}
            >
                {role}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Cabeçalho da tabela */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                checked={
                                    selectedItems.length === filteredUsers.length &&
                                    filteredUsers.length > 0
                                }
                                onChange={handleSelectAll}
                            />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                {selectedItems.length > 0
                                    ? `${selectedItems.length} selecionados`
                                    : 'Selecionar todos'}
                            </span>
                        </div>

                        {selectedItems.length > 0 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleBulkAction('activate')}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 cursor-pointer whitespace-nowrap"
                                >
                                    <i className="ri-check-line mr-1"></i>
                                    Ativar
                                </button>
                                <button
                                    onClick={() => handleBulkAction('deactivate')}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 cursor-pointer whitespace-nowrap"
                                >
                                    <i className="ri-pause-line mr-1"></i>
                                    Desativar
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 cursor-pointer whitespace-nowrap"
                                >
                                    <i className="ri-delete-bin-line mr-1"></i>
                                    Excluir
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredUsers.length}{' '}
                            {filteredUsers.length === 1 ? 'usuário' : 'usuários'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <span className="sr-only">Seleção</span>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-1">
                                    Usuário
                                    {sortField === 'name' && (
                                        <i
                                            className={`ri-arrow-${sortDirection === 'asc' ? 'up' : 'down'}-line text-xs`}
                                        ></i>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleSort('role')}
                            >
                                <div className="flex items-center gap-1">
                                    Função
                                    {sortField === 'role' && (
                                        <i
                                            className={`ri-arrow-${sortDirection === 'asc' ? 'up' : 'down'}-line text-xs`}
                                        ></i>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-1">
                                    Status
                                    {sortField === 'status' && (
                                        <i
                                            className={`ri-arrow-${sortDirection === 'asc' ? 'up' : 'down'}-line text-xs`}
                                        ></i>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => handleSort('lastLogin')}
                            >
                                <div className="flex items-center gap-1">
                                    Último Acesso
                                    {sortField === 'lastLogin' && (
                                        <i
                                            className={`ri-arrow-${sortDirection === 'asc' ? 'up' : 'down'}-line text-xs`}
                                        ></i>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentItems.map((user) => (
                            <tr
                                key={user.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                    selectedItems.includes(user.id)
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : ''
                                }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                        checked={selectedItems.includes(user.id)}
                                        onChange={() => handleSelectItem(user.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-full object-cover"
                                                src={user.avatar}
                                                alt={user.name}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.nextElementSibling?.classList.remove(
                                                        'hidden'
                                                    );
                                                }}
                                            />
                                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center hidden">
                                                <i className="ri-user-line text-gray-600 dark:text-gray-300"></i>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                                    >
                                        <i className={`${getRoleIcon(user.role)} mr-1`}></i>
                                        {getRoleText(user.role)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                                    >
                                        <i className={`${getStatusIcon(user.status)} mr-1`}></i>
                                        {getStatusText(user.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded cursor-pointer"
                                            title="Editar"
                                        >
                                            <i className="ri-edit-line"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(user)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded cursor-pointer"
                                            title="Excluir"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)}{' '}
                            de {filteredUsers.length} resultados
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                            >
                                <i className="ri-arrow-left-line mr-1"></i>
                                Anterior
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum =
                                        Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange(pageNum)}
                                            className={`px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                                                currentPage === pageNum
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                            >
                                Próxima
                                <i className="ri-arrow-right-line ml-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
