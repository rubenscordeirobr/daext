
import { Link } from 'react-router-dom';

const AreasSection = () => {
  const areas = [
    {
      title: 'Matemática',
      description: 'Pesquisas em álgebra, análise, geometria, matemática aplicada e educação matemática.',
      icon: 'ri-calculator-line',
      image: 'assets/images/areas/mathematics-lab.jpg',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Física',
      description: 'Estudos em física teórica, experimental, materiais, energia e fenômenos naturais.',
      icon: 'ri-atom-line',
      image: 'assets/images/areas/physics-lab.jpg',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Química',
      description: 'Pesquisas em química orgânica, inorgânica, analítica, físico-química e materiais.',
      icon: 'ri-test-tube-line',
      image: 'assets/images/areas/chemistry-lab.jpg',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Áreas de Atuação
          </h2>
          <p className="text-lg text-[#8d9199] max-w-3xl mx-auto">
            O DAEx desenvolve atividades de ensino, pesquisa e extensão em três grandes áreas do conhecimento científico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {areas.map((area, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={area.image}
                    alt={area.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${area.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${area.color} flex items-center justify-center mr-4`}>
                      <i className={`${area.icon} text-white text-xl`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-black">{area.title}</h3>
                  </div>
                  
                  <p className="text-[#8d9199] mb-6 leading-relaxed">
                    {area.description}
                  </p>
                  
                  <div className="flex space-x-3">
                    <Link
                      to="/docentes"
                      className="flex-1 bg-[#ffbf00] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e6ac00] transition-colors text-center whitespace-nowrap"
                    >
                      Ver Docentes
                    </Link>
                    <Link
                      to="/pesquisas"
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center whitespace-nowrap"
                    >
                      Ver Pesquisas
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AreasSection;
