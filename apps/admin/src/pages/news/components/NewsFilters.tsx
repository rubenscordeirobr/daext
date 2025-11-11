import type { NewsFilters } from '../../../types/news';
import { NewsArticleStatus } from '@daext/domain';

interface NewsFiltersProps {
    filters: NewsFilters;
    onFiltersChange: (filters: NewsFilters) => void;
}

export default function NewsFiltersComponent({ filters, onFiltersChange }: NewsFiltersProps) {
    const handleSearchChange = (search: string) => {
        onFiltersChange({ ...filters, search });
    };

    const handleStatusChange = (status: 'all' | NewsArticleStatus) => {
        onFiltersChange({ ...filters, status });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo de busca */}
                <div>
                    <label
                        htmlFor="search"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Buscar por título ou tags
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="ri-search-line text-gray-400 dark:text-gray-500"></i>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Digite para buscar..."
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filtro de status */}
                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Status
                    </label>
                    <div className="relative">
                        <select
                            id="status"
                            className="block w-full pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                            value={filters.status}
                            onChange={(e) =>
                                handleStatusChange(e.target.value as 'all' | NewsArticleStatus)
                            }
                        >
                            <option value="all">Todos os status</option>
                            <option value={NewsArticleStatus.Draft}>Rascunho</option>
                            <option value={NewsArticleStatus.Scheduled}>Agendado</option>
                            <option value={NewsArticleStatus.Published}>Publicado</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i className="ri-arrow-down-s-line text-gray-400 dark:text-gray-500"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
