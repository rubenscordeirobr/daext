import { useState, useEffect } from 'react';
import { getAssetPath } from '../../../utils/assetPath';
import {
    type ResearchProject,
    getResearchProjectStatusColor,
    AcademicAreaIcon,
    AcademicAreaList,
    getAreaDisplayName,
} from '@daext/domain';
import { ResearchClient } from '@daext/api-client';

const ResearchProjectContent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeArea, setActiveArea] = useState('all');
    const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
    const [loading, setLoading] = useState(true);

    const areas = [
        {
            id: 'all',
            displayName: 'Todos',
            icon: AcademicAreaIcon.All,
        },
        ...AcademicAreaList,
    ];
    const url = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
    const client = new ResearchClient({ baseUrl: url });

    useEffect(() => {
        const loadResearchProjects = async () => {
            try {
                const researchProjects = await client.list();
                setResearchProjects(researchProjects);
            } catch (error) {
                console.error('Erro ao carregar dados das pesquisas:', error);
            } finally {
                setLoading(false);
            }
        };

        void loadResearchProjects();
    }, []);

    const filteredPesquisas =
        activeArea === 'all'
            ? researchProjects
            : researchProjects.filter((pesquisa) => pesquisa.area === activeArea);

    if (loading) {
        return (
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#ffbf00] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <i className="ri-flask-line text-white text-2xl"></i>
                            </div>
                            <p className="text-[#8d9199] text-lg">
                                Carregando informações das pesquisas...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                        Pesquisas em Desenvolvimento
                    </h1>
                    activeCategory
                    <p className="text-lg text-[#8d9199] max-w-3xl mx-auto leading-relaxed">
                        Conheça os projetos de pesquisa desenvolvidos pelos docentes do DAEx,
                        contribuindo para o avanço do conhecimento científico nas áreas de
                        Matemática, Física e Química.
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {areas.map((area) => (
                        <button
                            key={area.id}
                            onClick={() => setActiveArea(area.id)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                                activeArea === area.id
                                    ? 'bg-[#ffbf00] text-black shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <i className={area.icon}></i>
                            </div>
                            <span>{area.displayName}</span>
                        </button>
                    ))}
                </div>

                {/* Grid de Pesquisas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredPesquisas.map((research, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={getAssetPath(research.imageUrl)}
                                    alt={research.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 left-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getResearchProjectStatusColor(research.status)}`}
                                    >
                                        {research.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-black mb-3 leading-tight">
                                    {research.title}
                                </h3>

                                <div className="mb-4">
                                    <p className="text-[#ffbf00] font-medium mb-2">
                                        Responsável: {research.supervisor}
                                    </p>
                                    <div className="text-sm text-[#8d9199]">
                                        <strong>Colaboradores:</strong>
                                        <ul className="mt-1 space-y-1">
                                            {research.collaborators?.map((colaborador, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <div className="w-1 h-1 bg-[#8d9199] rounded-full mr-2"></div>
                                                    {colaborador}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <p className="text-[#8d9199] text-sm leading-relaxed mb-4">
                                    {research.summary}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getResearchProjectStatusColor(research.status)}`}
                                    >
                                        {research.status}
                                    </span>
                                    <button className="text-[#ffbf00] hover:text-[#e6ac00] font-medium text-sm flex items-center space-x-1 transition-colors">
                                        <span>Saiba mais</span>
                                        <div className="w-4 h-4 flex items-center justify-center">
                                            <i className="ri-arrow-right-line"></i>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPesquisas.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-search-line text-gray-400 text-2xl"></i>
                        </div>
                        <p className="text-[#8d9199] text-lg">
                            Nenhuma pesquisa encontrada para esta área.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResearchProjectContent;
