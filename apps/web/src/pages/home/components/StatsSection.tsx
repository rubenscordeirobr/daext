
const StatsSection = () => {
  const stats = [
    {
      number: '25+',
      label: 'Docentes Qualificados',
      icon: 'ri-user-star-line',
      description: 'Professores doutores e mestres'
    },
    {
      number: '15+',
      label: 'Projetos de Pesquisa',
      icon: 'ri-flask-line',
      description: 'Pesquisas em andamento'
    },
    {
      number: '3',
      label: 'Áreas de Conhecimento',
      icon: 'ri-book-open-line',
      description: 'Matemática, Física e Química'
    },
    {
      number: '500+',
      label: 'Alunos Atendidos',
      icon: 'ri-graduation-cap-line',
      description: 'Graduação e pós-graduação'
    }
  ];

  return (
    <section className="py-20 bg-[#fafdfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            DAEx em Números
          </h2>
          <p className="text-lg text-[#8d9199] max-w-2xl mx-auto">
            Dados que demonstram nosso compromisso com a excelência acadêmica e científica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-[#ffbf00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className={`${stat.icon} text-black text-2xl`}></i>
                </div>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-black mb-2">{stat.number}</div>
                  <h3 className="text-lg font-semibold text-black">{stat.label}</h3>
                </div>
                
                <p className="text-[#8d9199] text-sm">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
