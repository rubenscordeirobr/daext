interface UserFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
}

export default function UserFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
}: UserFiltersProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <label
                        htmlFor="search"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Buscar usuários
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="ri-search-line text-gray-400 text-sm"></i>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Digite o nome ou email..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="lg:w-48">
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
                            value={statusFilter}
                            onChange={(e) => onStatusChange(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                {/* Role Filter */}
                <div className="lg:w-48">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                        Função
                    </label>
                    <div className="relative">
                        <select
                            id="role"
                            className="block w-full px-3 py-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white cursor-pointer"
                        >
                            <option value="all">Todas</option>
                            <option value="admin">Administrador</option>
                            <option value="editor">Editor</option>
                            <option value="user">Usuário</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                {/* Export Button */}
                <div className="lg:w-auto flex items-end">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer">
                        <i className="ri-download-line text-sm"></i>
                        Exportar
                    </button>
                </div>
            </div>
        </div>
    );
}
