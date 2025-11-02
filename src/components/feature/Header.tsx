
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAssetPath } from '../../utils/assetPath';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const navigation = [
    { name: 'Início', href: '/' },
    { 
      name: 'Docentes', 
      href: '/docentes',
      submenu: [
        { name: 'Matemática', href: '/docentes?area=matematica' },
        { name: 'Física', href: '/docentes?area=fisica' },
        { name: 'Química', href: '/docentes?area=quimica' }
      ]
    },
    { 
      name: 'Pesquisas', 
      href: '/pesquisas',
      submenu: [
        { name: 'Matemática', href: '/pesquisas?area=matematica' },
        { name: 'Física', href: '/pesquisas?area=fisica' },
        { name: 'Química', href: '/pesquisas?area=quimica' }
      ]
    },
    { name: 'Notícias', href: '/noticias' },
    { name: 'Contato', href: '/contato' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href.split('?')[0]);
  };

  const handleMouseEnter = (itemName: string) => {
    setActiveDropdown(itemName);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={getAssetPath("assets/images/utfpr-logo.png")}
              alt="UTFPR Logo" 
              className="h-12 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-black">DAEx</span>
              <span className="text-sm text-[#8d9199]">Departamento de Exatas - UTFPR Guarapuava</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-[#ffbf00] border-b-2 border-[#ffbf00]'
                      : 'text-gray-700 hover:text-[#ffbf00]'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.submenu && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-arrow-down-s-line text-xs"></i>
                    </div>
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.submenu && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ffbf00] transition-colors duration-200"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-[#ffbf00] hover:bg-gray-100"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => !item.submenu && setIsMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-[#ffbf00] bg-[#ffbf00]/10'
                        : 'text-gray-700 hover:text-[#ffbf00] hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.submenu && (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-arrow-down-s-line text-xs"></i>
                      </div>
                    )}
                  </Link>
                  
                  {/* Mobile Submenu */}
                  {item.submenu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-[#ffbf00] hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
