export enum NewsCategory {
    All = 'all',
    Defenses = 'defenses',
    Publications = 'publications',
    Events = 'events',
    Extension = 'extension',
    Recognitions = 'recognitions',
}

export enum NewsCategoryIcon {
    All = 'ri-news-line',
    Defenses = 'ri-graduation-cap-line',
    Publications = 'ri-book-line',
    Events = 'ri-calendar-event-line',
    Extension = 'ri-community-line',
    Recognitions = 'ri-award-line',
}

export interface NewsCategoryInfo {
    id: NewsCategory;
    displayName: string;
    icon: NewsCategoryIcon;
    color: string;
}

type NewsCategoryMap = Readonly<Record<NewsCategory, NewsCategoryInfo>>;

export const CategoryData: NewsCategoryMap = Object.freeze({
    [NewsCategory.All]: {
        id: NewsCategory.All,
        displayName: 'All',
        icon: NewsCategoryIcon.All,
        color: 'bg-white text-gray-700',
    },
    [NewsCategory.Defenses]: {
        id: NewsCategory.Defenses,
        displayName: 'Defenses',
        icon: NewsCategoryIcon.Defenses,
        color: 'bg-blue-100 text-blue-800',
    },
    [NewsCategory.Publications]: {
        id: NewsCategory.Publications,
        displayName: 'Publications',
        icon: NewsCategoryIcon.Publications,
        color: 'bg-green-100 text-green-800',
    },
    [NewsCategory.Events]: {
        id: NewsCategory.Events,
        displayName: 'Events',
        icon: NewsCategoryIcon.Events,
        color: 'bg-purple-100 text-purple-800',
    },
    [NewsCategory.Extension]: {
        id: NewsCategory.Extension,
        displayName: 'Extension',
        icon: NewsCategoryIcon.Extension,
        color: 'bg-orange-100 text-orange-800',
    },
    [NewsCategory.Recognitions]: {
        id: NewsCategory.Recognitions,
        displayName: 'Recognitions',
        icon: NewsCategoryIcon.Recognitions,
        color: 'bg-yellow-100 text-yellow-800',
    },
});

export const NewsCategoryList: NewsCategoryInfo[] = Object.values(CategoryData);
