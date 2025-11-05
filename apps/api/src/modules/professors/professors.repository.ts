import type { EntityId, Professor } from '@daext/domain';

export interface ListProfessorsFilter {
    search?: string;
    area?: string;
}

export interface ProfessorsRepository {
    list(filter?: ListProfessorsFilter): Promise<Professor[]>;
    findById(id: EntityId): Promise<Professor | null>;
    create(professor: Professor): Promise<Professor>;
    update(id: EntityId, professor: Professor): Promise<Professor>;
    delete(id: EntityId): Promise<void>;
}
