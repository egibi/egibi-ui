import { EntityBase } from "./entity-base.model";

export class Account implements EntityBase{
    id: number;
    name: string;
    description: string;
    notes: string;
    isActive: boolean;
    createdAt: Date;
    lastModifiedAt: Date;
    username: string;
    password: string;
}