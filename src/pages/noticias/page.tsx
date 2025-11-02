
import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import NoticiasContent from './components/NoticiasContent';

const NoticiasPage = () => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'Notícias - Departamento de Exatas | UTFPR Guarapuava';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Últimas notícias do Departamento Acadêmico de Exatas da UTFPR Guarapuava. Defesas, publicações, eventos e atividades de extensão em Matemática, Física e Química.');
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'notícias, eventos, defesas, publicações, DAEx, UTFPR, Guarapuava, extensão, semana acadêmica, mestrado, doutorado');
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/noticias`);
    }

    // Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Notícias - Departamento de Exatas",
      "description": "Últimas notícias do Departamento Acadêmico de Exatas da UTFPR Guarapuava",
      "url": `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/noticias`,
      "isPartOf": {
        "@type": "WebSite",
        "name": "DAEx - UTFPR Guarapuava",
        "url": `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/`
      },
      "about": {
        "@type": "EducationalOrganization",
        "name": "Departamento Acadêmico de Exatas - UTFPR Guarapuava"
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Lista de Notícias",
        "description": "Notícias e eventos do departamento",
        "numberOfItems": 8
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafdfd]">
      <Header />
      <main>
        <NoticiasContent />
      </main>
      <Footer />
    </div>
  );
};

export default NoticiasPage;
