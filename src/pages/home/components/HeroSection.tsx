
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('assets/images/hero-bg.jpg')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Departamento Acadêmico de <span className="text-[#ffbf00]">Exatas</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            UTFPR - Campus Guarapuava
          </p>
          <p className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Promovendo excelência em ensino, pesquisa e extensão nas áreas de Matemática, Física e Química. 
            Conectando conhecimento científico com inovação tecnológica para transformar o futuro.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/docentes"
              className="bg-[#ffbf00] text-black px-8 py-4 rounded-lg font-semibold hover:bg-[#e6ac00] transition-colors duration-300 whitespace-nowrap"
            >
              Conheça Nossos Docentes
            </Link>
            <Link
              to="/pesquisas"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-300 whitespace-nowrap"
            >
              Explore Nossas Pesquisas
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-arrow-down-line text-white text-2xl"></i>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
