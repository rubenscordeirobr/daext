
import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import AreasSection from './components/AreasSection';
import NewsSection from './components/NewsSection';
import StatsSection from './components/StatsSection';

const HomePage = () => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'DAEx - Departamento Acadêmico de Exatas | UTFPR Guarapuava';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Departamento Acadêmico de Exatas da UTFPR Guarapuava. Ensino, pesquisa e extensão em Matemática, Física e Química. Conheça nossos docentes, pesquisas e projetos de extensão.');
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'DAEx, UTFPR, Guarapuava, Matemática, Física, Química, pesquisa, ensino, extensão, universidade');
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/`);
    }

    // Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Departamento Acadêmico de Exatas - UTFPR Guarapuava",
      "alternateName": "DAEx",
      "url": `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/`,
      "description": "Departamento Acadêmico de Exatas da UTFPR Guarapuava, promovendo excelência em ensino, pesquisa e extensão nas áreas de Matemática, Física e Química.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Av. Professora Laura Pacheco Bastos, 800",
        "addressLocality": "Guarapuava",
        "addressRegion": "PR",
        "postalCode": "85053-525",
        "addressCountry": "BR"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "daext-gp@utfpr.edu.br"
      },
      "sameAs": [
        "https://www.utfpr.edu.br/"
      ],
      "department": [
        {
          "@type": "Organization",
          "name": "Departamento de Matemática",
          "description": "Ensino e pesquisa em Matemática Aplicada, Análise Numérica e Educação Matemática"
        },
        {
          "@type": "Organization", 
          "name": "Departamento de Física",
          "description": "Ensino e pesquisa em Física Teórica, Experimental e Aplicada"
        },
        {
          "@type": "Organization",
          "name": "Departamento de Química", 
          "description": "Ensino e pesquisa em Química Analítica, Orgânica e Físico-Química"
        }
      ]
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
        <HeroSection />
        <AreasSection />
        <StatsSection />
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
