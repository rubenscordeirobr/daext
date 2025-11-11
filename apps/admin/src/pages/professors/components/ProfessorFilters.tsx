import type { ProfessorFilters, AcademicArea } from '../../../types/professor';
import { AcademicAreaList } from '../../../types/professor';

interface ProfessorFiltersProps {
    filters: ProfessorFilters;
    onFiltersChange: (filters: ProfessorFilters) => void;
}

const areaOptions: { value: AcademicArea | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas as áreas' },
    ...AcademicAreaList.map((area) => ({
        value: area.id,
        label: area.displayName,
    })),
];

export default function ProfessorFiltersComponent({
    filters,
    onFiltersChange,
}: ProfessorFiltersProps) {
    const handleSearchChange = (search: string) => {
        onFiltersChange({ ...filters, search });
    };

    const handleAreaChange = (area: AcademicArea | 'all') => {
        onFiltersChange({ ...filters, area });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo de busca */}
                <div>
                    <label
                        htmlFor="search"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Buscar professores
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="ri-search-line text-gray-400 dark:text-gray-500 text-sm"></i>
                        </div>
                        <input
                            id="search"
                            type="text"
                            placeholder="Buscar por nome ou especialização..."
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Filtro por área */}
                <div>
                    <label
                        htmlFor="area"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Área acadêmica
                    </label>
                    <div className="relative">
                        <select
                            id="area"
                            value={filters.area}
                            onChange={(e) =>
                                handleAreaChange(e.target.value as AcademicArea | 'all')
                            }
                            className="block w-full pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                        >
                            {areaOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i className="ri-arrow-down-s-line text-gray-400 dark:text-gray-500 text-sm"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
