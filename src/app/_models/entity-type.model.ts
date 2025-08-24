export class EntityType {
  id: number;
  name: string;
  description: string;
  notes: string;
  tableName: string;
  isActive: boolean;
  createdAt?: Date | null;
  lastModifiedAt?: Date | null;
}
