import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NewsArticleStatus } from '@daext/domain';
import type { NewsArticle } from '../../../types/news';
import { ServiceNewsMock } from '../../../services/NewsService';
import ReactQuill from 'react-quill';
import type ReactQuillType from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface NewsModalProps {
    isOpen: boolean;
    article?: NewsArticle | null;
    onClose: () => void;
    onSave: () => void;
    onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const toLocalDateTimeInput = (isoString: string | null): string => {
    if (!isoString) {
        return '';
    }

    const date = new Date(isoString);
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
};

const toIsoDateTime = (value: string): string | null => {
    if (!value) {
        return null;
    }
    return new Date(value).toISOString();
};

export default function NewsModal({
    isOpen,
    article,
    onClose,
    onSave,
    onShowToast,
}: NewsModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        body: '',
        tags: [] as string[],
        status: NewsArticleStatus.Draft,
        publishedAt: '',
        author: 'Usuário Atual',
    });

    const [tagInput, setTagInput] = useState('');
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const modalRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const quillRef = useRef<ReactQuillType | null>(null);

    const isEditing = article && article.id;

    useEffect(() => {
        if (isOpen) {
            if (article && article.id) {
                setFormData({
                    title: article.title,
                    slug: article.slug,
                    summary: article.summary,
                    body: article.body,
                    tags: [...article.tags],
                    status: article.status,
                    publishedAt: toLocalDateTimeInput(article.publishedAt),
                    author: article.author ?? 'Usuário Atual',
                });
                setIsSlugManuallyEdited(true);
            } else {
                setFormData({
                    title: '',
                    slug: '',
                    summary: '',
                    body: '',
                    tags: [],
                    status: NewsArticleStatus.Draft,
                    publishedAt: '',
                    author: 'Usuário Atual',
                });
                setIsSlugManuallyEdited(false);
            }
            setErrors({});
            setShowPreview(false);
            setIsFullscreen(false);

            // Focus no título após um pequeno delay
            setTimeout(() => {
                titleInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, article]);

    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape' && !isFullscreen) {
                    onClose();
                } else if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    // Nova notícia - já está sendo tratado pelo componente pai
                } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSave();
                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handlePublish();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, isFullscreen, formData]);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleTitleChange = (title: string) => {
        setFormData((prev) => ({ ...prev, title }));

        if (!isSlugManuallyEdited) {
            const newSlug = generateSlug(title);
            setFormData((prev) => ({ ...prev, slug: newSlug }));
        }
    };

    const handleSlugChange = (slug: string) => {
        setIsSlugManuallyEdited(true);
        setFormData((prev) => ({ ...prev, slug }));
    };

    const handleAddTag = () => {
        if (
            tagInput.trim() &&
            !formData.tags.includes(tagInput.trim()) &&
            formData.tags.length < 8
        ) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleBodyChange = (body: string) => {
        setFormData((prev) => ({ ...prev, body }));

        // Contar palavras
        const text = body.replace(/<[^>]*>/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        setWordCount(words);
    };

    const handleImageUpload = useCallback(
        async (file: File): Promise<string> => {
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = (e.target?.result as string) ?? '';
                    resolve(result);
                    onShowToast('Imagem carregada com sucesso', 'success');
                };
                reader.readAsDataURL(file);
            });
        },
        [onShowToast]
    );

    const handleInsertImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const url = await handleImageUpload(file);
            if (!url) return;
            const editor = quillRef.current?.getEditor();
            if (!editor) return;
            const range = editor.getSelection(true);
            const index = range?.index ?? editor.getLength();
            editor.insertEmbed(index, 'image', url, 'user');
            editor.setSelection(index + 1);
        };
        input.click();
    }, [handleImageUpload]);

    const quillModules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    ['link', 'image', 'code-block'],
                    ['clean'],
                ],
                handlers: {
                    image: handleInsertImage,
                },
            },
            clipboard: {
                matchVisual: false,
            },
        }),
        [handleInsertImage]
    );

    const quillFormats = useMemo(
        () => [
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'blockquote',
            'list',
            'bullet',
            'link',
            'image',
            'code-block',
            'color',
            'background',
            'align',
        ],
        []
    );

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Título é obrigatório';
        } else if (formData.title.length < 4 || formData.title.length > 140) {
            newErrors.title = 'Título deve ter entre 4 e 140 caracteres';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug é obrigatório';
        }

        if (!formData.summary.trim()) {
            newErrors.summary = 'Resumo é obrigatório';
        } else if (formData.summary.length < 30 || formData.summary.length > 400) {
            newErrors.summary = 'Resumo deve ter entre 30 e 400 caracteres';
        }

        if (formData.status === NewsArticleStatus.Scheduled && !formData.publishedAt) {
            newErrors.publishedAt = 'Data de publicação é obrigatória para status Agendado';
        } else if (formData.status === NewsArticleStatus.Scheduled && formData.publishedAt) {
            const publishDate = new Date(formData.publishedAt);
            if (publishDate <= new Date()) {
                newErrors.publishedAt = 'Data de publicação deve ser futura para status Agendado';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            onShowToast('Por favor, corrija os erros no formulário', 'error');
            return;
        }

        setSaving(true);
        try {
            // Verificar unicidade do slug
            const isUnique = await ServiceNewsMock.isSlugUnique(formData.slug, article?.id);
            if (!isUnique) {
                setErrors((prev) => ({ ...prev, slug: 'Este slug já está em uso' }));
                onShowToast('Slug já está em uso', 'error');
                setSaving(false);
                return;
            }

            const { author: _author, ...newsPayload } = formData;
            const articleData = {
                ...newsPayload,
                publishedAt: toIsoDateTime(formData.publishedAt),
            };

            if (isEditing) {
                await ServiceNewsMock.update(article.id, articleData);
                onShowToast('Alterações salvas', 'success');
            } else {
                await ServiceNewsMock.create(articleData);
                onShowToast('Notícia criada com sucesso', 'success');
            }

            onSave();
            onClose();
        } catch (error) {
            onShowToast('Erro ao salvar notícia', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        const publishData = {
            ...formData,
            status: NewsArticleStatus.Published,
            publishedAt: formData.publishedAt || new Date().toISOString().slice(0, 16),
        };

        setFormData(publishData);

        // Aguardar um tick para o estado ser atualizado
        setTimeout(async () => {
            if (!validateForm()) {
                onShowToast('Por favor, corrija os erros no formulário', 'error');
                return;
            }

            setSaving(true);
            try {
                const isUnique = await ServiceNewsMock.isSlugUnique(publishData.slug, article?.id);
                if (!isUnique) {
                    setErrors((prev) => ({ ...prev, slug: 'Este slug já está em uso' }));
                    onShowToast('Slug já está em uso', 'error');
                    setSaving(false);
                    return;
                }

                const { author: _publishAuthor, ...publishPayload } = publishData;
                const articleData = {
                    ...publishPayload,
                    publishedAt: toIsoDateTime(publishData.publishedAt),
                };

                if (isEditing) {
                    await ServiceNewsMock.update(article.id, articleData);
                } else {
                    await ServiceNewsMock.create(articleData);
                }

                onShowToast('Notícia publicada com sucesso', 'success');
                onSave();
                onClose();
            } catch (error) {
                onShowToast('Erro ao publicar notícia', 'error');
            } finally {
                setSaving(false);
            }
        }, 0);
    };

    const handleSchedule = async () => {
        if (!formData.publishedAt) {
            onShowToast('Selecione uma data para agendar a publicação', 'info');
            return;
        }

        const scheduleData = {
            ...formData,
            status: NewsArticleStatus.Scheduled,
        };

        setFormData(scheduleData);

        setTimeout(async () => {
            if (!validateForm()) {
                onShowToast('Por favor, corrija os erros no formulário', 'error');
                return;
            }

            setSaving(true);
            try {
                const isUnique = await ServiceNewsMock.isSlugUnique(scheduleData.slug, article?.id);
                if (!isUnique) {
                    setErrors((prev) => ({ ...prev, slug: 'Este slug já está em uso' }));
                    onShowToast('Slug já está em uso', 'error');
                    setSaving(false);
                    return;
                }

                const { author: _scheduleAuthor, ...schedulePayload } = scheduleData;
                const articleData = {
                    ...schedulePayload,
                    publishedAt: toIsoDateTime(scheduleData.publishedAt),
                };

                if (isEditing) {
                    await ServiceNewsMock.update(article.id, articleData);
                } else {
                    await ServiceNewsMock.create(articleData);
                }

                const publishDate = new Date(scheduleData.publishedAt).toLocaleDateString('pt-BR');
                onShowToast(`Publicação agendada para ${publishDate}`, 'success');
                onSave();
                onClose();
            } catch (error) {
                onShowToast('Erro ao agendar notícia', 'error');
            } finally {
                setSaving(false);
            }
        }, 0);
    };

    const getReadingTime = () => {
        const wordsPerMinute = 200;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div
                    ref={modalRef}
                    className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${
                        isFullscreen ? 'w-full h-full max-w-none' : 'sm:max-w-6xl sm:w-full'
                    }`}
                >
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    title="Tela cheia"
                                >
                                    <i
                                        className={`${isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}`}
                                    ></i>
                                </button>
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    title="Prévia"
                                >
                                    <i
                                        className={`${showPreview ? 'ri-eye-off-line' : 'ri-eye-line'}`}
                                    ></i>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div
                        className={`${isFullscreen ? 'h-full' : 'max-h-[80vh]'} overflow-y-auto bg-white dark:bg-gray-800`}
                    >
                        <div
                            className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6 p-6`}
                        >
                            {/* Form */}
                            <div className="space-y-6">
                                {/* Título */}
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Título *
                                    </label>
                                    <input
                                        ref={titleInputRef}
                                        type="text"
                                        id="title"
                                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.title
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Digite o título da notícia"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.title}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {formData.title.length}/140 caracteres
                                    </p>
                                </div>

                                {/* Slug */}
                                <div>
                                    <label
                                        htmlFor="slug"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        id="slug"
                                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.slug
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="url-da-noticia"
                                        value={formData.slug}
                                        onChange={(e) => handleSlugChange(e.target.value)}
                                    />
                                    {errors.slug && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>

                                {/* Resumo */}
                                <div>
                                    <label
                                        htmlFor="summary"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Resumo *
                                    </label>
                                    <textarea
                                        id="summary"
                                        rows={3}
                                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                            errors.summary
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Escreva um resumo da notícia"
                                        value={formData.summary}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                summary: e.target.value,
                                            }))
                                        }
                                    />
                                    {errors.summary && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.summary}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {formData.summary.length}/400 caracteres
                                    </p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tags (máx. 8)
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
                                                >
                                                    <i className="ri-close-line text-xs"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    {formData.tags.length < 8 && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="Digite uma tag e pressione Enter"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagInputKeyDown}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddTag}
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Status e Data */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="status"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="status"
                                                className="block w-full pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        status: e.target.value as any,
                                                    }))
                                                }
                                            >
                                                <option value={NewsArticleStatus.Draft}>
                                                    Rascunho
                                                </option>
                                                <option value={NewsArticleStatus.Scheduled}>
                                                    Agendado
                                                </option>
                                                <option value={NewsArticleStatus.Published}>
                                                    Publicado
                                                </option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <i className="ri-arrow-down-s-line text-gray-400 dark:text-gray-500"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {(formData.status === NewsArticleStatus.Scheduled ||
                                        formData.status === NewsArticleStatus.Published) && (
                                        <div>
                                            <label
                                                htmlFor="publishedAt"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Data de Publicação *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                id="publishedAt"
                                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                                    errors.publishedAt
                                                        ? 'border-red-300 dark:border-red-600'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                                value={formData.publishedAt}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        publishedAt: e.target.value,
                                                    }))
                                                }
                                            />
                                            {errors.publishedAt && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.publishedAt}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Editor */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Conteúdo
                                        </label>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {wordCount} palavras • {getReadingTime()} min de leitura
                                        </div>
                                    </div>
                                    <div className="quill-editor-wrapper">
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={formData.body}
                                            onChange={handleBodyChange}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            placeholder="Escreva o conteúdo da sua notícia..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            {showPreview && (
                                <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Prévia
                                    </h4>
                                    <div className="prose max-w-none dark:prose-invert">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {formData.title || 'Título da notícia'}
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            {formData.summary || 'Resumo da notícia'}
                                        </p>
                                        {formData.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {formData.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div
                                            className="prose-content dark:prose-invert"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    formData.body ||
                                                    '<p>Conteúdo da notícia aparecerá aqui...</p>',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                    Ctrl+S
                                </kbd>{' '}
                                Salvar •
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs ml-1">
                                    Ctrl+Enter
                                </kbd>{' '}
                                Publicar •
                                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs ml-1">
                                    Esc
                                </kbd>{' '}
                                Fechar
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 whitespace-nowrap cursor-pointer"
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 whitespace-nowrap cursor-pointer"
                                    disabled={saving}
                                >
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                                {formData.status !== NewsArticleStatus.Published && (
                                    <button
                                        type="button"
                                        onClick={handleSchedule}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-gray-800 whitespace-nowrap cursor-pointer"
                                        disabled={saving}
                                    >
                                        {saving ? 'Agendando...' : 'Agendar'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handlePublish}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 whitespace-nowrap cursor-pointer"
                                    disabled={saving}
                                >
                                    {saving ? 'Publicando...' : 'Publicar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
