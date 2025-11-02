
import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import PesquisasContent from './components/PesquisasContent';

const PesquisasPage = () => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'Pesquisas - Departamento de Exatas | UTFPR Guarapuava';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Projetos de pesquisa do Departamento Acadêmico de Exatas da UTFPR Guarapuava. Linhas de pesquisa em Matemática Aplicada, Física Experimental e Química Analítica.');
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'pesquisas, projetos, DAEx, UTFPR, Guarapuava, Matemática Aplicada, Física Experimental, Química Analítica, iniciação científica');
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/pesquisas`);
    }

    // Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Pesquisas - Departamento de Exatas",
      "description": "Projetos de pesquisa do Departamento Acadêmico de Exatas da UTFPR Guarapuava",
      "url": `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/pesquisas`,
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
        "name": "Projetos de Pesquisa",
        "description": "Linhas de pesquisa em Matemática, Física e Química",
        "numberOfItems": 12
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
        <PesquisasContent />
      </main>
      <Footer />
    </div>
  );
};

export default PesquisasPage;
