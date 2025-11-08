import { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import ContatContent from './components/ContatContent';

const ContatoPage = () => {
    useEffect(() => {
        // SEO Meta Tags
        document.title = 'Contato - Departamento de Exatas | UTFPR Guarapuava';

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Entre em contato com o Departamento Acadêmico de Exatas da UTFPR Guarapuava. Endereço, telefone, e-mail e formulário de contato para dúvidas e informações.'
            );
        }

        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute(
                'content',
                'contato, endereço, telefone, email, DAEx, UTFPR, Guarapuava, localização, formulário'
            );
        }

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute(
                'href',
                `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br/'}/contato`
            );
        }

        // Structured Data
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contato - Departamento de Exatas',
            description:
                'Entre em contato com o Departamento Acadêmico de Exatas da UTFPR Guarapuava',
            url: `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br/'}/contato`,
            isPartOf: {
                '@type': 'WebSite',
                name: 'DAEx - UTFPR Guarapuava',
                url: `${import.meta.env.VITE_SITE_URL || 'https://daext.gp.utfpr.edu.br/'}/`,
            },
            about: {
                '@type': 'EducationalOrganization',
                name: 'Departamento Acadêmico de Exatas - UTFPR Guarapuava',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Av. Professora Laura Pacheco Bastos, 800',
                    addressLocality: 'Guarapuava',
                    addressRegion: 'PR',
                    postalCode: '85053-525',
                    addressCountry: 'BR',
                },
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    email: 'daext-gp@utfpr.edu.br',
                },
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
                <ContatContent />
            </main>
            <Footer />
        </div>
    );
};

export default ContatoPage;
