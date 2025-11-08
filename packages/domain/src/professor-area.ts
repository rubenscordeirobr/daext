export enum ProfessorArea {
    Math = 'math',
    Physics = 'physics',
    Chemistry = 'chemistry',
}

export enum ProfessorAreaIcon {
    All = 'ri-team-line',
    Math = 'ri-calculator-line',
    Physics = 'ri-atom-line',
    Chemistry = 'ri-test-tube-line',
}

type ProfessorAreaMap = Readonly<Record<ProfessorArea, ProfessorAreaInfo>>;

export const ProfessorAreaData: ProfessorAreaMap = Object.freeze({
    [ProfessorArea.Math]: {
        id: ProfessorArea.Math,
        displayName: 'Matemática',
        icon: ProfessorAreaIcon.Math,
    },
    [ProfessorArea.Physics]: {
        id: ProfessorArea.Physics,
        displayName: 'Física',
        icon: ProfessorAreaIcon.Physics,
    },
    [ProfessorArea.Chemistry]: {
        id: ProfessorArea.Chemistry,
        displayName: 'Química',
        icon: ProfessorAreaIcon.Chemistry,
    },
});

export const ProfessorAreaList: ProfessorAreaInfo[] = Object.values(ProfessorAreaData);

export interface ProfessorAreaInfo {
    readonly id: ProfessorArea | 'all';
    readonly displayName: string; // Portuguese label
    readonly icon: ProfessorAreaIcon;
}

export function getAreaDisplayName(area: ProfessorArea | 'all'): string {
    if (area === 'all') {
        return 'Todos';
    }
    return ProfessorAreaData[area].displayName;
}
