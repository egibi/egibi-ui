import { EntityBase } from "./entity-base.model";
import { AccountType } from "./account-type";
export class Account extends EntityBase{
    user:string;
    url: string;
    accountType: AccountType
}