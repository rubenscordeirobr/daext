
import { useState, useEffect } from 'react';

interface Docente {
  nome: string;
  area: string;
  titulacao: string;
  especializacao: string;
  lattes: string;
  orcid: string;
  foto: string;
}

const DocentesContent = () => {
  const [activeArea, setActiveArea] = useState('todos');
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);

  const areas = [
    { id: 'todos', name: 'Todos', icon: 'ri-team-line' },
    { id: 'Matemática', name: 'Matemática', icon: 'ri-calculator-line' },
    { id: 'Física', name: 'Física', icon: 'ri-atom-line' },
    { id: 'Química', name: 'Química', icon: 'ri-test-tube-line' }
  ];

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const response = await fetch('/data/docentes.json');
        const data = await response.json();
        setDocentes(data);
      } catch (error) {
        console.error('Erro ao carregar dados dos docentes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocentes();
  }, []);

  const filteredDocentes = activeArea === 'todos' 
    ? docentes 
    : docentes.filter(docente => docente.area === activeArea);

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffbf00] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="ri-team-line text-white text-2xl"></i>
              </div>
              <p className="text-[#8d9199] text-lg">Carregando informações dos docentes...</p>
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
            Nossos Docentes
          </h1>
          <p className="text-lg text-[#8d9199] max-w-3xl mx-auto leading-relaxed">
            Conheça os professores qualificados que compõem o Departamento Acadêmico de Exatas, 
            com formação sólida e experiência em suas respectivas áreas de atuação.
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
              <span>{area.name}</span>
            </button>
          ))}
        </div>

        {/* Grid de Docentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocentes.map((docente, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={docente.foto}
                  alt={docente.nome}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-black mb-2">{docente.nome}</h3>
                <p className="text-[#ffbf00] font-medium mb-3">{docente.titulacao}</p>
                <p className="text-[#8d9199] text-sm mb-6 leading-relaxed">{docente.especializacao}</p>
                
                <div className="flex space-x-3">
                  <a
                    href={docente.lattes}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#ffbf00] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e6ac00] transition-colors text-center whitespace-nowrap"
                  >
                    Currículo Lattes
                  </a>
                  {docente.orcid && (
                    <a
                      href={`https://orcid.org/${docente.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center whitespace-nowrap"
                    >
                      ORCID
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocentes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-search-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-[#8d9199] text-lg">Nenhum docente encontrado para esta área.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocentesContent;
