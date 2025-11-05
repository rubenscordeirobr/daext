
import { useState } from 'react';

const ContatoContent = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    debugger; // This will pause execution when this function is called
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await fetch('/api/post-contact-message', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          assunto: '',
          mensagem: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: 'ri-mail-line',
      title: 'E-mail',
      content: 'daext-gp@utfpr.edu.br',
      description: 'Envie sua mensagem para nosso e-mail institucional'
    },
    {
      icon: 'ri-map-pin-line',
      title: 'Endereço',
      content: 'Av. Professora Laura Pacheco Bastos, 800',
      description: 'Bairro Industrial - Guarapuava/PR'
    },
    {
      icon: 'ri-time-line',
      title: 'Horário de Funcionamento',
      content: 'Segunda a Sexta: 8h às 18h',
      description: 'Atendimento presencial e por telefone'
    },
    {
      icon: 'ri-phone-line',
      title: 'Telefone',
      content: '(42) 3629-8000',
      description: 'Central telefônica da UTFPR Guarapuava'
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Entre em Contato
          </h1>
          <p className="text-lg text-[#8d9199] max-w-3xl mx-auto leading-relaxed">
            Estamos aqui para esclarecer suas dúvidas, fornecer informações sobre nossos cursos e pesquisas, 
            ou estabelecer parcerias acadêmicas. Entre em contato conosco!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações de Contato */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">
                Informações de Contato
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#ffbf00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${info.icon} text-black text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-1">{info.title}</h3>
                      <p className="text-black font-medium mb-1">{info.content}</p>
                      <p className="text-[#8d9199] text-sm">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <h3 className="text-xl font-bold text-black mb-4">Localização</h3>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.1234567890123!2d-51.4567890123456!3d-25.3901234567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sUTFPR%20Guarapuava!5e0!3m2!1spt!2sbr!4v1234567890123!5m2!1spt!2sbr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização UTFPR Guarapuava"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-black mb-6">
              Envie sua Mensagem
            </h2>
            
            <form onSubmit={handleSubmit} data-form id="contato-daex">
              <div className="space-y-6">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-black mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbf00] focus:border-transparent text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbf00] focus:border-transparent text-sm"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-black mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbf00] focus:border-transparent text-sm"
                    placeholder="(42) 99999-9999"
                  />
                </div>

                <div>
                  <label htmlFor="assunto" className="block text-sm font-medium text-black mb-2">
                    Assunto *
                  </label>
                  <select
                    id="assunto"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbf00] focus:border-transparent text-sm pr-8"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="informacoes-gerais">Informações Gerais</option>
                    <option value="pesquisa">Pesquisa e Pós-graduação</option>
                    <option value="graduacao">Graduação</option>
                    <option value="extensao">Projetos de Extensão</option>
                    <option value="parcerias">Parcerias Acadêmicas</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium text-black mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    required
                    maxLength={500}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbf00] focus:border-transparent text-sm resize-none"
                    placeholder="Descreva sua dúvida ou solicitação..."
                  ></textarea>
                  <p className="text-xs text-[#8d9199] mt-1">
                    Máximo de 500 caracteres ({formData.mensagem.length}/500)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || formData.mensagem.length > 500}
                  className="w-full bg-[#ffbf00] text-black py-3 px-6 rounded-lg font-semibold hover:bg-[#e6ac00] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-check-line"></i>
                      </div>
                      <span>Mensagem enviada com sucesso! Entraremos em contato em breve.</span>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-error-warning-line"></i>
                      </div>
                      <span>Erro ao enviar mensagem. Tente novamente ou entre em contato por e-mail.</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContatoContent;
