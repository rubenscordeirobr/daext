
import { useState, useEffect } from 'react';
import { getAssetPath } from '../../../utils/assetPath';

interface Noticia {
  titulo: string;
  categoria: string;
  data: string;
  resumo: string;
  conteudo: string;
  imagem: string;
  categoryColor: string;
}

const NoticiasContent = () => {
  const [activeCategory, setActiveCategory] = useState('todas');
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<Noticia | null>(null);

  const categories = [
    { id: 'todas', name: 'Todas', icon: 'ri-news-line' },
    { id: 'defesas', name: 'Defesas', icon: 'ri-graduation-cap-line' },
    { id: 'publicacoes', name: 'Publicações', icon: 'ri-book-line' },
    { id: 'eventos', name: 'Eventos', icon: 'ri-calendar-event-line' },
    { id: 'extensao', name: 'Extensão', icon: 'ri-community-line' },
    { id: 'reconhecimentos', name: 'Reconhecimentos', icon: 'ri-award-line' }
  ];

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const response = await fetch(getAssetPath('data/noticias.json'));
        const data = await response.json();
        setNoticias(data);
      } catch (error) {
        console.error('Erro ao carregar dados das notícias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  const filteredNoticias = activeCategory === 'todas' 
    ? noticias 
    : noticias.filter(noticia => noticia.categoria === activeCategory);

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffbf00] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="ri-news-line text-white text-2xl"></i>
              </div>
              <p className="text-[#8d9199] text-lg">Carregando notícias...</p>
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
            Notícias e Eventos
          </h1>
          <p className="text-lg text-[#8d9199] max-w-3xl mx-auto leading-relaxed">
            Acompanhe as principais atividades, conquistas e eventos do Departamento Acadêmico de Exatas. 
            Fique por dentro das novidades em ensino, pesquisa e extensão.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-[#ffbf00] text-black shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={category.icon}></i>
              </div>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Grid de Notícias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNoticias.map((noticia, index) => (
            <article 
              key={index} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
              onClick={() => setSelectedNews(noticia)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getAssetPath(noticia.imagem)}
                  alt={noticia.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${noticia.categoryColor}`}>
                    {categories.find(cat => cat.id === noticia.categoria)?.name}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-[#8d9199] mb-3">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-calendar-line"></i>
                  </div>
                  <span>{noticia.data}</span>
                </div>
                
                <h3 className="text-lg font-bold text-black mb-3 leading-tight group-hover:text-[#ffbf00] transition-colors">
                  {noticia.titulo}
                </h3>
                
                <p className="text-[#8d9199] text-sm leading-relaxed mb-4">
                  {noticia.resumo}
                </p>
                
                <div className="flex items-center text-[#ffbf00] font-medium text-sm group-hover:text-[#e6ac00] transition-colors">
                  <span>Leia mais</span>
                  <div className="w-4 h-4 flex items-center justify-center ml-2 group-hover:translate-x-1 transition-transform">
                    <i className="ri-arrow-right-line"></i>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredNoticias.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-news-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-[#8d9199] text-lg">Nenhuma notícia encontrada para esta categoria.</p>
          </div>
        )}

        {/* Modal de Notícia */}
        {selectedNews && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="relative flex-shrink-0">
                <img
                  src={getAssetPath(selectedNews.imagem)}
                  alt={selectedNews.titulo}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedNews.categoryColor}`}>
                    {categories.find(cat => cat.id === selectedNews.categoria)?.name}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center text-sm text-[#8d9199] mb-4">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-calendar-line"></i>
                  </div>
                  <span>{selectedNews.data}</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-6 leading-tight">
                  {selectedNews.titulo}
                </h2>
                
                <div className="prose prose-lg max-w-none">
                  <div className="text-[#8d9199] leading-relaxed text-base space-y-4">
                    {selectedNews.conteudo.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticiasContent;
