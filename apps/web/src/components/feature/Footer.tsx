import { getAssetPath } from '../../utils/assetPath';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo e Descrição */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src={getAssetPath('assets/images/utfpr-logo.png')}
                                alt="UTFPR Logo"
                                className="h-10 w-auto"
                            />
                            <div>
                                <h3 className="text-lg font-bold">DAEx</h3>
                                <p className="text-sm text-gray-300">
                                    Departamento de Exatas - UTFPR Guarapuava
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Departamento Acadêmico de Exatas da Universidade Tecnológica Federal do
                            Paraná - Campus Guarapuava
                        </p>
                    </div>

                    {/* Links Rápidos */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Links Rápidos</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/docentes"
                                    className="text-gray-300 hover:text-[#ffbf00] transition-colors"
                                >
                                    Docentes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/pesquisas"
                                    className="text-gray-300 hover:text-[#ffbf00] transition-colors"
                                >
                                    Pesquisas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/news"
                                    className="text-gray-300 hover:text-[#ffbf00] transition-colors"
                                >
                                    Notícias
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contato"
                                    className="text-gray-300 hover:text-[#ffbf00] transition-colors"
                                >
                                    Contato
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contato */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Contato</h4>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                    <i className="ri-mail-line text-[#ffbf00]"></i>
                                </div>
                                <span className="text-gray-300 text-sm">daext-gp@utfpr.edu.br</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                    <i className="ri-map-pin-line text-[#ffbf00]"></i>
                                </div>
                                <span className="text-gray-300 text-sm">
                                    Av. Professora Laura Pacheco Bastos, 800
                                    <br />
                                    Bairro Industrial - Guarapuava/PR
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © 2026 DAEx - UTFPR Guarapuava. Todos os direitos reservados.
                    </p>
                    <a
                        href="https://rubenscordeirobr.github.io/"
                        className="text-gray-400 hover:text-[#ffbf00] text-sm transition-colors mt-2 md:mt-0"
                    >
                        Desenvolvido por Rubens Cordeiro
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
