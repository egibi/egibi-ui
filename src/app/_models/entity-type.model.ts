export class EntityType {
  id: number = 0;
  name: string = '';
  description: string = '';
  notes: string = '';
  tableName: string = '';
  isActive: boolean = true;
  createdAt?: Date | null = null;
  lastModifiedAt?: Date | null = null;

  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.notes = '';
    this.tableName = '';
    this.isActive = true;
    this.createdAt = null;
    this.lastModifiedAt = null;
  }
}
