export class EntityBase {
  id: number = 0;
  name: string = '';
  description: string = '';
  notes: string = '';
  isActive: boolean = true;
  createdAt: Date = new Date();
  lastModifiedAt: Date = new Date();
  isNew: boolean = true;

  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.notes = '';
    this.isActive = true;
    this.createdAt = new Date();
    this.lastModifiedAt = new Date();
    this.isNew = true;
  }
}
