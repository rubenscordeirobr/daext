import { Link } from 'react-router-dom';

const NewsSection = () => {
    const news = [
        {
            title: 'Defesa de Dissertação: Modelagem Matemática em Sistemas Dinâmicos',
            excerpt:
                'Aluno do programa de pós-graduação apresenta pesquisa sobre aplicações de equações diferenciais em fenômenos naturais.',
            date: '15 de Janeiro, 2024',
            category: 'Matemática',
            image: 'assets/images/news/defesa-dissertacao.jpg',
            categoryColor: 'bg-blue-100 text-blue-800',
        },
        {
            title: 'Publicação em Revista Internacional de Física',
            excerpt:
                'Pesquisa sobre propriedades ópticas de nanomateriais é aceita em periódico de alto impacto científico.',
            date: '10 de Janeiro, 2024',
            category: 'Física',
            image: 'assets/images/news/publicacao-revista.jpg',
            categoryColor: 'bg-green-100 text-green-800',
        },
        {
            title: 'Projeto de Extensão: Química na Escola',
            excerpt:
                'Docentes e alunos levam experimentos químicos para escolas públicas da região de Guarapuava.',
            date: '8 de Janeiro, 2024',
            category: 'Química',
            image: 'assets/images/news/projeto-extensao.jpg',
            categoryColor: 'bg-purple-100 text-purple-800',
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-16">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                            Últimas Notícias
                        </h2>
                        <p className="text-lg text-[#8d9199]">
                            Acompanhe as principais atividades e conquistas do departamento
                        </p>
                    </div>
                    <Link
                        to="/news"
                        className="hidden md:flex items-center space-x-2 bg-[#ffbf00] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#e6ac00] transition-colors whitespace-nowrap"
                    >
                        <span>Ver Todas</span>
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-arrow-right-line"></i>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <article
                            key={index}
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 left-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${item.categoryColor}`}
                                    >
                                        {item.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center text-sm text-[#8d9199] mb-3">
                                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                                        <i className="ri-calendar-line"></i>
                                    </div>
                                    <span>{item.date}</span>
                                </div>

                                <h3 className="text-lg font-bold text-black mb-3 leading-tight group-hover:text-[#ffbf00] transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-[#8d9199] text-sm leading-relaxed mb-4">
                                    {item.excerpt}
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

                <div className="text-center mt-12 md:hidden">
                    <Link
                        to="/news"
                        className="inline-flex items-center space-x-2 bg-[#ffbf00] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#e6ac00] transition-colors whitespace-nowrap"
                    >
                        <span>Ver Todas as Notícias</span>
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-arrow-right-line"></i>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
