import { useEffect } from 'react';

import Footer from '../../components/feature/Footer';
import Header from '../../components/feature/Header';
import NewsContent from './components/NewsContent';

const NewsPage = () => {
    useEffect(() => {
        document.title = 'Notícias - Departamento de Exatas | UTFPR Guarapuava';

        const siteUrl =
            (import.meta.env.VITE_SITE_URL as string | undefined) ||
            'https://daext.gp.utfpr.edu.br';

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Últimas notícias do Departamento Acadêmico de Exatas da UTFPR Guarapuava. Defesas, publicações, eventos e atividades de extensão em Matemática, Física e Química.'
            );
        }

        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute(
                'content',
                'notícias, eventos, defesas, publicações, DAEx, UTFPR, Guarapuava, extensão, semana acadêmica, mestrado, doutorado'
            );
        }

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', `${siteUrl}/news`);
        }

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Notícias - Departamento de Exatas',
            description: 'Últimas notícias do Departamento Acadêmico de Exatas da UTFPR Guarapuava',
            url: `${siteUrl}/news`,
            isPartOf: {
                '@type': 'WebSite',
                name: 'DAEx - UTFPR Guarapuava',
                url: `${siteUrl}/`,
            },
            about: {
                '@type': 'EducationalOrganization',
                name: 'Departamento Acadêmico de Exatas - UTFPR Guarapuava',
            },
            mainEntity: {
                '@type': 'ItemList',
                name: 'Lista de Notícias',
                description: 'Notícias e eventos do departamento',
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
                <NewsContent />
            </main>
            <Footer />
        </div>
    );
};

export default NewsPage;
