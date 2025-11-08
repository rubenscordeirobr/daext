export enum ResearchProjectStatus {
    Draft = 'draft',
    Active = 'active',
    Completed = 'completed',
    Archived = 'archived',
}

export enum ResearchProjectStatusIcon {
    Draft = 'ri-file-text-line',
    Active = 'ri-play-circle-line',
    Completed = 'ri-check-line',
    Archived = 'ri-archive-line',
}

export interface ResearchProjectStatusInfo {
    readonly id: ResearchProjectStatus;
    readonly displayName: string; // Portuguese label
    readonly icon: ResearchProjectStatusIcon;
}

type ResearchProjectStatusMap = Readonly<Record<ResearchProjectStatus, ResearchProjectStatusInfo>>;

export const ResearchProjectStatusData: ResearchProjectStatusMap = Object.freeze({
    [ResearchProjectStatus.Draft]: {
        id: ResearchProjectStatus.Draft,
        displayName: 'Rascunho',
        icon: ResearchProjectStatusIcon.Draft,
    },
    [ResearchProjectStatus.Active]: {
        id: ResearchProjectStatus.Active,
        displayName: 'Ativo',
        icon: ResearchProjectStatusIcon.Active,
    },
    [ResearchProjectStatus.Completed]: {
        id: ResearchProjectStatus.Completed,
        displayName: 'Concluído',
        icon: ResearchProjectStatusIcon.Completed,
    },
    [ResearchProjectStatus.Archived]: {
        id: ResearchProjectStatus.Archived,
        displayName: 'Arquivado',
        icon: ResearchProjectStatusIcon.Archived,
    },
});

export const ResearchProjectStatusList: ResearchProjectStatusInfo[] =
    Object.values(ResearchProjectStatusData);

export function getResearchProjectStatusDisplayName(status: ResearchProjectStatus): string {
    return ResearchProjectStatusData[status].displayName;
}

export function getResearchProjectStatusColor(status: ResearchProjectStatus): string {
    switch (status) {
        case ResearchProjectStatus.Draft:
            return 'bg-gray-200 text-gray-800';
        case ResearchProjectStatus.Active:
            return 'bg-green-200 text-green-800';
        case ResearchProjectStatus.Completed:
            return 'bg-blue-200 text-blue-800';
        case ResearchProjectStatus.Archived:
            return 'bg-yellow-200 text-yellow-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
}
