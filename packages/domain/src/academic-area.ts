export enum AcademicArea {
    Math = 'math',
    Physics = 'physics',
    Chemistry = 'chemistry',
}

export enum AcademicAreaIcon {
    All = 'ri-team-line',
    Math = 'ri-calculator-line',
    Physics = 'ri-atom-line',
    Chemistry = 'ri-test-tube-line',
}

export interface AcademicAreaInfo {
    readonly id: AcademicArea | 'all';
    readonly displayName: string; // Portuguese label
    readonly icon: AcademicAreaIcon;
}

type AcademicAreaMap = Readonly<Record<AcademicArea, AcademicAreaInfo>>;

export const AcademicAreaData: AcademicAreaMap = Object.freeze({
    [AcademicArea.Math]: {
        id: AcademicArea.Math,
        displayName: 'Matemática',
        icon: AcademicAreaIcon.Math,
    },
    [AcademicArea.Physics]: {
        id: AcademicArea.Physics,
        displayName: 'Física',
        icon: AcademicAreaIcon.Physics,
    },
    [AcademicArea.Chemistry]: {
        id: AcademicArea.Chemistry,
        displayName: 'Química',
        icon: AcademicAreaIcon.Chemistry,
    },
});

export const AcademicAreaList: AcademicAreaInfo[] = Object.values(AcademicAreaData);

export function getAreaDisplayName(area: AcademicArea | 'all'): string {
    if (area === 'all') {
        return 'Todos';
    }
    return AcademicAreaData[area].displayName;
}
