import { EntityBase } from "./entity-base.model";
export class AccountUser extends EntityBase{
    email: string;
    firstName:string;
    lastName:string;
    phoneNumber:string;
}