import { useState } from 'react';
import type { ResearchFilters } from '../../../types/research';
import { ResearchProjectStatusList, type ResearchProjectStatus } from '../../../types/research';
import type { AcademicArea } from '../../../types/professor';
import { AcademicAreaList } from '../../../types/professor';

interface ResearchFiltersProps {
    filters: ResearchFilters;
    onFiltersChange: (filters: ResearchFilters) => void;
}

export default function ResearchFiltersComponent({
    filters,
    onFiltersChange,
}: ResearchFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSearchChange = (search: string) => {
        onFiltersChange({ ...filters, search });
    };

    const handleAreaChange = (area: AcademicArea | 'all') => {
        onFiltersChange({ ...filters, area });
    };

    const handleStatusChange = (status: 'all' | ResearchProjectStatus) => {
        onFiltersChange({ ...filters, status });
    };

    const handleDateChange = (field: string, value: string) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            search: '',
            area: 'all',
            status: 'all',
            startDateFrom: '',
            startDateTo: '',
            endDateFrom: '',
            endDateTo: '',
        });
    };

    const hasActiveFilters =
        filters.search ||
        filters.area !== 'all' ||
        filters.status !== 'all' ||
        filters.startDateFrom ||
        filters.startDateTo ||
        filters.endDateFrom ||
        filters.endDateTo;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1">
                    <div className="relative">
                        <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Buscar por título, supervisor ou palavras-chave..."
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Área */}
                <div className="w-full lg:w-48">
                    <select
                        value={filters.area}
                        onChange={(e) => handleAreaChange(e.target.value as AcademicArea | 'all')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    >
                        <option value="all">Todas as áreas</option>
                        {AcademicAreaList.map((area) => (
                            <option key={area.id} value={area.id}>
                                {area.displayName}
                            </option>
                        ))}{' '}
                    </select>
                </div>

                {/* Status */}
                <div className="w-full lg:w-48">
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            handleStatusChange(e.target.value as 'all' | ResearchProjectStatus)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    >
                        <option value="all">Todos os status</option>
                        {ResearchProjectStatusList.map((status) => (
                            <option key={status.id} value={status.id}>
                                {status.displayName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap bg-white dark:bg-gray-800"
                    >
                        <i className={`ri-filter-${showAdvanced ? 'fill' : 'line'} mr-2`}></i>
                        Filtros
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer whitespace-nowrap bg-white dark:bg-gray-800"
                        >
                            <i className="ri-close-line mr-2"></i>
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros Avançados */}
            {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data início (de)
                            </label>
                            <input
                                type="date"
                                value={filters.startDateFrom || ''}
                                onChange={(e) => handleDateChange('startDateFrom', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data início (até)
                            </label>
                            <input
                                type="date"
                                value={filters.startDateTo || ''}
                                onChange={(e) => handleDateChange('startDateTo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data término (de)
                            </label>
                            <input
                                type="date"
                                value={filters.endDateFrom || ''}
                                onChange={(e) => handleDateChange('endDateFrom', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data término (até)
                            </label>
                            <input
                                type="date"
                                value={filters.endDateTo || ''}
                                onChange={(e) => handleDateChange('endDateTo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
