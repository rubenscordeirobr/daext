import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import DocentesContent from './components/DocentesContent';

const DocentesPage = () => {
    useEffect(() => {
        // SEO Meta Tags
        document.title = 'Docentes - Departamento de Exatas | UTFPR Guarapuava';

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Conheça os docentes do Departamento Acadêmico de Exatas da UTFPR Guarapuava. Professores especialistas em Matemática, Física e Química com formação em renomadas instituições.'
            );
        }

        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute(
                'content',
                'docentes, professores, DAEx, UTFPR, Guarapuava, Matemática, Física, Química, currículo lattes, pesquisadores'
            );
        }

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute(
                'href',
                `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br'}/docentes`
            );
        }

        // Structured Data
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Docentes - Departamento de Exatas',
            description:
                'Conheça os docentes do Departamento Acadêmico de Exatas da UTFPR Guarapuava',
            url: `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br/'}/docentes`,
            isPartOf: {
                '@type': 'WebSite',
                name: 'DAEx - UTFPR Guarapuava',
                url: `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br/'}/`,
            },
            about: {
                '@type': 'EducationalOrganization',
                name: 'Departamento Acadêmico de Exatas - UTFPR Guarapuava',
            },
            mainEntity: {
                '@type': 'ItemList',
                name: 'Lista de Docentes',
                description: 'Professores do Departamento Acadêmico de Exatas',
                numberOfItems: 15,
            },
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
                <DocentesContent />
            </main>
            <Footer />
        </div>
    );
};

export default DocentesPage;
